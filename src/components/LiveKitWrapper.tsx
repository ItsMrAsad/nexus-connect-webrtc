'use client';

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Video } from 'lucide-react';

import { WaitingLobby } from './WaitingLobby';
import { ActiveRoom } from './ActiveRoom';

interface LiveKitWrapperProps {
  room: string;
  initialUsername: string;
  initialRole: string;
  initialToken: string;
  initialServerUrl: string;
}

export function LiveKitWrapper({
  room,
  initialUsername,
  initialRole,
  initialToken,
  initialServerUrl,
}: LiveKitWrapperProps) {
  // Start with server-provided token — no initial fetch needed
  const [token, setToken] = useState<string>(initialToken);
  const [serverUrl, setServerUrl] = useState<string>(initialServerUrl);
  const [role, setRole] = useState(initialRole);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Only fetch a new token when the role changes (e.g. waiting → guest after approval)
  useEffect(() => {
    if (role === initialRole) return; // Skip initial — already have token from server

    setIsReconnecting(true);
    const fetchToken = async () => {
      try {
        const res = await fetch(`/api/token?room=${room}&username=${initialUsername}&role=${role}`);
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          setServerUrl(data.serverUrl);
        }
      } catch (e) {
        console.error('Failed to fetch token:', e);
      } finally {
        setIsReconnecting(false);
      }
    };

    fetchToken();
  }, [room, initialUsername, role, initialRole]);

  const handleApproved = () => {
    setRole('guest'); // Triggers useEffect to fetch new token with guest permissions
  };

  // Loading state — only shows briefly during role upgrade (waiting → guest)
  if (isReconnecting) return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[var(--background)] gap-5">
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
        <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin-slow" />
        <div className="absolute inset-2 rounded-full border-r-2 border-violet-500/40 animate-spin-reverse" />
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Video className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white tracking-tight">
          Nexus<span className="text-indigo-400">Connect</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">Upgrading connection…</p>
      </div>
    </div>
  );

  return (
    <LiveKitRoom
      video={role !== 'waiting'}
      audio={role !== 'waiting'}
      token={token}
      serverUrl={serverUrl}
      connect={true}
      data-lk-theme="default"
      style={{ height: '100dvh' }}
      connectOptions={{ autoSubscribe: role !== 'waiting' }}
      options={{
        publishDefaults: {
          screenShareEncoding: {
            maxBitrate: 3_000_000,
            maxFramerate: 30,
          },
          videoEncoding: {
            maxBitrate: 1_500_000,
            maxFramerate: 30,
          }
        }
      }}
    >
      {role === 'waiting' ? (
        <WaitingLobby username={initialUsername} onApproved={handleApproved} />
      ) : (
        <ActiveRoom isHost={role === 'host'} />
      )}
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
