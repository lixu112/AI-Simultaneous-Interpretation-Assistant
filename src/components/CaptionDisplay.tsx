import { useRef, useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Edit3, Check, X, Loader2 } from 'lucide-react';
import { addCorrectedTerm } from '@/hooks/useTranslation';

export function CaptionDisplay() {
  const {
    currentOriginal,
    currentTranslation,
    isRecording,
    isPaused,
    isTranslating,
    translatingText,
    records,
    correctRecord,
  } = useStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState({ original: '', translated: '' });

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [records, currentOriginal, currentTranslation]);

  // 开始编辑
  const handleEdit = (id: string, original: string, translated: string) => {
    setEditingId(id);
    setEditValue({ original, translated });
  };

  // 保存编辑
  const handleSave = (id: string) => {
    const currentRecord = records.find((r) => r.id === id);
    if (!currentRecord) return;

    // 修正原文
    if (editValue.original !== currentRecord.original) {
      correctRecord(id, {
        field: 'original',
        before: currentRecord.original,
        after: editValue.original,
        timestamp: Date.now(),
      });
    }
    // 修正译文
    if (editValue.translated !== currentRecord.translated) {
      correctRecord(id, {
        field: 'translated',
        before: currentRecord.translated,
        after: editValue.translated,
        timestamp: Date.now(),
      });
      
      // 自动学习修正后的术语，用于后续翻译
      // 将原文和修正后的译文作为术语对保存
      const originalText = editValue.original || currentRecord.original;
      addCorrectedTerm(originalText, editValue.translated);
    } else {
      // 如果译文没有修改，但也学习原文-译文对
      addCorrectedTerm(editValue.original, editValue.translated);
    }
    
    setEditingId(null);
  };

  // 取消编辑
  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-2xl p-6 border border-primary/20 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-light flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isRecording ? (isPaused ? 'bg-yellow-400' : 'bg-primary animate-pulse') : 'bg-gray-500'}`} />
          实时字幕
        </h2>
        {isRecording && (
          <span className="text-xs text-light-muted bg-dark/50 px-2 py-1 rounded-full">
            {isPaused ? '已暂停' : '实时翻译中'}
          </span>
        )}
      </div>

      {/* Caption Display - All records integrated */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="bg-dark/60 rounded-xl p-4 border border-primary/10 min-h-full flex flex-col justify-end">
          {records.length === 0 && !currentOriginal ? (
            <div className="flex-1 flex items-center justify-center text-light-muted">
              <div className="text-center">
                <p className="text-lg mb-2">等待语音输入...</p>
                <p className="text-sm">点击"开始翻译"按钮开始实时翻译</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              {/* History Records - reversed to show oldest at top */}
              {records
                .slice()
                .reverse()
                .map((record) => (
                  <div key={record.id} className="space-y-2">
                    {/* Editing Mode */}
                    {editingId === record.id ? (
                      <div className="space-y-2 bg-dark/80 rounded-lg p-3 border border-primary/30">
                        <div className="space-y-1">
                          <span className="text-xs text-accent-cyan font-medium">原文</span>
                          <input
                            type="text"
                            value={editValue.original}
                            onChange={(e) => setEditValue({ ...editValue, original: e.target.value })}
                            className="w-full bg-dark/80 border border-dark-lighter rounded px-2 py-1 text-sm text-light focus:border-primary focus:outline-none font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-accent-pink font-medium">译文</span>
                          <input
                            type="text"
                            value={editValue.translated}
                            onChange={(e) => setEditValue({ ...editValue, translated: e.target.value })}
                            className="w-full bg-dark/80 border border-dark-lighter rounded px-2 py-1 text-sm text-light focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleCancel}
                            className="p-1.5 rounded hover:bg-white/10 text-light-muted transition-colors"
                            title="取消"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSave(record.id)}
                            className="p-1.5 rounded hover:bg-primary/20 text-primary transition-colors"
                            title="保存"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal Display */
                      <div className="group relative">
                        {/* Edit Button - appears on hover */}
                        <button
                          onClick={() => handleEdit(record.id, record.original, record.translated)}
                          className="absolute -right-8 top-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/20 text-light-muted transition-all"
                          title="修正"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Original - English */}
                        <div>
                          <p className="text-light font-mono text-lg leading-relaxed">
                            {record.original}
                            {record.corrected && record.corrections?.some(c => c.field === 'original') && (
                              <span className="ml-2 text-xs text-accent-cyan">(已修正)</span>
                            )}
                          </p>
                        </div>
                        {/* Translation - Chinese, slightly smaller */}
                        <div>
                          <p className="text-accent-pink font-medium text-base leading-relaxed">
                            {record.translated}
                            {record.corrected && record.corrections?.some(c => c.field === 'translated') && (
                              <span className="ml-2 text-xs text-accent-cyan">(已修正)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              {/* Translating indicator */}
              {isTranslating && translatingText && (
                <div className="space-y-2 bg-primary/10 rounded-lg p-3 border border-primary/30">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-xs text-light-muted">正在翻译...</span>
                  </div>
                  <p className="text-light font-mono text-lg leading-relaxed">
                    {translatingText}
                  </p>
                  <div className="h-1 bg-dark/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent-cyan animate-pulse" style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {/* Current Captions (if being recognized) */}
              {currentOriginal && !isTranslating && (
                <div className="space-y-2">
                  {/* Current Original */}
                  <div>
                    <p className="text-light font-mono text-lg leading-relaxed">
                      {currentOriginal}
                      {isRecording && !isPaused && !records.some(r => r.original === currentOriginal) && (
                        <span className="inline-block w-2 h-5 bg-primary/60 ml-1 animate-blink" />
                      )}
                    </p>
                  </div>
                  {/* Current Translation */}
                  {currentTranslation && !records.some(r => r.original === currentOriginal) && (
                    <div>
                      <p className="text-accent-pink font-medium text-base leading-relaxed">
                        {currentTranslation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
