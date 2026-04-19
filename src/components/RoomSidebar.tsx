'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HostDashboard } from './room-controls/HostDashboard';
import { RecordingButton } from './room-controls/RecordingButton';
import { WhiteboardManager } from './room-controls/WhiteboardManager';

interface RoomSidebarProps {
  isHost: boolean;
}

export function RoomSidebar({ isHost }: RoomSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isHost) return null;

  return (
    <div className="relative flex h-full">
      {/* ── Toggle Handle ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -left-4 z-[70] h-20 w-4 group flex items-center justify-center transition-all",
          "bg-slate-950/80 backdrop-blur-xl border border-white/[0.06] rounded-l-xl hover:bg-slate-900",
          !isOpen && "left-0 rounded-r-none"
        )}
      >
        <div className="text-slate-500 group-hover:text-indigo-400 transition-colors">
          {isOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* ── Sidebar Container ── */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isOpen ? 'max(360px, 25vw)' : '0px',
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-full overflow-hidden border-l border-white/[0.05] bg-slate-950/30 backdrop-blur-3xl flex flex-col pt-6 px-6 pb-20 lg:pb-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Host Hub</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Admin Panel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Sequence Section */}
        <div className="space-y-6 flex flex-col flex-1 overflow-hidden">
          
          {/* Section: Secondary Actions */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-500 mb-1">Session Features</span>
            <div className="grid grid-cols-2 gap-3">
              <WhiteboardManager isHost={isHost} />
              <RecordingButton />
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

          {/* Section: Participant Management (The Dashboard) */}
          <div className="flex-1 flex flex-col overflow-hidden">
             <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-500 mb-4">Participant Lobby</span>
             <div className="flex-1 overflow-y-auto">
                <HostDashboard />
             </div>
          </div>

        </div>

      </motion.aside>
    </div>
  );
}
