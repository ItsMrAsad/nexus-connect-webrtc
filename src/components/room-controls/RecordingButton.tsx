'use client';

import { useRecording } from '@/hooks/useRecording';
import { Circle, Square, StopCircle } from 'lucide-react';
import { Button } from '../ui/Button';

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
    <div className="relative">
      {!isRecording && !isStopping ? (
        <Button
          id="start-recording"
          onClick={startRecording}
          variant="glass"
          className="w-full flex-col h-24 gap-3 border-dashed hover:border-indigo-500/50 hover:bg-indigo-500/5 group"
          leftIcon={<Circle className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-300 transition-colors">Start Recording</span>
        </Button>
      ) : isStopping ? (
        <Button
          disabled
          variant="glass"
          className="w-full flex-col h-24 gap-3 opacity-70"
          leftIcon={<Square className="w-5 h-5 animate-pulse text-indigo-400" />}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Saving...</span>
        </Button>
      ) : (
        <Button
          id="stop-recording"
          onClick={stopRecording}
          variant="danger"
          className="w-full flex-col h-24 gap-2 shadow-lg shadow-red-500/20"
        >
          <div className="flex items-center gap-2 mb-1">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
               <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
             </span>
             <span className="text-xs font-black font-mono tracking-tighter">{duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <StopCircle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Stop Session</span>
          </div>
        </Button>
      )}

      {/* Recording error toast */}
      {recordingError && (
        <div className="absolute -top-12 left-0 right-0 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight bg-red-950/80 border border-red-500/20 text-red-400 text-center backdrop-blur-md animate-fade-in-up">
          {recordingError}
        </div>
      )}
    </div>
  );
}

