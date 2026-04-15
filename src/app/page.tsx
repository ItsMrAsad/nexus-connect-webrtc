'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Video, User, Hash, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [room, setRoom] = useState('');
  const [username, setUsername] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInvite, setIsInvite] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setRoom(roomParam);
      setIsInvite(true);
    }
  }, [searchParams]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (room && username) {
      setIsLoading(true);
      const role = isHost ? 'host' : 'waiting';
      setTimeout(() => {
        router.push(`/room/${room}?username=${encodeURIComponent(username)}&role=${role}`);
      }, 600);
    }
  };

  const generateRandom = () => {
    setRoom(Math.random().toString(36).substring(2, 9));
    setIsHost(true);
  };

  if (!isMounted) return null;

  return (
    <main className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-[var(--background)]">

      {/* ─── Animated Background ─── */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      {/* Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-indigo-600/[0.07] blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-violet-600/[0.06] blur-[120px] animate-float-reverse pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[25vw] h-[25vw] max-w-[300px] max-h-[300px] rounded-full bg-cyan-500/[0.04] blur-[100px] animate-pulse-glow pointer-events-none" />

      {/* ─── Content Container ─── */}
      <div className="relative z-10 w-full max-w-[960px] mx-auto px-4 py-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* ─── Left: Hero Branding ─── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex-1 text-center lg:text-left hidden lg:block"
        >
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Video className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 animate-pulse-glow opacity-50" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Nexus<span className="text-indigo-400">Connect</span>
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl xl:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-white mb-6">
            Video calls,{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              reimagined.
            </span>
          </h1>

          <p className="text-base text-slate-400 leading-relaxed max-w-md mb-8">
            Crystal-clear HD conferencing with real-time collaboration. Host or join a room in seconds — no downloads, no hassle.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            {['End-to-End Encrypted', 'HD Video', 'Low Latency'].map((feat, i) => (
              <motion.div
                key={feat}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs font-medium text-slate-300"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {feat}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── Right: Join Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="w-full max-w-[420px] rounded-3xl glass glow-accent p-8 relative"
        >
          {/* Card inner glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-indigo-500/[0.03] to-transparent pointer-events-none" />

          {/* Mobile Logo (shows on small screens) */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-6">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Video className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Nexus<span className="text-indigo-400">Connect</span>
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-7 relative z-10">
            <h2 className="text-[1.4rem] font-bold text-white tracking-tight mb-1.5">
              {isInvite ? 'Join Meeting' : 'Get Started'}
            </h2>
            <p className="text-sm text-slate-400">
              {isInvite
                ? 'Enter your name to join the session'
                : 'Create or join a room to start conferencing'}
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4 relative z-10">

            {/* Display Name */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400">
                <User className="w-[18px] h-[18px]" />
              </div>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 text-white border border-white/[0.06] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-500 text-sm font-medium"
                required
                placeholder="Your display name"
              />
            </div>

            {/* Room Code */}
            {!isInvite && (
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400">
                  <Hash className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="room-input"
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 text-white border border-white/[0.06] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-500 text-sm font-medium"
                  required
                  placeholder="Room code"
                />
              </div>
            )}

            {/* Host Toggle */}
            {!isInvite && (
              <label
                htmlFor="host-toggle"
                className="flex items-center gap-3 py-1 cursor-pointer group w-fit"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    id="host-toggle"
                    type="checkbox"
                    checked={isHost}
                    onChange={(e) => setIsHost(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={cn(
                    "w-10 h-[22px] rounded-full transition-all duration-300 relative",
                    isHost
                      ? "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                      : "bg-slate-800 border border-white/10"
                  )}>
                    <div className={cn(
                      "absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full transition-transform duration-300 shadow-sm bg-white",
                      isHost ? "translate-x-[18px]" : "translate-x-0"
                    )} />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-300">
                  Join as Host
                </span>
              </label>
            )}

            {/* Submit */}
            <button
              id="join-button"
              type="submit"
              disabled={isLoading || !username || !room}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-1 relative overflow-hidden group"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    {isInvite ? 'Join Meeting' : 'Enter Room'}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Divider + Random */}
            {!isInvite && (
              <>
                <div className="relative py-1 flex items-center">
                  <div className="flex-grow border-t border-white/[0.06]" />
                  <span className="flex-shrink-0 mx-4 text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                    or
                  </span>
                  <div className="flex-grow border-t border-white/[0.06]" />
                </div>

                <button
                  id="generate-room-button"
                  type="button"
                  onClick={generateRandom}
                  className="w-full bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white font-medium py-3 px-4 rounded-xl transition-all border border-white/[0.06] hover:border-white/[0.1] flex justify-center items-center gap-2 active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 text-indigo-400" />
                  Create Instant Room
                </button>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[var(--background)]">
        <div className="relative flex items-center justify-center w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
          <Video className="w-5 h-5 text-indigo-400" />
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
