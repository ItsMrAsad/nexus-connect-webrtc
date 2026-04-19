'use client';

import { useState, useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { Users, UserPlus, CheckCircle2, PanelLeftClose, PanelLeftOpen, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HostDashboard() {
  const room = useRoomContext();
  const [waitingUsers, setWaitingUsers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
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
        // ignore
      }
    };
    room.on('dataReceived', handleDataReceived);
    return () => { room.off('dataReceived', handleDataReceived); };
  }, [room]);

  const admitUser = (username: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({ type: 'APPROVE_JOIN', target: username }));
    room.localParticipant.publishData(data, { reliable: true });
    setWaitingUsers(prev => prev.filter(u => u !== username));
  };

  const copyInviteLink = () => {
    const url = new URL(window.location.origin);
    url.searchParams.set('room', room.name);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Toggle Button — always visible */}
      <button
        id="toggle-dashboard"
        onClick={() => setPanelOpen(prev => !prev)}
        className={cn(
          'absolute top-4 left-4 z-[60] h-10 w-10 rounded-xl flex items-center justify-center transition-all',
          'bg-slate-950/80 backdrop-blur-xl border border-white/[0.06] hover:border-indigo-500/30 hover:bg-slate-900/80',
          'shadow-lg shadow-black/20',
          panelOpen && 'left-[calc(min(100vw-2rem,320px)+2rem)]'
        )}
        title={panelOpen ? 'Collapse panel' : 'Expand panel'}
      >
        {panelOpen
          ? <PanelLeftClose className="w-4.5 h-4.5 text-slate-300" />
          : <PanelLeftOpen className="w-4.5 h-4.5 text-slate-300" />
        }
        {/* Notification dot */}
        {!panelOpen && waitingUsers.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-indigo-500 text-[9px] font-bold text-white">
              {waitingUsers.length}
            </span>
          </span>
        )}
      </button>

      {/* Dashboard Panel */}
      <div
        className={cn(
          'absolute top-4 left-4 z-50 w-[calc(100vw-2rem)] sm:w-80 transition-all duration-300 ease-in-out',
          panelOpen
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-4 pointer-events-none'
        )}
      >
        <div className="glass glow-accent rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2.5">
              <div className="relative flex items-center justify-center h-7 w-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                {waitingUsers.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                    <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-indigo-500 text-[9px] font-bold text-white">
                      {waitingUsers.length}
                    </span>
                  </span>
                )}
              </div>
              Host Dashboard
            </h3>
            <span className="text-[11px] font-medium px-2.5 py-1 bg-slate-900/80 border border-white/[0.06] text-slate-400 rounded-full">
              {waitingUsers.length} waiting
            </span>
          </div>

          {/* Copy Invite */}
          <button
            id="copy-invite-link"
            onClick={copyInviteLink}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-sm font-medium',
              copied
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/[0.06] hover:border-indigo-500/20 text-slate-300 hover:text-white'
            )}
          >
            {copied ? (
              <><Check className="w-4 h-4" />Copied!</>
            ) : (
              <><Copy className="w-4 h-4" />Copy Invite Link</>
            )}
          </button>

          {/* Waiting Users List */}
          {waitingUsers.length > 0 && (
            <div className="max-h-[35vh] overflow-y-auto flex flex-col gap-2.5 pr-1">
              {waitingUsers.map(user => {
                const initials = user
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={user}
                    className="bg-slate-900/40 hover:bg-slate-900/70 transition-colors p-3 rounded-xl flex items-center justify-between gap-3 border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border border-indigo-500/15 flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-300">{initials}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-slate-200 truncate font-medium text-sm block">{user}</span>
                        <span className="text-[11px] text-slate-500">Requesting to join</span>
                      </div>
                    </div>
                    <button
                      onClick={() => admitUser(user)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-500/15 flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Admit
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {waitingUsers.length === 0 && (
            <div className="text-center py-4">
              <UserPlus className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No one is waiting to join</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
