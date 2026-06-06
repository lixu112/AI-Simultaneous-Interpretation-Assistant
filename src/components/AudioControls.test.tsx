import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioControls } from '@/components/AudioControls';
import { useStore } from '@/store/useStore';
import { act } from 'react';

// Mock hooks
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    isRecognitionSupported: true,
    isTranslating: false,
  }),
}));

vi.mock('@/hooks/useAudioRecorder', () => ({
  useAudioRecorder: () => ({
    isRecording: false,
    isPaused: false,
    error: null,
    startRecording: vi.fn().mockResolvedValue(undefined),
    stopRecording: vi.fn(),
    pauseRecording: vi.fn(),
    resumeRecording: vi.fn(),
    audioLevel: 0,
  }),
}));

describe('AudioControls 组件', () => {
  beforeEach(() => {
    act(() => {
      useStore.setState({
        isRecording: false,
        isPaused: false,
        currentSource: 'microphone',
        sourceLanguage: 'en-US',
        targetLanguage: 'zh-CN',
        speechRate: 1.0,
        speechVolume: 1.0,
      });
    });
  });

  describe('渲染', () => {
    it('应该正确渲染音频控制标题', () => {
      render(<AudioControls />);
      expect(screen.getByText('音频控制')).toBeInTheDocument();
    });

    it('应该正确渲染音频源选择', () => {
      render(<AudioControls />);
      expect(screen.getByText('音频输入源')).toBeInTheDocument();
    });

    it('应该正确渲染麦克风选项', () => {
      render(<AudioControls />);
      expect(screen.getByText('麦克风')).toBeInTheDocument();
    });

    it('应该正确渲染音频文件选项', () => {
      render(<AudioControls />);
      expect(screen.getByText('音频文件')).toBeInTheDocument();
    });

    it('应该正确渲染源语言选择', () => {
      render(<AudioControls />);
      expect(screen.getByText('源语言')).toBeInTheDocument();
    });

    it('应该正确渲染目标语言选择', () => {
      render(<AudioControls />);
      expect(screen.getByText('目标语言')).toBeInTheDocument();
    });

    it('应该正确渲染语音设置', () => {
      render(<AudioControls />);
      expect(screen.getByText('语音设置')).toBeInTheDocument();
    });

    it('应该正确渲染开始翻译按钮', () => {
      render(<AudioControls />);
      expect(screen.getByText('开始翻译')).toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('应该能点击开始翻译按钮', async () => {
      render(<AudioControls />);
      const startButton = screen.getByText('开始翻译');
      // 验证按钮可以被点击且不会报错
      fireEvent.click(startButton);
    });

    it('应该在选择音频源时调用 setSource', () => {
      const setSourceSpy = vi.spyOn(useStore.getState(), 'setSource');
      render(<AudioControls />);
      const fileButton = screen.getByText('音频文件');
      fireEvent.click(fileButton);
      expect(setSourceSpy).toHaveBeenCalledWith('file');
    });

    it('应该在更改源语言时调用 setLanguage', () => {
      const setLanguageSpy = vi.spyOn(useStore.getState(), 'setLanguage');
      render(<AudioControls />);
      const sourceSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(sourceSelect, { target: { value: 'ja-JP' } });
      expect(setLanguageSpy).toHaveBeenCalledWith('ja-JP', 'zh-CN');
    });

    it('应该在更改目标语言时调用 setLanguage', () => {
      const setLanguageSpy = vi.spyOn(useStore.getState(), 'setLanguage');
      render(<AudioControls />);
      const targetSelect = screen.getAllByRole('combobox')[1];
      fireEvent.change(targetSelect, { target: { value: 'en-US' } });
      expect(setLanguageSpy).toHaveBeenCalledWith('en-US', 'en-US');
    });
  });
});
