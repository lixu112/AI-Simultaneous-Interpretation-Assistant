import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useStore } from '@/store/useStore';
import { renderHook, act } from '@testing-library/react';

// 模拟 Web Speech API
class MockSpeechRecognition {
  continuous = true;
  interimResults = true;
  lang = 'en-US';
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;
  onstart: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
}

describe('useSpeechRecognition hook', () => {
  beforeEach(() => {
    // 设置全局模拟
    window.SpeechRecognition = MockSpeechRecognition as any;
    window.webkitSpeechRecognition = MockSpeechRecognition as any;
    
    // 重置 store
    act(() => {
      useStore.setState({
        isRecording: false,
        isPaused: false,
        sourceLanguage: 'en-US',
      });
    });
    
    vi.clearAllMocks();
  });

  describe('support check', () => {
    it('should return true when SpeechRecognition is supported', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      expect(result.current.checkSupport()).toBe(true);
    });

    it('should return false when SpeechRecognition is not supported', () => {
      // 删除模拟
      (window as any).SpeechRecognition = undefined;
      (window as any).webkitSpeechRecognition = undefined;
      
      const { result } = renderHook(() => useSpeechRecognition());
      expect(result.current.checkSupport()).toBe(false);
    });
  });

  describe('transcript management', () => {
    it('should initialize transcript as empty string', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      expect(result.current.transcript).toBe('');
    });

    it('should clear transcript when stopping recognition', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      act(() => {
        result.current.stopRecognition();
      });
      expect(result.current.transcript).toBe('');
    });
  });

  describe('recognition controls', () => {
    it('should start recognition without errors', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      
      expect(() => {
        act(() => {
          result.current.startRecognition();
        });
      }).not.toThrow();
    });

    it('should stop recognition without errors', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      
      expect(() => {
        act(() => {
          result.current.stopRecognition();
        });
      }).not.toThrow();
    });
  });
});
