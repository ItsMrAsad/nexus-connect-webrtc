import { useEffect, useState } from 'react';
import { VideoConference, useRoomContext } from '@livekit/components-react';
import { Users, UserPlus, CheckCircle2, Link } from 'lucide-react';

export function ActiveRoom({ isHost }: { isHost: boolean }) {
  const room = useRoomContext();
  const [waitingUsers, setWaitingUsers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isHost) return;

    const handleDataReceived = (payload: Uint8Array) => {
      const decoder = new TextDecoder();
      try {
        const msg = JSON.parse(decoder.decode(payload));
        if (msg.type === 'REQUEST_JOIN' && msg.username) {
          setWaitingUsers(prev => {
            if (prev.includes(msg.username)) return prev;
            return [...prev, msg.username];
          });
        }
      } catch {
        // ignore parse error
      }
    };

    room.on('dataReceived', handleDataReceived);
    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room, isHost]);

  const admitUser = (username: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({ type: 'APPROVE_JOIN', target: username }));
    room.localParticipant.publishData(data, { reliable: true, destinationIdentities: [username] });
    setWaitingUsers(prev => prev.filter(u => u !== username));
  };

  const copyInviteLink = () => {
    const url = new URL(window.location.href);
    // Remove the username and role from the shareable link so the guest can fill it in
    url.searchParams.delete('username');
    url.searchParams.delete('role');
    
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-[100dvh] w-full bg-[#0a0a0a] overflow-hidden relative">
      <div className="flex-1 w-full h-full relative z-0">
        <VideoConference />
      </div>
      
      {/* Host Dashboard / Waiting Room Panel */}
      {isHost && (
        <div className="absolute left-4 top-4 sm:top-6 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-80 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-5 flex flex-col gap-4 rounded-2xl shadow-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2.5">
                <div className="relative flex items-center justify-center h-5 w-5 bg-indigo-500/20 rounded-md border border-indigo-500/30">
                  <Users className="w-3 h-3 text-indigo-400" />
                  {waitingUsers.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                  )}
                </div>
                Host Dashboard
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full">
                {waitingUsers.length} waiting
              </span>
            </div>

            <button
              onClick={copyInviteLink}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-white/5 transition-all text-sm font-medium"
            >
              <Link className="w-4 h-4" />
              {copied ? "Link Copied!" : "Copy Invite Link"}
            </button>
          </div>
          
          {waitingUsers.length > 0 && (
            <div className="max-h-[40vh] overflow-y-auto flex flex-col gap-3 pr-1 scrollbar-thin scrollbar-thumb-zinc-700 mt-2">
              {waitingUsers.map(user => (
                <div key={user} className="bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors p-3.5 rounded-xl flex items-center justify-between gap-3 border border-white/5">
                  <div className="flex items-center gap-3 truncate">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <UserPlus className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-zinc-200 truncate font-medium text-sm">{user}</span>
                  </div>
                  <button 
                    onClick={() => admitUser(user)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Admit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
