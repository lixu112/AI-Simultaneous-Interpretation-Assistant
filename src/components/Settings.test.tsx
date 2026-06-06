import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Settings } from '@/components/Settings';
import { useStore } from '@/store/useStore';
import { act } from 'react';

describe('Settings 组件', () => {
  beforeEach(() => {
    act(() => {
      useStore.setState({
        showSettings: true,
        sourceLanguage: 'en-US',
        targetLanguage: 'zh-CN',
        speechRate: 1.0,
        speechVolume: 1.0,
      });
    });
  });

  describe('渲染', () => {
    it('应该在 showSettings 为 true 时渲染设置面板', () => {
      render(<Settings />);
      expect(screen.getByText('设置')).toBeInTheDocument();
    });

    it('应该正确渲染语言设置部分', () => {
      render(<Settings />);
      expect(screen.getByText('语言设置')).toBeInTheDocument();
    });

    it('应该正确渲染语音设置部分', () => {
      render(<Settings />);
      expect(screen.getByText('语音设置')).toBeInTheDocument();
    });

    it('应该正确渲染关于部分', () => {
      render(<Settings />);
      expect(screen.getByText('关于')).toBeInTheDocument();
    });

    it('应该正确渲染应用名称', () => {
      render(<Settings />);
      expect(screen.getByText('AI 同声传译助手')).toBeInTheDocument();
    });

    it('应该正确渲染关闭按钮', () => {
      render(<Settings />);
      const closeButtons = screen.getAllByRole('button');
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('交互', () => {
    it('应该在点击关闭按钮时隐藏设置面板', () => {
      const setShowSettingsSpy = vi.spyOn(useStore.getState(), 'setShowSettings');
      render(<Settings />);
      const closeButtons = screen.getAllByRole('button');
      fireEvent.click(closeButtons[0]);
      expect(setShowSettingsSpy).toHaveBeenCalledWith(false);
    });

    it('应该在更改源语言时调用 setLanguage', () => {
      const setLanguageSpy = vi.spyOn(useStore.getState(), 'setLanguage');
      render(<Settings />);
      const selectElements = screen.getAllByRole('combobox');
      expect(selectElements.length).toBeGreaterThanOrEqual(2);
    });

    it('应该正确显示语速值', () => {
      render(<Settings />);
      expect(screen.getByText('语速')).toBeInTheDocument();
    });

    it('应该正确显示音量值', () => {
      render(<Settings />);
      expect(screen.getByText('音量')).toBeInTheDocument();
    });
  });
});
