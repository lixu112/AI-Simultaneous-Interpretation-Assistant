import { useStore } from '@/store/useStore';
import { X, Globe, Volume2, Info } from 'lucide-react';

export function Settings() {
  const {
    showSettings,
    setShowSettings,
    sourceLanguage,
    targetLanguage,
    setLanguage,
    speechRate,
    speechVolume,
    setSpeechSettings,
  } = useStore();

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-lighter rounded-2xl w-full max-w-md border border-primary/20 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-lighter">
          <h2 className="text-lg font-semibold text-light flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            设置
          </h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-light-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Language Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-light flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              语言设置
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-light-muted">源语言</label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setLanguage(e.target.value, targetLanguage)}
                  className="w-full bg-dark/70 border border-dark-lighter rounded-lg px-3 py-2 text-light
                    focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                >
                  <option value="en-US">英语</option>
                  <option value="ja-JP">日语</option>
                  <option value="ko-KR">韩语</option>
                  <option value="fr-FR">法语</option>
                  <option value="de-DE">德语</option>
                  <option value="es-ES">西班牙语</option>
                  <option value="ru-RU">俄语</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-light-muted">目标语言</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setLanguage(sourceLanguage, e.target.value)}
                  className="w-full bg-dark/70 border border-dark-lighter rounded-lg px-3 py-2 text-light
                    focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                >
                  <option value="zh-CN">中文</option>
                  <option value="en-US">英语</option>
                  <option value="ja-JP">日语</option>
                </select>
              </div>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-light flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" />
              语音设置
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-light-muted">语速</span>
                  <span className="text-primary">{speechRate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechSettings(parseFloat(e.target.value), speechVolume)}
                  className="w-full h-2 bg-dark-lighter rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-light-muted">
                  <span>0.5x</span>
                  <span>2.0x</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-light-muted">音量</span>
                  <span className="text-primary">{Math.round(speechVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={speechVolume}
                  onChange={(e) => setSpeechSettings(speechRate, parseFloat(e.target.value))}
                  className="w-full h-2 bg-dark-lighter rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-light-muted">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-light flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              关于
            </h3>
            <div className="bg-dark/40 rounded-lg p-3 space-y-2">
              <p className="text-sm text-light">
                <span className="text-primary font-medium">AI 同声传译助手</span>
              </p>
              <p className="text-xs text-light-muted">
                版本 1.0.0
              </p>
              <p className="text-xs text-light-muted">
                基于 Web Speech API 实现实时语音识别与翻译
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
