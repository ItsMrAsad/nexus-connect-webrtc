'use client';

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

import { WaitingLobby } from './WaitingLobby';
import { ActiveRoom } from './ActiveRoom';

export function LiveKitWrapper({ room, initialUsername, initialRole }: { room: string, initialUsername: string, initialRole: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [role, setRole] = useState(initialRole);

  useEffect(() => {
    const fetchToken = async (currentRole: string) => {
      try {
        const res = await fetch(`/api/token?room=${room}&username=${initialUsername}&role=${currentRole}`);
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          setServerUrl(data.serverUrl);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchToken(role);
  }, [room, initialUsername, role]);

  const handleApproved = () => {
    setToken(null); // Unmount room temporarily to drop the bad token
    setServerUrl(null);
    setRole('guest'); // Fetch new token with guest permissions
  };

  if (!token || !serverUrl) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-4 border-emerald-500 animate-spin opacity-70" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
      </div>
    </div>
  );

  return (
    <LiveKitRoom
      video={role !== 'waiting'}
      audio={role !== 'waiting'}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      style={{ height: '100dvh' }}
      connectOptions={{ autoSubscribe: role !== 'waiting' }}
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
