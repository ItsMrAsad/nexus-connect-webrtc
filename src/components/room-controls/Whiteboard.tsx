'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { Tldraw, createTLStore, TLStore, TLRecord, defaultShapeUtils, defaultBindingUtils } from 'tldraw';
import 'tldraw/tldraw.css';
import { useRoomContext } from '@livekit/components-react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

const DATA_TOPIC = 'WHITEBOARD_SYNC';
const BATCH_DELAY_MS = 120; // throttle: send at most once per 120ms (reduces network jitter)

interface WhiteboardProps {
  onClose: () => void;
  isHost: boolean;
}

export function Whiteboard({ onClose, isHost }: WhiteboardProps) {
  const room = useRoomContext();

  // Stable TLStore initialized with default utilities to prevent crashes on interaction.
  // We use useState with a lazy initializer to ensure it's created only once.
  const [store] = useState(() => 
    createTLStore({ 
      shapeUtils: defaultShapeUtils,
      bindingUtils: defaultBindingUtils 
    })
  );

  // Throttle refs
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingChangesRef = useRef<unknown>(null);
  const isApplyingRemoteRef = useRef(false);

  /** Broadcast local drawing changes to all participants via LiveKit data channel */
  const broadcastChanges = useCallback(
    (changes: unknown) => {
      try {
        const encoder = new TextEncoder();
        const payload = encoder.encode(
          JSON.stringify({ type: DATA_TOPIC, changes })
        );
        room.localParticipant.publishData(payload, { reliable: true });
      } catch {
        // Silently ignore (e.g. room not yet connected)
      }
    },
    [room]
  );

  /** Called on every local draw action — throttled before sending */
  const handleChange = useCallback(
    (changes: unknown) => {
      if (isApplyingRemoteRef.current) return; // don't echo remote changes back

      pendingChangesRef.current = changes;
      if (batchTimerRef.current) return; // already scheduled

      batchTimerRef.current = setTimeout(() => {
        if (pendingChangesRef.current) {
          broadcastChanges(pendingChangesRef.current);
          pendingChangesRef.current = null;
        }
        batchTimerRef.current = null;
      }, BATCH_DELAY_MS);
    },
    [broadcastChanges]
  );

  /** Receive and apply remote drawing changes */
  useEffect(() => {
    const handleDataReceived = (payload: Uint8Array) => {
      const decoder = new TextDecoder();
      try {
        const msg = JSON.parse(decoder.decode(payload));
        if (msg.type !== DATA_TOPIC || !msg.changes) return;

        isApplyingRemoteRef.current = true;

        store.mergeRemoteChanges(() => {
          const { added, updated, removed } = msg.changes as {
            added?: Record<string, TLRecord>;
            updated?: Record<string, [TLRecord, TLRecord]>;
            removed?: Record<string, TLRecord>;
          };

          if (added && Object.keys(added).length > 0) {
            store.put(Object.values(added));
          }
          if (updated && Object.keys(updated).length > 0) {
            // Each entry is [prev, next] — we want the next value
            store.put(Object.values(updated).map(([, next]) => next));
          }
          if (removed && Object.keys(removed).length > 0) {
            // store.remove takes record IDs
            store.remove(Object.keys(removed) as TLRecord['id'][]);
          }
        });

        isApplyingRemoteRef.current = false;
      } catch {
        isApplyingRemoteRef.current = false;
      }
    };

    room.on('dataReceived', handleDataReceived);
    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room]);

  // Close whiteboard on Escape key
  useEffect(() => {
    if (!isHost) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, isHost]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#020617]">

      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] shrink-0"
        style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] inline-block" />
          <span className="text-sm font-semibold text-white tracking-tight">
            Nexus<span className="text-indigo-400">Board</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            — Shared whiteboard · changes sync in real time
          </span>
        </div>

        {isHost && (
          <Button
            id="whiteboard-close"
            onClick={onClose}
            size="icon"
            variant="ghost"
            title="Close whiteboard (Esc)"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* ── Tldraw Canvas ── */}
      <div className="flex-1 relative">
        <Tldraw
          store={store}
          hideUi={!isHost}
          onMount={(editor) => {
            if (!isHost) {
              editor.updateInstanceState({ isReadonly: true });
              return;
            }
            editor.store.listen(
              (entry) => {
                handleChange(entry.changes);
              },
              { source: 'user', scope: 'document' }
            );
          }}
        />
      </div>
    </div>
  );
}
