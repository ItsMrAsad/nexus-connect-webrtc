'use client';

import { useRecording } from '@/hooks/useRecording';
import { Circle, Square, StopCircle } from 'lucide-react';

export function RecordingButton() {
  const {
    isRecording,
    isStopping,
    duration,
    error: recordingError,
    startRecording,
    stopRecording,
  } = useRecording();

  return (
    <>
      {!isRecording && !isStopping ? (
        <button
          id="start-recording"
          onClick={startRecording}
          title="Start screen recording"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-95 bg-slate-950/80 backdrop-blur-xl border border-white/[0.06] text-slate-300 hover:text-red-400 hover:border-red-500/30 hover:bg-slate-900/80 shadow-black/20"
        >
          <Circle className="w-4 h-4" />
          <span className="hidden sm:inline">Record</span>
        </button>
      ) : isStopping ? (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-slate-950/80 border border-white/[0.06] text-slate-400 backdrop-blur-xl shadow-lg shadow-black/20">
          <Square className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden sm:inline">Saving…</span>
        </div>
      ) : (
        /* Recording active — pulsing red indicator + stop button */
        <button
          id="stop-recording"
          onClick={stopRecording}
          title="Stop recording and download"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-95 bg-red-600/90 hover:bg-red-500 text-white border border-red-500/30 backdrop-blur-xl shadow-red-900/30"
        >
          {/* Pulsing red dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <span className="font-mono font-bold">{duration}</span>
          <StopCircle className="w-4 h-4" />
        </button>
      )}

      {/* Recording error toast */}
      {recordingError && (
        <div className="px-3 py-2 rounded-xl text-xs font-medium bg-red-900/60 border border-red-500/20 text-red-300 max-w-[200px] text-center">
          {recordingError}
        </div>
      )}
    </>
  );
}
