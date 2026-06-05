import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTranslation, translateText } from '@/hooks/useTranslation';
import { useStore } from '@/store/useStore';
import { renderHook, act } from '@testing-library/react';

// 模拟相关 hook
vi.mock('@/hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    transcript: '',
    isSupported: true,
    checkSupport: vi.fn(() => true),
    startRecognition: vi.fn(),
    stopRecognition: vi.fn(),
  }),
}));

vi.mock('@/hooks/useSpeechSynthesis', () => ({
  useSpeechSynthesis: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
  }),
}));

describe('useTranslation hook', () => {
  beforeEach(() => {
    // 重置 store
    act(() => {
      useStore.setState({
        isRecording: false,
        isPaused: false,
        currentOriginal: '',
        currentTranslation: '',
        records: [],
        sourceLanguage: 'en-US',
        targetLanguage: 'zh-CN',
      });
    });
    vi.clearAllMocks();
  });

  describe('translateText', () => {
    it('should translate common English phrases to Chinese', async () => {
      expect(await translateText('hello', 'en-US', 'zh-CN')).toBe('你好');
      expect(await translateText('thank you', 'en-US', 'zh-CN')).toBe('谢谢');
      expect(await translateText('good morning', 'en-US', 'zh-CN')).toBe('早上好');
    });

    it('should translate common Japanese phrases to Chinese', async () => {
      expect(await translateText('こんにちは', 'ja-JP', 'zh-CN')).toBe('你好');
      expect(await translateText('ありがとう', 'ja-JP', 'zh-CN')).toBe('谢谢');
    });

    it('should return fallback translation for unknown phrases', async () => {
      const result = await translateText('some unknown phrase', 'en-US', 'zh-CN');
      expect(result).toContain('some unknown phrase');
    });

    it('should handle case insensitivity', async () => {
      expect(await translateText('HELLO', 'en-US', 'zh-CN')).toBe('你好');
      expect(await translateText('Thank You', 'en-US', 'zh-CN')).toBe('谢谢');
    });

    it('should trim whitespace before translation', async () => {
      expect(await translateText('  hello  ', 'en-US', 'zh-CN')).toBe('你好');
    });
  });

  describe('useTranslation functionality', () => {
    it('should start and stop translation without errors', () => {
      const { result } = renderHook(() => useTranslation());
      
      expect(() => {
        act(() => {
          result.current.start();
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.stop();
        });
      }).not.toThrow();
    });

    it('should return isRecognitionSupported', () => {
      const { result } = renderHook(() => useTranslation());
      expect(result.current.isRecognitionSupported).toBeDefined();
    });
  });
});
