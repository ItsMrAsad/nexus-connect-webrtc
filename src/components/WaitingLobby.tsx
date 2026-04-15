'use client';

import { useEffect, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { Loader2, Shield, Wifi } from 'lucide-react';

export function WaitingLobby({ username, onApproved }: { username: string; onApproved: () => void }) {
  const room = useRoomContext();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const requestJoin = () => {
      if (room.state === 'connected') {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify({ type: 'REQUEST_JOIN', username }));
        room.localParticipant.publishData(data, { reliable: true });
      }
    };

    requestJoin();
    const interval = setInterval(requestJoin, 5000);

    const handleDataReceived = (payload: Uint8Array) => {
      const decoder = new TextDecoder();
      try {
        const msg = JSON.parse(decoder.decode(payload));
        if (msg.type === 'APPROVE_JOIN' && msg.target === username) {
          onApproved();
        }
      } catch {
        // ignore parse error
      }
    };

    room.on('dataReceived', handleDataReceived);
    return () => {
      clearInterval(interval);
      room.off('dataReceived', handleDataReceived);
    };
  }, [room, username, onApproved]);

  const initials = username
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] w-full bg-[var(--background)] text-slate-100 px-4 relative overflow-hidden">

      {/* Ambient Background */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-[15%] left-[15%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] bg-indigo-600/[0.06] rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-[15%] right-[15%] w-[40vw] h-[40vw] max-w-[450px] max-h-[450px] bg-violet-600/[0.05] rounded-full blur-[120px] pointer-events-none animate-float-reverse" />

      {/* Card */}
      <div className="z-10 max-w-md w-full p-8 glass glow-accent rounded-3xl flex flex-col items-center gap-7 text-center animate-fade-in-up">

        {/* Avatar with Spinner Ring */}
        <div className="relative flex items-center justify-center w-28 h-28">
          {/* Outer ring - static */}
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          {/* Spinning accent ring */}
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin-slow" />
          {/* Second ring - reverse spin */}
          <div className="absolute inset-2 rounded-full border-r-2 border-violet-500/50 animate-spin-reverse" />
          {/* Pulse rings */}
          <div className="absolute inset-[-8px] rounded-full border border-indigo-500/20 animate-ring-pulse" />
          <div className="absolute inset-[-16px] rounded-full border border-indigo-500/10 animate-ring-pulse" style={{ animationDelay: '0.5s' }} />

          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-xl font-bold text-white">{initials}</span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Waiting for Host
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            Hi <span className="text-white font-semibold">{username}</span>! You&apos;re in the lobby. The host will admit you shortly.
          </p>
        </div>

        {/* Status Badges */}
        <div className="w-full flex flex-col gap-2.5">
          <div className="flex items-center justify-center gap-2.5 text-xs font-medium text-indigo-300 bg-indigo-500/[0.08] py-2.5 px-4 rounded-xl border border-indigo-500/10">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Requesting access{dots}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-400">Connected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              <span>Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
