import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTranslation, translateText } from '@/hooks/useTranslation';
import { useStore } from '@/store/useStore';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    transcript: '',
    interimTranscript: '',
    isSupported: true,
    checkSupport: vi.fn(() => true),
    startRecognition: vi.fn(),
    stopRecognition: vi.fn(),
  }),
}));

describe('useTranslation hook', () => {
  beforeEach(() => {
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
    it('should translate English to Chinese', async () => {
      const result = await translateText('hello', 'en-US', 'zh-CN');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should translate Japanese to Chinese', async () => {
      const result = await translateText('こんにちは', 'ja-JP', 'zh-CN');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle empty text', async () => {
      expect(await translateText('', 'en-US', 'zh-CN')).toBe('');
      expect(await translateText('   ', 'en-US', 'zh-CN')).toBe('');
    });

    it('should return non-empty result for valid input', async () => {
      const result = await translateText('test translation', 'en-US', 'zh-CN');
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should trim whitespace before translation', async () => {
      const trimmedResult = await translateText('hello', 'en-US', 'zh-CN');
      const paddedResult = await translateText('  hello  ', 'en-US', 'zh-CN');
      expect(paddedResult).toBe(trimmedResult);
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
