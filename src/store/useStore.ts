import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 翻译记录
export interface TranslationRecord {
  id: string;
  original: string;
  translated: string;
  timestamp: number;
  corrected: boolean;
  corrections?: Correction[];
}

// 修正记录
export interface Correction {
  field: 'original' | 'translated';
  before: string;
  after: string;
  timestamp: number;
}

// 音频输入类型
export type AudioSource = 'microphone' | 'file' | 'system';

// 语言选项
export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: '英语', nativeName: 'English' },
  { code: 'ja-JP', name: '日语', nativeName: '日本語' },
  { code: 'ko-KR', name: '韩语', nativeName: '한국어' },
  { code: 'fr-FR', name: '法语', nativeName: 'Français' },
  { code: 'de-DE', name: '德语', nativeName: 'Deutsch' },
  { code: 'es-ES', name: '西班牙语', nativeName: 'Español' },
  { code: 'ru-RU', name: '俄语', nativeName: 'Русский' },
  { code: 'zh-CN', name: '中文', nativeName: '中文' },
];

export const TARGET_LANGUAGES: LanguageOption[] = [
  { code: 'zh-CN', name: '中文', nativeName: '中文' },
  { code: 'en-US', name: '英语', nativeName: 'English' },
  { code: 'ja-JP', name: '日语', nativeName: '日本語' },
];

// 应用状态
interface AppState {
  // 状态
  isRecording: boolean;
  isPaused: boolean;
  currentSource: AudioSource;
  isSpeaking: boolean;

  // 语言
  sourceLanguage: string;
  targetLanguage: string;

  // 字幕
  currentOriginal: string;
  currentTranslation: string;
  records: TranslationRecord[];

  // 语音设置
  speechRate: number;
  speechVolume: number;

  // 计时
  startTime: number | null;
  sentenceCount: number;

  // 设置面板
  showSettings: boolean;

  // 动作
  setSource: (source: AudioSource) => void;
  setLanguage: (source: string, target: string) => void;
  setRecording: (isRecording: boolean) => void;
  setPaused: (isPaused: boolean) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setCurrentCaption: (original: string, translated: string) => void;
  addRecord: (record: TranslationRecord) => void;
  correctRecord: (id: string, correction: Correction) => void;
  setSpeechSettings: (rate: number, volume: number) => void;
  setShowSettings: (show: boolean) => void;
  reset: () => void;
}

const initialState = {
  isRecording: false,
  isPaused: false,
  currentSource: 'microphone' as AudioSource,
  isSpeaking: false,
  sourceLanguage: 'en-US',
  targetLanguage: 'zh-CN',
  currentOriginal: '',
  currentTranslation: '',
  records: [],
  speechRate: 1.0,
  speechVolume: 1.0,
  startTime: null,
  sentenceCount: 0,
  showSettings: false,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setSource: (source) => set({ currentSource: source }),

      setLanguage: (source, target) => set({ sourceLanguage: source, targetLanguage: target }),

      setRecording: (isRecording) => set((state) => ({
        isRecording,
        startTime: isRecording ? (state.startTime || Date.now()) : null,
        currentOriginal: isRecording ? '' : state.currentOriginal,
        currentTranslation: isRecording ? '' : state.currentTranslation,
        isPaused: false,
      })),

      setPaused: (isPaused) => set({ isPaused }),

      setSpeaking: (isSpeaking) => set({ isSpeaking }),

      setCurrentCaption: (original, translated) => set({ currentOriginal: original, currentTranslation: translated }),

      addRecord: (record) => set((state) => ({
        records: [record, ...state.records].slice(0, 500),
        sentenceCount: state.sentenceCount + 1,
      })),

      correctRecord: (id, correction) => set((state) => ({
        records: state.records.map((r) =>
          r.id === id
            ? { ...r, corrected: true, corrections: [...(r.corrections || []), correction] }
            : r
        ),
      })),

      setSpeechSettings: (rate, volume) => set({ speechRate: rate, speechVolume: volume }),

      setShowSettings: (show) => set({ showSettings: show }),

      reset: () => set(initialState),
    }),
    {
      name: 'ai-translator-storage',
      partialize: (state) => ({
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
        speechRate: state.speechRate,
        speechVolume: state.speechVolume,
      }),
    }
  )
);
