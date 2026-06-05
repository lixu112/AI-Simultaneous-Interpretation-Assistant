import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useStore } from '@/store/useStore';

describe('useStore', () => {
  beforeEach(() => {
    act(() => {
      useStore.setState({
        isRecording: false,
        isPaused: false,
        currentSource: 'microphone',
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
      });
    });
  });

  describe('状态初始化', () => {
    it('应该正确初始化所有状态', () => {
      const state = useStore.getState();
      expect(state.isRecording).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.currentSource).toBe('microphone');
      expect(state.sourceLanguage).toBe('en-US');
      expect(state.targetLanguage).toBe('zh-CN');
      expect(state.records).toEqual([]);
      expect(state.sentenceCount).toBe(0);
    });
  });

  describe('音频源设置', () => {
    it('应该正确设置音频源', () => {
      act(() => {
        useStore.getState().setSource('file');
      });
      expect(useStore.getState().currentSource).toBe('file');
    });
  });

  describe('语言设置', () => {
    it('应该正确设置源语言和目标语言', () => {
      act(() => {
        useStore.getState().setLanguage('ja-JP', 'zh-CN');
      });
      const state = useStore.getState();
      expect(state.sourceLanguage).toBe('ja-JP');
      expect(state.targetLanguage).toBe('zh-CN');
    });
  });

  describe('录音状态', () => {
    it('应该正确设置录音状态', () => {
      act(() => {
        useStore.getState().setRecording(true);
      });
      const state = useStore.getState();
      expect(state.isRecording).toBe(true);
      expect(state.startTime).not.toBeNull();
    });

    it('应该正确设置暂停状态', () => {
      act(() => {
        useStore.getState().setPaused(true);
      });
      expect(useStore.getState().isPaused).toBe(true);
    });
  });

  describe('字幕状态', () => {
    it('应该正确设置当前字幕', () => {
      act(() => {
        useStore.getState().setCurrentCaption('Hello', '你好');
      });
      const state = useStore.getState();
      expect(state.currentOriginal).toBe('Hello');
      expect(state.currentTranslation).toBe('你好');
    });
  });

  describe('翻译记录', () => {
    it('应该正确添加翻译记录', () => {
      const record = {
        id: 'test-record-1',
        original: 'Thank you',
        translated: '谢谢',
        timestamp: Date.now(),
        corrected: false,
      };
      act(() => {
        useStore.getState().addRecord(record);
      });
      const state = useStore.getState();
      expect(state.records).toHaveLength(1);
      expect(state.records[0].original).toBe('Thank you');
      expect(state.sentenceCount).toBe(1);
    });

    it('应该正确修正翻译记录', () => {
      const record = {
        id: 'test-record-2',
        original: 'Good morning',
        translated: '早晨好',
        timestamp: Date.now(),
        corrected: false,
      };
      act(() => {
        useStore.getState().addRecord(record);
        useStore.getState().correctRecord('test-record-2', {
          field: 'translated',
          before: '早晨好',
          after: '早上好',
          timestamp: Date.now(),
        });
      });
      const state = useStore.getState();
      expect(state.records[0].corrected).toBe(true);
    });
  });

  describe('语音设置', () => {
    it('应该正确设置语速和音量', () => {
      act(() => {
        useStore.getState().setSpeechSettings(0.8, 0.9);
      });
      const state = useStore.getState();
      expect(state.speechRate).toBe(0.8);
      expect(state.speechVolume).toBe(0.9);
    });
  });

  describe('设置面板', () => {
    it('应该正确切换设置面板显示', () => {
      act(() => {
        useStore.getState().setShowSettings(true);
      });
      expect(useStore.getState().showSettings).toBe(true);
    });
  });

  describe('重置功能', () => {
    it('应该正确重置所有状态', () => {
      act(() => {
        useStore.getState().setRecording(true);
        useStore.getState().setShowSettings(true);
        useStore.getState().reset();
      });
      const state = useStore.getState();
      expect(state.isRecording).toBe(false);
      expect(state.showSettings).toBe(false);
      expect(state.records).toEqual([]);
    });
  });
});
