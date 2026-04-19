'use client';

import { useState, useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { UserPlus, CheckCircle2, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';

export function HostDashboard() {
  const room = useRoomContext();
  const [waitingUsers, setWaitingUsers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

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
    <div className="flex flex-col gap-6">
      {/* Copy Invite Link */}
      <Button
        variant="glass"
        onClick={copyInviteLink}
        className={cn(
          "w-full justify-start text-[10px] font-black uppercase tracking-[0.1em]",
          copied && "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
        )}
        leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      >
        {copied ? 'Link Copied!' : 'Copy Meeting Link'}
      </Button>

      {/* List Container */}
      <div className="flex flex-col gap-3">
        {waitingUsers.length > 0 ? (
          waitingUsers.map(user => {
            const initials = user
              .split(' ')
              .map(w => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <motion.div
                key={user}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] p-3.5 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center border border-white/5 flex-shrink-0">
                    <span className="text-[11px] font-bold text-indigo-300">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-slate-200 block truncate leading-tight">{user}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-tight mt-0.5">Wants to join</span>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    size="sm"
                    className="w-full py-2 h-auto text-[11px] font-bold uppercase tracking-wider"
                    onClick={() => admitUser(user)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Admit Participant
                  </Button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-[2rem] border border-dashed border-white/5 opacity-40">
            <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center mb-4">
              <UserPlus className="w-4 h-4 text-slate-600" />
            </div>
             <p className="text-[11px] font-semibold text-slate-500 text-center leading-relaxed">
               Lobby is currently empty.<br/>
               Waiting for participants...
             </p>
          </div>
        )}
      </div>
    </div>
  );
}


