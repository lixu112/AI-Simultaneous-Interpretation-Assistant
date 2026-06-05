import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaptionDisplay } from '@/components/CaptionDisplay';
import { useStore } from '@/store/useStore';
import { act } from 'react';

describe('CaptionDisplay 组件', () => {
  beforeEach(() => {
    act(() => {
      useStore.setState({
        isRecording: false,
        isPaused: false,
        currentOriginal: '',
        currentTranslation: '',
        records: [],
      });
    });
  });

  describe('无内容状态', () => {
    it('应该在无内容时显示等待提示', () => {
      render(<CaptionDisplay />);
      expect(screen.getByText('等待语音输入...')).toBeInTheDocument();
    });

    it('应该在无内容时显示操作提示', () => {
      render(<CaptionDisplay />);
      expect(screen.getByText('点击"开始翻译"按钮开始实时翻译')).toBeInTheDocument();
    });
  });

  describe('字幕显示', () => {
    it('应该正确显示当前原文', () => {
      act(() => {
        useStore.setState({
          currentOriginal: 'Hello World',
          currentTranslation: '你好世界',
        });
      });
      render(<CaptionDisplay />);
      expect(screen.getByText('原文')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('应该正确显示当前译文', () => {
      act(() => {
        useStore.setState({
          currentOriginal: 'Hello World',
          currentTranslation: '你好世界',
        });
      });
      render(<CaptionDisplay />);
      expect(screen.getByText('译文')).toBeInTheDocument();
      expect(screen.getByText('你好世界')).toBeInTheDocument();
    });
  });

  describe('翻译历史', () => {
    it('应该在有历史记录时显示记录数量', () => {
      act(() => {
        useStore.setState({
          records: [
            {
              id: 'test-1',
              original: 'First record',
              translated: '第一条记录',
              timestamp: Date.now(),
              corrected: false,
            },
          ],
        });
      });
      render(<CaptionDisplay />);
      expect(screen.getByText('1 条记录')).toBeInTheDocument();
    });

    it('应该正确显示翻译历史记录', () => {
      const testRecord = {
        id: 'test-2',
        original: 'Thank you',
        translated: '谢谢',
        timestamp: Date.now(),
        corrected: false,
      };
      act(() => {
        useStore.setState({ records: [testRecord] });
      });
      render(<CaptionDisplay />);
      expect(screen.getByText('Thank you')).toBeInTheDocument();
      expect(screen.getByText('谢谢')).toBeInTheDocument();
    });

    it('应该在记录被修正时显示修正标记', () => {
      act(() => {
        useStore.setState({
          records: [
            {
              id: 'test-3',
              original: 'Good morning',
              translated: '早上好',
              timestamp: Date.now(),
              corrected: true,
            },
          ],
        });
      });
      render(<CaptionDisplay />);
      expect(screen.getByText('(已修正)')).toBeInTheDocument();
    });
  });
});
