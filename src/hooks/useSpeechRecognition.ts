import { useCallback, useRef, useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [networkError, setNetworkError] = useState(false);
  const {
    sourceLanguage,
    isRecording,
    isPaused,
  } = useStore();

  // 初始化时检查支持
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  const checkSupport = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
    return !!SpeechRecognitionAPI;
  }, []);

  const startRecognition = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition not supported');
      return;
    }

    // 重置网络错误状态
    setNetworkError(false);
    setTranscript('');
    setInterimTranscript('');

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = sourceLanguage;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interim += text;
        }
      }

      // 更新最终结果
      if (finalTranscript) {
        setTranscript(finalTranscript.trim());
        setInterimTranscript(''); // 清空临时结果
      }
      
      // 更新临时结果（实时显示）
      if (interim) {
        setInterimTranscript(interim.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'network') {
        console.warn('网络错误：语音识别需要网络连接');
        setNetworkError(true);
      } else if (event.error === 'aborted') {
        // 正常停止，忽略
      } else if (event.error === 'no-speech') {
        // 没有检测到语音，可能用户还没说话
        setNetworkError(false);
      } else {
        console.error('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      if (isRecording && !isPaused && !networkError) {
        try {
          recognition.start();
        } catch {
          // Ignore restart errors
        }
      }
    };

    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [sourceLanguage, isRecording, isPaused, networkError]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setTranscript('');
    setInterimTranscript('');
    setNetworkError(false);
  }, []);

  return {
    transcript,
    interimTranscript,
    isSupported,
    networkError,
    checkSupport,
    startRecognition,
    stopRecognition,
  };
}
