import { AudioControls } from '@/components/AudioControls';
import { CaptionDisplay } from '@/components/CaptionDisplay';
import { Settings } from '@/components/Settings';
import { useStore } from '@/store/useStore';
import { Languages } from 'lucide-react';

function App() {
  const { isRecording, isPaused, sentenceCount, startTime } = useStore();

  const getElapsedTime = () => {
    if (!startTime) return '00:00:00';
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-dark text-light font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-pink/10 rounded-full blur-3xl animate-pulse-slow" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-cyan rounded-xl flex items-center justify-center">
                  <Languages className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent-cyan rounded-xl blur opacity-30" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent">
                  AI 同声传译助手
                </h1>
                <p className="text-xs text-light-muted">实时语音翻译 · 智能字幕</p>
              </div>
            </div>
            
            {isRecording && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-light-muted">{isPaused ? '已暂停' : '录音中'}</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-light-muted">已翻译 {sentenceCount} 句</span>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-light-muted font-mono">{getElapsedTime()}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-4 xl:col-span-3">
            <AudioControls />
          </div>

          {/* Right Panel - Caption Display */}
          <div className="lg:col-span-8 xl:col-span-9">
            <CaptionDisplay />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-4 py-3">
          <p className="text-center text-xs text-light-muted">
            AI 同声传译助手 · 基于 Web Speech API 构建
          </p>
        </div>
      </footer>

      {/* Settings Modal */}
      <Settings />
    </div>
  );
}

export default App;
