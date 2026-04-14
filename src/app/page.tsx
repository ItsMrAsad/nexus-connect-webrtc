'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Video, User, Hash, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [room, setRoom] = useState('');
  const [username, setUsername] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInvite, setIsInvite] = useState(false);

  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <main className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden font-sans bg-[linear-gradient(105deg,#6366f1_50%,#111111_50%)]">
      
      {/* Left side text container - positioned absolutely to match the layout in the image */}
      <div className="absolute left-[8%] md:left-[12%] top-1/2 -translate-y-1/2 text-center md:text-left text-white hidden lg:block z-10 pointer-events-none">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold italic mb-6 leading-tight drop-shadow-md">
          Login and <br /> Signup Form
        </h1>
        <div className="bg-white text-[#6366f1] px-6 py-2 rounded-lg font-bold text-xl md:text-2xl italic shadow-lg inline-block">
          Using HTML & CSS
        </div>
      </div>

      {/* Form Card - perfectly centered so the 50% gradient perfectly overlaps the page's 50% split */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-[420px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden bg-[linear-gradient(105deg,#ffffff_50%,#111111_50%)] z-10 border border-white/10"
      >
        {/* Top-right decorative cog */}
        <div className="absolute top-4 right-4 text-white mix-blend-difference cursor-pointer transition-colors">
          <Video className="w-5 h-5" />
        </div>

        <div className="text-center mb-8 mt-2">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2 text-white mix-blend-difference">
            <User className="w-6 h-6" strokeWidth={2.5} />
            Create an account
          </h2>
          <p className="text-white mix-blend-difference text-sm font-medium opacity-80">
            {isInvite ? 'Enter your name to join the meeting' : 'Enter your details below to connect to a room'}
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-5 relative z-20">
          
          {/* Display Name Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <User className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1e1e1e] text-white border border-white/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-zinc-500 text-sm font-bold shadow-inner" 
              required
              placeholder="Your Display Name"
            />
          </div>

          {/* Room Code Input (Hidden if Invite) */}
          {!isInvite && (
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <Hash className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1e1e1e] text-white border border-white/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-zinc-500 text-sm font-bold shadow-inner" 
                required
                placeholder="Meeting ID"
              />
            </div>
          )}
          
          {/* Host Toggle */}
          {!isInvite && (
            <label className="flex items-center gap-3 py-1 cursor-pointer group w-fit">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={isHost}
                  onChange={(e) => setIsHost(e.target.checked)}
                  className="peer sr-only"
                />
                <div className={cn(
                  "w-10 h-5 rounded-full transition-colors duration-300 relative border",
                  isHost ? "bg-indigo-500 border-indigo-500" : "bg-[#1e1e1e] border-white/10"
                )}>
                  <div className={cn(
                    "absolute top-[1px] left-[1px] w-4 h-4 rounded-full transition-transform duration-300 shadow-sm bg-white",
                    isHost ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              </div>
              <span className="text-sm font-bold text-white mix-blend-difference">
                Join as Host (Admin)
              </span>
            </label>
          )}

          {/* Primary Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#6366f1] hover:bg-[#5558e6] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 mt-2 border border-indigo-400/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isInvite ? "Join as Employee" : "Sign in to Room"}
          </button>

          {!isInvite && (
            <>
              {/* Divider */}
              <div className="relative py-2 flex items-center">
                <div className="flex-grow border-t border-white mix-blend-difference"></div>
                <span className="flex-shrink-0 mx-4 text-[10px] text-white mix-blend-difference uppercase tracking-widest font-bold">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-white mix-blend-difference"></div>
              </div>

              {/* Secondary Action (Generate Random) */}
              <button 
                type="button"
                onClick={generateRandom}
                className="w-full bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white font-bold py-3.5 px-4 rounded-xl transition-all border border-white/10 flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-zinc-400" />
                Generate Random Room
              </button>
            </>
          )}

          <div className="pt-2 text-center">
            <p className="text-[11px] text-white mix-blend-difference leading-relaxed font-semibold">
              By clicking continue, you agree to our <br/>
              <span className="font-bold underline cursor-pointer">Terms of Service</span> and <span className="font-bold underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>

        </form>
      </motion.div>

    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#111111]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
