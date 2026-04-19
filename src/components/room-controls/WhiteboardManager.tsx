'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Whiteboard } from './Whiteboard';

export function WhiteboardManager({ isHost }: { isHost: boolean }) {
  const room = useRoomContext();
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  useEffect(() => {
    const handleDataReceived = (payload: Uint8Array) => {
      const decoder = new TextDecoder();
      try {
        const msg = JSON.parse(decoder.decode(payload));
        if (msg.type === 'TOGGLE_WHITEBOARD') {
          setShowWhiteboard(msg.state);
        }
      } catch {
        // ignore
      }
    };
    room.on('dataReceived', handleDataReceived);
    return () => { room.off('dataReceived', handleDataReceived); };
  }, [room]);

  const handleCloseWhiteboard = useCallback(() => {
    if (isHost) {
      setShowWhiteboard(false);
      const encoder = new TextEncoder();
      const payload = encoder.encode(JSON.stringify({ type: 'TOGGLE_WHITEBOARD', state: false }));
      room.localParticipant.publishData(payload, { reliable: true });
    }
  }, [isHost, room]);

  const handleToggleWhiteboard = () => {
    if (isHost) {
      setShowWhiteboard(prev => {
        const nextState = !prev;
        const encoder = new TextEncoder();
        const payload = encoder.encode(JSON.stringify({ type: 'TOGGLE_WHITEBOARD', state: nextState }));
        room.localParticipant.publishData(payload, { reliable: true });
        return nextState;
      });
    }
  };

  return (
    <>
      {isHost && (
        <button
          id="toggle-whiteboard"
          onClick={handleToggleWhiteboard}
          title="Open shared whiteboard"
          className={cn(
            'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-95',
            showWhiteboard
              ? 'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-500'
              : 'bg-slate-950/80 backdrop-blur-xl border border-white/[0.06] text-slate-300 hover:text-white hover:border-indigo-500/30 hover:bg-slate-900/80 shadow-black/20'
          )}
        >
          <PenLine className="w-4 h-4" />
          <span className="hidden sm:inline">Whiteboard</span>
        </button>
      )}

      {showWhiteboard && <Whiteboard onClose={handleCloseWhiteboard} isHost={isHost} />}
    </>
  );
}
