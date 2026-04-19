'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Whiteboard } from './Whiteboard';
import { Button } from '../ui/Button';

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
        <Button
          id="toggle-whiteboard"
          onClick={handleToggleWhiteboard}
          isActive={showWhiteboard}
          variant="glass"
          className={cn(
            "w-full flex-col h-24 gap-3 border-dashed hover:border-indigo-500/50 hover:bg-indigo-500/5 group",
            showWhiteboard && "border-indigo-500/50 bg-indigo-500/10"
          )}
          leftIcon={<PenLine className={cn("w-5 h-5 transition-transform group-hover:scale-110", showWhiteboard ? "text-indigo-400" : "text-slate-500")} />}
        >
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-colors",
            showWhiteboard ? "text-indigo-300" : "text-slate-500 group-hover:text-indigo-300"
          )}>
            {showWhiteboard ? 'Hide Whiteboard' : 'Open Whiteboard'}
          </span>
        </Button>
      )}

      {showWhiteboard && <Whiteboard onClose={handleCloseWhiteboard} isHost={isHost} />}
    </>
  );
}

