import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

describe('App 组件', () => {
  it('应该正确渲染标题', () => {
    render(<App />);
    expect(screen.getByText('AI 同声传译助手')).toBeInTheDocument();
  });

  it('应该正确渲染副标题', () => {
    render(<App />);
    expect(screen.getByText('实时语音翻译 · 智能字幕')).toBeInTheDocument();
  });

  it('应该正确渲染背景效果', () => {
    render(<App />);
    const background = screen.getByText('AI 同声传译助手').closest('div')?.parentElement;
    expect(background).toBeTruthy();
  });
});
