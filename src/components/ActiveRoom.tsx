'use client';

import { VideoConference } from '@livekit/components-react';
import { RoomSidebar } from './RoomSidebar';

export function ActiveRoom({ isHost }: { isHost: boolean }) {
  return (
    <div className="flex h-[100dvh] w-full bg-[var(--background)] overflow-hidden relative">
      
      {/* ── Main Content Area: Video Engine ── */}
      <div className="flex-1 min-w-0 h-full relative z-0">
        <VideoConference />
      </div>

      {/* ── Sidebar: Room Sequence & Host Controls ── */}
      {isHost && <RoomSidebar isHost={isHost} />}
      
    </div>
  );
}

