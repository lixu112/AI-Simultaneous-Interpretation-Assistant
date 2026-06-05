import { useCallback, useEffect, useRef } from 'react';
import { useStore, TranslationRecord } from '@/store/useStore';
import { useSpeechRecognition } from './useSpeechRecognition';

// 语言代码映射
const languageMap: Record<string, string> = {
  'en-US': 'en',
  'zh-CN': 'zh-CN',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'es-ES': 'es',
  'ru-RU': 'ru',
};

// 翻译缓存
const translationCache = new Map<string, string>();

// 术语缓存 - 从历史记录中学习
const terminologyCache = new Map<string, string>(); // 原文术语 -> 译文术语
const MAX_TERMINOLOGY_SIZE = 200; // 最多保存200个术语
const TERMINOLOGY_STORAGE_KEY = 'ai-translator-terminology';
const TERMINOLOGY_EXPIRE_DAYS = 7; // 术语缓存过期时间（天）

// 术语存储数据结构
interface TermStorageData {
  terms: Array<{ key: string; value: string }>;
  timestamp: number;
}

// 从 localStorage 加载术语缓存
function loadTerminologyFromStorage(): void {
  try {
    const stored = localStorage.getItem(TERMINOLOGY_STORAGE_KEY);
    if (stored) {
      const data: TermStorageData = JSON.parse(stored);
      const expireTime = TERMINOLOGY_EXPIRE_DAYS * 24 * 60 * 60 * 1000;
      
      // 检查是否过期
      if (Date.now() - data.timestamp < expireTime) {
        // 加载术语
        for (const { key, value } of data.terms) {
          terminologyCache.set(key, value);
        }
        console.log(`Loaded ${data.terms.length} terms from storage`);
      } else {
        // 过期了，清除旧数据
        localStorage.removeItem(TERMINOLOGY_STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error('Failed to load terminology from storage:', error);
  }
}

// 保存术语缓存到 localStorage
function saveTerminologyToStorage(): void {
  try {
    const data: TermStorageData = {
      terms: Array.from(terminologyCache.entries()).map(([key, value]) => ({ key, value })),
      timestamp: Date.now(),
    };
    localStorage.setItem(TERMINOLOGY_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save terminology to storage:', error);
  }
}

// 翻译请求队列
interface TranslationQueueItem {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  callback: (translated: string) => void;
}

const translationQueue: TranslationQueueItem[] = [];
let isProcessingQueue = false;

// 处理翻译队列
async function processTranslationQueue(): Promise<void> {
  if (isProcessingQueue) return;
  if (translationQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (translationQueue.length > 0) {
    const item = translationQueue.shift()!;
    
    try {
      const translated = await translateTextCore(item.text, item.sourceLanguage, item.targetLanguage);
      item.callback(translated);
    } catch (error) {
      console.error('Queue translation error:', error);
      item.callback(item.text);
    }
    
    // 避免连续请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  isProcessingQueue = false;
}

// 添加到翻译队列
function addToTranslationQueue(text: string, sourceLanguage: string, targetLanguage: string, callback: (translated: string) => void): void {
  // 检查队列中是否已有相同文本（避免重复请求）
  const isDuplicate = translationQueue.some(item => item.text === text);
  if (isDuplicate) {
    return;
  }
  
  translationQueue.push({ text, sourceLanguage, targetLanguage, callback });
  processTranslationQueue();
}

// 核心翻译函数（不包含队列逻辑）
async function translateTextCore(
  text: string, 
  from: string, 
  to: string
): Promise<string> {
  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  
  if (!cleanText) {
    return '';
  }

  const cacheKey = `${from}:${to}:${cleanText}`;
  
  // 检查缓存
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const fromLang = languageMap[from] || from;
    const toLang = languageMap[to] || to;
    
    // 尝试使用上下文术语优化翻译
    let textToTranslate = cleanText;
    let replacements: Array<{ original: string; placeholder: string }> = [];
    
    if (terminologyCache.size > 0) {
      const { marked, replacements: repl } = markTermsInText(cleanText);
      if (repl.length > 0) {
        textToTranslate = marked;
        replacements = repl;
      }
    }
    
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${fromLang}|${toLang}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData) {
      let translatedText = data.responseData.translatedText;
      
      if (replacements.length > 0) {
        translatedText = restoreTerms(translatedText, replacements);
      }
      
      // 存入缓存
      if (translationCache.size > 500) {
        const firstKey = translationCache.keys().next().value;
        translationCache.delete(firstKey);
      }
      translationCache.set(cacheKey, translatedText);
      
      // 学习新术语
      extractTerms(cleanText, translatedText);
      
      return translatedText;
    } else {
      return cleanText;
    }
  } catch (error) {
    console.error('Translation failed:', error);
    return cleanText;
  }
}

// 提取术语 - 从句子中识别有价值的术语（2-3个单词的词组）
function extractTerms(original: string, translated: string): void {
  const cleanOriginal = original.trim();
  const cleanTranslated = translated.trim();
  
  if (!cleanOriginal || !cleanTranslated || cleanOriginal.length < 3 || cleanTranslated.length < 2) {
    return;
  }

  const words = cleanOriginal.split(/\s+/).filter(w => w.length > 2);
  
  for (let i = 0; i < words.length; i++) {
    // 2个单词的词组
    if (i < words.length - 1) {
      const twoWord = `${words[i]} ${words[i + 1]}`.toLowerCase();
      if (!terminologyCache.has(twoWord)) {
        addTermToCache(twoWord, extractCorrespondingTranslation(cleanOriginal, cleanTranslated, twoWord));
      }
    }
    
    // 3个单词的词组
    if (i < words.length - 2) {
      const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`.toLowerCase();
      if (!terminologyCache.has(threeWord)) {
        addTermToCache(threeWord, extractCorrespondingTranslation(cleanOriginal, cleanTranslated, threeWord));
      }
    }
  }
}

// 从译文中提取对应术语的翻译
function extractCorrespondingTranslation(original: string, translated: string, term: string): string {
  return translated;
}

// 添加术语到缓存（同时保存到 localStorage）
function addTermToCache(term: string, translation: string): void {
  if (terminologyCache.size >= MAX_TERMINOLOGY_SIZE) {
    const firstKey = terminologyCache.keys().next().value;
    terminologyCache.delete(firstKey);
  }
  terminologyCache.set(term, translation);
  saveTerminologyToStorage(); // 保存到 localStorage
}

// 标记文本中的术语
function markTermsInText(text: string): { marked: string; replacements: Array<{ original: string; placeholder: string }> } {
  const replacements: Array<{ original: string; placeholder: string }> = [];
  let markedText = text;
  
  const sortedTerms = Array.from(terminologyCache.keys())
    .sort((a, b) => b.length - a.length);
  
  let counter = 0;
  for (const term of sortedTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    markedText = markedText.replace(regex, (match) => {
      const placeholder = `__TERM_${counter}__`;
      replacements.push({ original: match, placeholder });
      counter++;
      return placeholder;
    });
  }
  
  return { marked: markedText, replacements };
}

// 还原标记的术语
function restoreTerms(text: string, replacements: Array<{ original: string; placeholder: string }>): string {
  let result = text;
  for (const { original, placeholder } of replacements) {
    result = result.replace(placeholder, original);
  }
  return result;
}

// 对外暴露的翻译函数
export async function translateText(
  text: string, 
  from: string, 
  to: string
): Promise<string> {
  return translateTextCore(text, from, to);
}

// 手动添加修正后的术语（用于自动纠正）
export function addCorrectedTerm(original: string, translated: string): void {
  const cleanOriginal = original.trim().toLowerCase();
  const cleanTranslated = translated.trim();
  
  if (cleanOriginal && cleanTranslated) {
    addTermToCache(cleanOriginal, cleanTranslated);
  }
}

// 初始化术语缓存（在模块加载时执行）
loadTerminologyFromStorage();

export function useTranslation() {
  const {
    sourceLanguage,
    targetLanguage,
    isRecording,
    isPaused,
    addRecord,
    setCurrentCaption,
    records,
  } = useStore();

  const { 
    transcript, 
    interimTranscript,
    startRecognition, 
    stopRecognition, 
    isSupported: isRecognitionSupported, 
    checkSupport, 
    networkError 
  } = useSpeechRecognition();

  const lastTranscriptRef = useRef<string>('');
  const translateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化术语缓存 - 从历史记录中加载
  useEffect(() => {
    if (records.length > 0) {
      const recentRecords = records.slice(0, 20);
      for (const record of recentRecords) {
        extractTerms(record.original, record.translated);
      }
    }
  }, [records]);

  // 处理翻译（使用队列）
  const processTranslation = useCallback((text: string) => {
    if (!text || !isRecording || isPaused) return;

    // 添加到翻译队列
    addToTranslationQueue(
      text, 
      sourceLanguage, 
      targetLanguage, 
      (translated: string) => {
        // 添加到历史记录并更新字幕
        if (text !== lastTranscriptRef.current) {
          const record: TranslationRecord = {
            id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            original: text,
            translated,
            timestamp: Date.now(),
            corrected: false,
          };
          addRecord(record);
          lastTranscriptRef.current = text;
        }
        
        // 更新当前显示
        setCurrentCaption(text, translated);
      }
    );
  }, [sourceLanguage, targetLanguage, isRecording, isPaused, addRecord, setCurrentCaption]);

  // 监听识别结果
  useEffect(() => {
    if (!transcript && !interimTranscript) return;

    // 临时识别结果只显示原文，不翻译
    if (interimTranscript) {
      setCurrentCaption(interimTranscript, '');
    }

    // 只在最终识别结果时进行翻译
    if (transcript && transcript !== lastTranscriptRef.current) {
      if (translateTimerRef.current) {
        clearTimeout(translateTimerRef.current);
      }
      
      // 使用队列处理翻译
      processTranslation(transcript);
    }

    return () => {
      if (translateTimerRef.current) {
        clearTimeout(translateTimerRef.current);
      }
    };
  }, [transcript, interimTranscript, processTranslation, setCurrentCaption]);

  const start = useCallback(() => {
    if (!checkSupport()) {
      alert('您的浏览器不支持语音识别');
      return;
    }
    lastTranscriptRef.current = '';
    startRecognition();
  }, [checkSupport, startRecognition]);

  const stop = useCallback(() => {
    stopRecognition();
    if (translateTimerRef.current) {
      clearTimeout(translateTimerRef.current);
    }
  }, [stopRecognition]);

  return {
    start,
    stop,
    isRecognitionSupported,
    networkError,
  };
}
