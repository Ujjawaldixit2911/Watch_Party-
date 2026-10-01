import React from 'react';
import { Link } from 'react-router-dom';
import {
  Tv,
  ShieldCheck,
  Zap,
  Share2,
  Sparkles,
  Play,
  Volume2,
  ArrowRight,
  Crown,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RoleBadge } from '../components/ui/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* 1. Header Navigation */}
      <header className="w-full border-b border-zinc-800/80 bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Tv className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight font-heading text-white">
              Watch<span className="text-indigo-400">Party</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#mock-preview" className="hover:text-white transition-colors">
              Live Preview
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/join">
              <Button variant="ghost" size="sm" className="text-zinc-300">
                Join Room
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="primary" size="sm" className="shadow-indigo-600/30">
                Create Party
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden flex-1">
        {/* Subtle background ambient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Zero latency • Multi-device • Sub-second sync</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-[1.1]">
            Watch YouTube together. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
              In perfect sync.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Create a room, invite your friends, and experience YouTube videos together in real time
            with server-authoritative playback, host moderation, and instant chat.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/create" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-xl shadow-indigo-600/30 text-base">
                Create a Watch Party
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/join" className="w-full sm:w-auto">
              <Button variant="glass" size="lg" className="w-full sm:w-auto text-base">
                Join a Room
              </Button>
            </Link>
          </div>
        </div>

        {/* 3. Hero Mock Preview Frame */}
        <div id="mock-preview" className="max-w-5xl mx-auto mt-14 relative z-10 animate-slide-up">
          <div className="glass-panel-elevated rounded-3xl p-3 sm:p-5 border border-zinc-700/60 shadow-2xl">
            {/* Window header simulation */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono ml-2 text-zinc-500 font-semibold">room/WK-7F29Q</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-subtle" />
                <span className="text-zinc-300 font-medium">3 Watching</span>
              </div>
            </div>

            {/* Simulated Watch Party Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-left">
              {/* Player Side */}
              <div className="lg:col-span-2 space-y-3">
                <div className="relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                  <img
                    src="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
                    alt="Demo preview video"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide">
                        Now Synchronized
                      </span>
                      <h4 className="text-sm font-bold text-white">Rick Astley - Never Gonna Give You Up (Official Music Video)</h4>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE SYNC (0.0s drift)
                    </span>
                  </div>
                </div>

                {/* Simulated Controls */}
                <div className="p-3 bg-[#111113] border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                    <span className="font-mono text-zinc-300 font-semibold">01:42 / 03:32</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-zinc-400" />
                    <div className="w-16 h-1.5 bg-indigo-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-3 flex flex-col">
                <div className="bg-[#111113] border border-zinc-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase">
                    <span>Participants (3)</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-[10px]">
                          A
                        </div>
                        <span className="font-medium text-zinc-200">Aman (You)</span>
                      </div>
                      <RoleBadge role="HOST" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center font-bold text-[10px]">
                          R
                        </div>
                        <span className="font-medium text-zinc-300">Rahul</span>
                      </div>
                      <RoleBadge role="MODERATOR" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-[10px]">
                          P
                        </div>
                        <span className="font-medium text-zinc-400">Priya</span>
                      </div>
                      <RoleBadge role="PARTICIPANT" />
                    </div>
                  </div>
                </div>

                <div className="bg-[#111113] border border-zinc-800 rounded-xl p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-2 text-xs">
                    <div className="bg-zinc-900/80 p-2 rounded-xl text-zinc-300">
                      <span className="font-bold text-purple-300 mr-1.5">Rahul:</span>
                      This sync is buttery smooth! 🔥
                    </div>
                    <div className="bg-indigo-600/30 p-2 rounded-xl text-indigo-100 border border-indigo-500/30">
                      <span className="font-bold text-indigo-200 mr-1.5">Aman:</span>
                      Wait till the chorus drops!
                    </div>
                  </div>
                  <div className="pt-2 border-t border-zinc-800/80 flex gap-2">
                    <input
                      disabled
                      placeholder="Send a message..."
                      className="w-full bg-zinc-900 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/80 bg-[#0c0c0e]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              Engineered for seamless group watching
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              Everything you need to host watch parties, stream together, and stay in sync down to the millisecond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#111113] border border-zinc-800 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Server-Authoritative Sync</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The server owns time and playback state. Clients render smoothly without seek loops or jitter.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111113] border border-zinc-800 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-11 h-11 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Granular RBAC</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Host, Moderator, and Viewer roles validated strictly on the backend for every socket event.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111113] border border-zinc-800 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Instant Room Codes</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Clean, unambiguous room codes (e.g. WK-7F29Q) with one-click shareable URLs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111113] border border-zinc-800 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Control Requests</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Viewers can submit requests to play, pause, seek, or change video for the host to approve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/80">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              How it works in 3 easy steps
            </h2>
            <p className="text-zinc-400 text-sm">No complex registration required. Jump straight into the watch party.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3 p-6 rounded-2xl bg-[#111113]/60 border border-zinc-800/80">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold font-heading flex items-center justify-center mx-auto text-lg shadow-lg shadow-indigo-600/30">
                1
              </div>
              <h3 className="text-base font-bold text-white font-heading">Create a Party</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choose your username and create a room with a single click. You automatically become the Host.
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-2xl bg-[#111113]/60 border border-zinc-800/80">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold font-heading flex items-center justify-center mx-auto text-lg shadow-lg shadow-indigo-600/30">
                2
              </div>
              <h3 className="text-base font-bold text-white font-heading">Invite Friends</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Copy your unique 5-letter party code or shareable invite link and send it over chat or Discord.
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-2xl bg-[#111113]/60 border border-zinc-800/80">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold font-heading flex items-center justify-center mx-auto text-lg shadow-lg shadow-indigo-600/30">
                3
              </div>
              <h3 className="text-base font-bold text-white font-heading">Watch in Sync</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Play, pause, seek, chat, and react in real-time together without missing a single second.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-[#09090B] py-8 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-zinc-300 font-heading">WatchParty</span>
            <span>— Real-Time Synchronized Streaming</span>
          </div>
          <p>© 2026 WatchParty. Built for high performance and low-latency collaboration.</p>
        </div>
      </footer>
    </div>
  );
};
