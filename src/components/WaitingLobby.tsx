import { useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { Loader2, ShieldAlert } from 'lucide-react';

export function WaitingLobby({ username, onApproved }: { username: string, onApproved: () => void }) {
  const room = useRoomContext();

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

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] w-full bg-[#0a0a0a] text-zinc-100 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="z-10 max-w-md w-full p-8 border border-white/10 bg-zinc-950/50 backdrop-blur-xl rounded-3xl flex flex-col items-center gap-6 shadow-2xl text-center">
        
        <div className="relative flex items-center justify-center w-24 h-24 mb-2">
          <div className="absolute inset-0 rounded-full border-[3px] border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-t-[3px] border-indigo-500 animate-spin" />
          <ShieldAlert className="w-8 h-8 text-indigo-400" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Waiting for Host
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Welcome <span className="text-zinc-200 font-semibold">{username}</span>. You are in the lobby. The host has been notified and must admit you to join the session.
          </p>
        </div>

        <div className="w-full flex items-center justify-center gap-2 text-xs font-medium text-indigo-400 bg-indigo-500/10 py-2.5 px-4 rounded-lg mt-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Requesting access...
        </div>
      </div>
    </div>
  );
}
