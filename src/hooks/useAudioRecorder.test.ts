import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useStore } from '@/store/useStore';
import { renderHook, act } from '@testing-library/react';

// 模拟 MediaRecorder API
class MockMediaRecorder {
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  stream: MediaStream = {
    getTracks: vi.fn(() => [{ stop: vi.fn() }]),
  } as any;
  ondataavailable: ((event: any) => void) | null = null;
  onstop: (() => void) | null = null;
  start = vi.fn(() => {
    this.state = 'recording';
  });
  stop = vi.fn(() => {
    this.state = 'inactive';
  });
  pause = vi.fn(() => {
    this.state = 'paused';
  });
  resume = vi.fn(() => {
    this.state = 'recording';
  });
}

describe('useAudioRecorder hook', () => {
  beforeEach(() => {
    // 模拟 MediaRecorder
    (window as any).MediaRecorder = MockMediaRecorder;
    
    // 模拟 navigator.mediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: vi.fn(() => [{ stop: vi.fn() }]),
        }),
      },
      writable: true,
    });
    
    // 模拟 AudioContext
    class MockAudioContext {
      createAnalyser = vi.fn(() => ({
        fftSize: 256,
        connect: vi.fn(),
        getByteFrequencyData: vi.fn(() => new Uint8Array(128)),
      }));
      createMediaStreamSource = vi.fn(() => ({
        connect: vi.fn(),
      }));
      close = vi.fn();
    }
    (window as any).AudioContext = MockAudioContext;
    
    // 重置 store
    act(() => {
      useStore.setState({
        currentSource: 'microphone',
      });
    });
    
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useAudioRecorder());
      expect(result.current.isRecording).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.audioLevel).toBe(0);
    });
  });

  describe('recording controls', () => {
    it('should start recording successfully', async () => {
      const { result } = renderHook(() => useAudioRecorder());
      
      await act(async () => {
        await result.current.startRecording();
      });
      
      // 验证状态更新
      expect(result.current.isRecording).toBe(true);
    });

    it('should stop recording successfully', async () => {
      const { result } = renderHook(() => useAudioRecorder());
      
      await act(async () => {
        await result.current.startRecording();
      });
      
      act(() => {
        result.current.stopRecording();
      });
      
      expect(result.current.isRecording).toBe(false);
    });

    it('should pause and resume recording', async () => {
      const { result } = renderHook(() => useAudioRecorder());
      
      await act(async () => {
        await result.current.startRecording();
      });
      
      act(() => {
        result.current.pauseRecording();
      });
      
      expect(result.current.isPaused).toBe(true);
      
      act(() => {
        result.current.resumeRecording();
      });
      
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle errors when starting recording fails', async () => {
      // 模拟启动失败
      (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(
        new Error('Some error')
      );
      
      const { result } = renderHook(() => useAudioRecorder());
      
      await act(async () => {
        await result.current.startRecording();
      });
      
      expect(result.current.error).toBeDefined();
    });
  });
});
