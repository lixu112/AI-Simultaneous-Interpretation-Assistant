import { useState, useRef, useEffect } from 'react';
import { useStore, LANGUAGES, TARGET_LANGUAGES, AudioSource } from '@/store/useStore';
import { Mic, FileAudio, Volume2, Globe, Target, Play, Pause, Square, Settings, Upload, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

export function AudioControls() {
  const {
    currentSource,
    setSource,
    sourceLanguage,
    targetLanguage,
    setLanguage,
    isRecording,
    isPaused,
    setRecording,
    setPaused,
    speechRate,
    speechVolume,
    setSpeechSettings,
    setShowSettings,
    startTime,
    sentenceCount,
  } = useStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isFilePlaying, setIsFilePlaying] = useState(false);

  const { start, stop, isRecognitionSupported, networkError } = useTranslation();
  const { isRecording: isMicRecording, error: micError, startRecording, stopRecording, pauseRecording, resumeRecording, audioLevel } = useAudioRecorder();

  // 监听错误
  useEffect(() => {
    if (micError) {
      setRecordingError(micError);
    } else if (networkError) {
      setRecordingError('网络错误：语音识别需要稳定的网络连接，请检查您的网络');
    } else {
      setRecordingError(null);
    }
  }, [micError, networkError]);

  // 快捷键支持：Space键控制开始/暂停
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否按下了Space键
      if (event.code === 'Space' || event.key === ' ') {
        // 防止在input/textarea等元素中触发
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          return;
        }

        event.preventDefault();
        
        if (!isRecording) {
          // 未开始时，按Space开始翻译
          handleStart();
        } else {
          // 已开始时，按Space暂停/继续
          handlePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRecording, isPaused]);

  // 处理音频文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/mp4', 'audio/aac'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
        setRecordingError('请选择有效的音频文件（MP3、WAV、M4A、AAC、OGG）');
        return;
      }
      setSelectedFile(file);
      setRecordingError(null);
    }
  };

  // 创建音频播放器
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = url;
      } else {
        audioPlayerRef.current = new Audio(url);
        audioPlayerRef.current.addEventListener('loadedmetadata', () => {
          setAudioDuration(audioPlayerRef.current?.duration || 0);
        });
        audioPlayerRef.current.addEventListener('timeupdate', () => {
          if (audioPlayerRef.current) {
            setAudioProgress((audioPlayerRef.current.currentTime / audioPlayerRef.current.duration) * 100);
          }
        });
        audioPlayerRef.current.addEventListener('ended', () => {
          setIsFilePlaying(false);
          setAudioProgress(0);
        });
      }
    }
  }, [selectedFile]);

  const handleStart = async () => {
    setRecordingError(null);

    if (currentSource === 'microphone') {
      try {
        await startRecording();
        start();
        setRecording(true);
      } catch (err) {
        console.error('Failed to start microphone:', err);
      }
    } else if (currentSource === 'file') {
      if (!selectedFile) {
        setRecordingError('请先选择音频文件');
        return;
      }
      
      // 开始播放音频文件
      if (audioPlayerRef.current) {
        audioPlayerRef.current.play();
        setIsFilePlaying(true);
        setRecording(true);
      }
    }
  };

  const handleStop = () => {
    if (currentSource === 'microphone') {
      stopRecording();
      stop();
    } else if (currentSource === 'file') {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        setIsFilePlaying(false);
        setAudioProgress(0);
      }
    }
    setRecording(false);
    setPaused(false);
  };

  const handlePause = () => {
    if (currentSource === 'microphone') {
      if (isPaused) {
        resumeRecording();
      } else {
        pauseRecording();
      }
    } else if (currentSource === 'file') {
      if (audioPlayerRef.current) {
        if (isFilePlaying) {
          audioPlayerRef.current.pause();
        } else {
          audioPlayerRef.current.play();
        }
        setIsFilePlaying(!isFilePlaying);
      }
    }
    setPaused(!isPaused);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getElapsedTime = () => {
    if (!startTime) return '00:00:00';
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const audioSources: { type: AudioSource; icon: typeof Mic; label: string }[] = [
    { type: 'microphone', icon: Mic, label: '麦克风' },
    { type: 'file', icon: FileAudio, label: '音频文件' },
  ];

  return (
    <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-2xl p-6 border border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-light flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          音频控制
        </h2>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Settings className="w-5 h-5 text-light-muted" />
        </button>
      </div>

      {/* Audio Source Selection */}
      <div className="space-y-3 mb-6">
        <label className="text-sm text-light-muted">音频输入源</label>
        <div className="grid grid-cols-2 gap-3">
          {audioSources.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => {
                if (!isRecording) {
                  setSource(type);
                  setSelectedFile(null);
                }
              }}
              disabled={isRecording}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300
                ${currentSource === type
                  ? 'border-primary bg-primary/20 text-primary animate-glow'
                  : 'border-dark-lighter bg-dark/50 text-light-muted hover:border-primary/50'
                }
                ${isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* File Upload - Only show when file source is selected */}
      {currentSource === 'file' && !isRecording && (
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={handleFileButtonClick}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary/50
              bg-dark/50 text-light-muted hover:border-primary hover:bg-primary/10 transition-all"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm font-medium">
              {selectedFile ? selectedFile.name : '点击选择音频文件'}
            </span>
          </button>
          {selectedFile && (
            <div className="mt-2 text-center">
              <p className="text-xs text-light-muted">
                已选择: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-xs text-primary mt-1">
                提示：音频文件播放时暂不支持语音识别，仅供预览
              </p>
            </div>
          )}
        </div>
      )}

      {/* Audio Player - Show when file is selected and recording */}
      {currentSource === 'file' && isRecording && selectedFile && (
        <div className="mb-6 p-4 bg-dark/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-light truncate">{selectedFile.name}</span>
            <span className="text-xs text-light-muted">
              {formatTime(audioDuration)}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-dark-lighter rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent-cyan transition-all duration-100"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
          
          {/* Time Display */}
          <div className="flex justify-between text-xs text-light-muted">
            <span>{formatTime((audioProgress / 100) * audioDuration)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>
      )}

      {/* Microphone Level Indicator */}
      {currentSource === 'microphone' && isRecording && !isPaused && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-light-muted">麦克风电平</span>
            <span className="text-xs text-primary">{Math.round(audioLevel)}%</span>
          </div>
          <div className="h-2 bg-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent-cyan transition-all duration-100"
              style={{ width: `${audioLevel}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {recordingError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{recordingError}</p>
        </div>
      )}

      {/* Language Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm text-light-muted flex items-center gap-1">
            <Globe className="w-4 h-4" />
            源语言
          </label>
          <select
            value={sourceLanguage}
            onChange={(e) => setLanguage(e.target.value, targetLanguage)}
            disabled={isRecording}
            className="w-full bg-dark/70 border border-dark-lighter rounded-lg px-3 py-2 text-light
              focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50
              disabled:opacity-50 transition-all"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-light-muted flex items-center gap-1">
            <Target className="w-4 h-4" />
            目标语言
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setLanguage(sourceLanguage, e.target.value)}
            disabled={isRecording}
            className="w-full bg-dark/70 border border-dark-lighter rounded-lg px-3 py-2 text-light
              focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50
              disabled:opacity-50 transition-all"
          >
            {TARGET_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Speech Settings */}
      <div className="space-y-4 mb-6">
        <label className="text-sm text-light-muted">语音设置</label>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-light-muted">语速</span>
              <span className="text-primary">{speechRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechSettings(parseFloat(e.target.value), speechVolume)}
              className="w-full h-2 bg-dark-lighter rounded-lg appearance-none cursor-pointer
                accent-primary"
            />
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
              className="w-full h-2 bg-dark-lighter rounded-lg appearance-none cursor-pointer
                accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isRecording ? (
          <button
            onClick={handleStart}
            disabled={!isRecognitionSupported || (currentSource === 'file' && !selectedFile)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-600
              rounded-xl font-medium text-white transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:shadow-lg hover:shadow-primary/30"
          >
            <Play className="w-5 h-5" />
            开始翻译
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent-cyan/20 hover:bg-accent-cyan/30
                border border-accent-cyan rounded-xl font-medium text-accent-cyan transition-all duration-300"
            >
              {isPaused || (currentSource === 'file' && !isFilePlaying) ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              {isPaused ? '继续' : '暂停'}
            </button>
            <button
              onClick={handleStop}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/20 hover:bg-red-500/30
                border border-red-500 rounded-xl font-medium text-red-400 transition-all duration-300"
            >
              <Square className="w-5 h-5" />
              停止
            </button>
          </>
        )}
      </div>

      {/* Status */}
      {isRecording && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-light-muted">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-red-500 animate-pulse'}`} />
            <span>{isPaused ? '已暂停' : '播放中'}</span>
          </div>
          <span>已翻译: {sentenceCount} 条</span>
          <span>{getElapsedTime()}</span>
        </div>
      )}
    </div>
  );
}
