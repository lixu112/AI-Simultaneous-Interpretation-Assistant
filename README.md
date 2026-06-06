# AI 同声传译助手

一款基于 Web Speech API 的实时语音翻译工具，帮助用户将英语（或其他外语）演讲、技术分享、国际会议或网课实时翻译成中文，以字幕或语音形式呈现。

## 视频演示

**Demo视频链接**：请在录制视频后，将链接添加到此处

- Bilibili: https://www.bilibili.com/video/BV1Jy7U6EE72/?spm_id_from=333.1387.list.card_archive.click&vd_source=74c0ffe8568a078a976a9a55f1e7c498
  
## 功能特点

- **实时语音识别** - 使用浏览器原生 Web Speech API 进行语音识别
- **实时翻译** - 支持多语言翻译（英语、日语、韩语等）
- **双语字幕** - 原文与译文对照显示，清晰易懂
- **语音播报** - 翻译结果可自动语音朗读
- **智能修正** - 支持手动修正识别或翻译错误
- **翻译历史** - 记录所有翻译内容，随时回顾

## 技术栈

- **框架**: React 18 + TypeScript
- **构建**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **语音**: Web Speech API

## 安装使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm run test

# 运行测试（单次）
npm run test:run
```

## 项目结构

```
src/
├── components/       # UI 组件
│   ├── AudioControls.tsx   # 音频控制组件
│   ├── CaptionDisplay.tsx  # 字幕显示组件
│   └── Settings.tsx       # 设置面板
├── hooks/            # 自定义 Hooks
│   ├── useSpeechRecognition.ts  # 语音识别
│   ├── useSpeechSynthesis.ts     # 语音合成
│   └── useTranslation.ts         # 翻译逻辑
├── store/            # 状态管理
│   └── useStore.ts   # Zustand Store
├── types/            # 类型定义
└── App.tsx           # 应用入口
```

## 使用说明

1. **选择音频源** - 可选择麦克风输入或音频文件
2. **选择语言** - 设置源语言和目标语言
3. **开始翻译** - 点击开始按钮，实时识别并翻译
4. **查看字幕** - 原文和译文同步显示在字幕区域
5. **修正错误** - 点击历史记录中的编辑按钮修正翻译

## 测试

项目使用 **Vitest** + **React Testing Library** 进行测试，包含以下测试用例：

- **Store 测试** - 状态管理测试（11 个用例）
- **翻译测试** - 翻译函数测试（8 个用例）
- **组件测试** - UI 组件渲染与交互测试（32 个用例）

共 **51 个测试用例**，所有测试已通过。

## 浏览器兼容性

需要浏览器支持 Web Speech API：
- Chrome 33+
- Edge 79+
- Safari 14.1+

## License

MIT
