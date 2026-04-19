'use client';

import { VideoConference } from '@livekit/components-react';
import { RecordingButton } from './room-controls/RecordingButton';
import { WhiteboardManager } from './room-controls/WhiteboardManager';
import { HostDashboard } from './room-controls/HostDashboard';

export function ActiveRoom({ isHost }: { isHost: boolean }) {
  return (
    <div className="flex h-[100dvh] w-full bg-[var(--background)] overflow-hidden relative">
      
      {/* ── Heavy Video Engine (Seldom Re-renders) ── */}
      <div className="flex-1 w-full h-full relative z-0">
        <VideoConference />
      </div>

      {/* ─────────────────────────────────────────────────────── */}
      {/* Floating Action Buttons  (top-right corner)            */}
      {/* ─────────────────────────────────────────────────────── */}
      {isHost && (
        <div className="absolute top-4 right-4 z-[100] flex flex-col gap-2 items-end">
          <WhiteboardManager isHost={isHost} />
          <RecordingButton />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────── */}
      {/* Host Only Controls (Lobby Dashboard)                    */}
      {/* ─────────────────────────────────────────────────────── */}
      {isHost && <HostDashboard />}
      
    </div>
  );
}
