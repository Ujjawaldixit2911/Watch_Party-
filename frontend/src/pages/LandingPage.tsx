import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Headphones,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Star,
  HardDrive,
  Users,
  HelpCircle,
  LogOut,
  ChevronDown,
  Flame,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated, logout, reviews } = useAuth();
  const navigate = useNavigate();

  const [activeFlowTab, setActiveFlowTab] = useState<'audio' | 'video'>('audio');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleCreatePartyClick = () => {
    if (isAuthenticated) {
      navigate('/create');
    } else {
      navigate('/login?redirect=/create');
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 selection:bg-purple-500 selection:text-white flex flex-col overflow-x-hidden">
      {/* 1. Header Navigation */}
      <header className="w-full border-b border-slate-800/80 bg-[#070913]/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Tagline */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight font-heading text-white leading-none">
                Beats<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Link</span>
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 tracking-wider">
                Suno Dil Ki • Stream In Sync
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <a href="#why-choose-us" className="hover:text-purple-300 transition-colors">
              Why Choose Us
            </a>
            <a href="#how-it-works" className="hover:text-purple-300 transition-colors">
              How It Works
            </a>
            <a href="#flow-lifecycle" className="hover:text-purple-300 transition-colors">
              Audio & Video Flow
            </a>
            <a href="#reviews" className="hover:text-purple-300 transition-colors">
              Reviews
            </a>
            <Link to="/help" className="hover:text-purple-300 transition-colors flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
              Help Manual
            </Link>
          </nav>

          {/* Auth Actions & Profile Menu */}
          <div className="flex items-center gap-3">
            <Link to="/join">
              <Button variant="ghost" size="sm" className="text-zinc-300 text-xs hover:text-white">
                Join Room
              </Button>
            </Link>

            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-zinc-300 text-xs hover:text-white hidden sm:inline-flex">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
                  >
                    Sign Up Free
                  </Button>
                </Link>
              </>
            ) : (
              /* Profile Menu Pill */
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-slate-900 border border-slate-700/80 hover:border-purple-500/60 transition-all text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name.charAt(0)
                    )}
                  </div>
                  <span className="font-semibold text-zinc-200 max-w-[90px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0F1222] border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 animate-slide-up space-y-1">
                    <div className="px-3 py-2 border-b border-slate-800/80">
                      <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="w-4 h-4 text-purple-400">👤</div>
                      <span>My Profile & Settings</span>
                    </Link>

                    <Link
                      to="/create"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <Radio className="w-4 h-4 text-pink-400" />
                      <span>Host a Watch Party</span>
                    </Link>

                    <Link
                      to="/help"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-indigo-400" />
                      <span>Help & User Guide</span>
                    </Link>

                    <div className="pt-1 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden flex-1">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-r from-purple-600/20 via-pink-600/15 to-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-[450px] h-[300px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>GLOBAL SYNC PLAYBACK • SUNO DIL KI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-heading leading-[1.1]">
              Sync Playback with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300">
                Real-Time Synced Rooms
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience YouTube videos and music hits like <strong>Despacito</strong> together with friends in perfect millisecond synchronization. Create private rooms, manage audio lockers, and chat in real-time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                onClick={handleCreatePartyClick}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-purple-600/30 px-6"
              >
                Start Listening / Create Room
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Link to="/help" className="w-full sm:w-auto">
                <Button variant="glass" size="lg" className="w-full sm:w-auto text-sm border-slate-700/80 text-zinc-200">
                  <HelpCircle className="w-4 h-4 mr-2 text-purple-400" />
                  User Guide
                </Button>
              </Link>
            </div>

            {/* Live Stats Indicator */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>0.0s Millisecond Drift Lock</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Authoritative Server Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Cyber DJ Character Stage */}
          <div className="lg:col-span-6 relative">
            <div className="bg-[#0F1222]/95 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
              {/* Window Header Simulation */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono ml-2 text-purple-400 font-bold text-[11px]">beatslink/3d-stage</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  <span>3D DJ LIVE MIXER</span>
                </div>
              </div>

              {/* 3D Cyber DJ Character Stage */}
              <div className="space-y-4 animate-fade-in">
                <div className="relative aspect-square sm:aspect-video rounded-2xl overflow-hidden border border-purple-500/30 bg-slate-950 shadow-2xl group/dj">
                  <img
                    src="/assets/3d_dj_hero.jpg"
                    alt="3D Cyber DJ Host"
                    className="w-full h-full object-cover object-center group-hover/dj:scale-105 transition-transform duration-700"
                  />

                  {/* Holographic Glowing Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070913]/95 via-transparent to-black/30 pointer-events-none" />

                  {/* Floating Top Status Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-purple-900/70 backdrop-blur-md border border-purple-500/40 text-purple-300 text-[10px] font-extrabold flex items-center gap-1.5 shadow-lg">
                      <Headphones className="w-3 h-3 text-pink-400" />
                      MASTER DJ HOST
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1 shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      0.0s DRIFT LOCK
                    </span>
                  </div>

                  {/* Floating DJ Console Track Banner */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#0F1222]/85 backdrop-blur-md border border-purple-500/30 flex items-center justify-between">
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-pink-400 uppercase tracking-wider">NOW MIXING</span>
                          <span className="text-[10px] text-zinc-400">• BPM: 140</span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">
                          Luis Fonsi – Despacito (BeatsLink 3D Remix)
                        </h4>
                      </div>
                    </div>

                    {/* Equalizer animation */}
                    <div className="flex items-end gap-1 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60">
                      <div className="w-1 h-3 bg-purple-400 rounded-full animate-pulse" />
                      <div className="w-1 h-5 bg-pink-400 rounded-full animate-bounce" />
                      <div className="w-1 h-2 bg-indigo-400 rounded-full animate-pulse" />
                      <div className="w-1 h-4 bg-purple-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>

                {/* 3D Console Status Bar */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#151932] border border-slate-800">
                    <span className="text-[10px] text-zinc-400 block">Host Channel</span>
                    <strong className="text-purple-300 font-mono text-xs">CYBER-MIX 01</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#151932] border border-slate-800">
                    <span className="text-[10px] text-zinc-400 block">Audio Engine</span>
                    <strong className="text-pink-300 font-mono text-xs">NEON PULSE 3D</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#151932] border border-slate-800">
                    <span className="text-[10px] text-zinc-400 block">Live Sync</span>
                    <strong className="text-emerald-300 font-mono text-xs">ACTIVE (0.0s)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us Section (Grid) */}
      <section id="why-choose-us" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#0B0D17]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span>Features & Benefits</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              Why Choose BeatsLink WatchParty?
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto">
              Engineered with modern WebSockets, server-authoritative timestamps, and zero-latency drift protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0F1222] border border-slate-800 hover:border-purple-500/50 transition-all space-y-4 shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">Ultra-Low Latency Sync</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Server-authoritative clock drift compensation ensures that every single participant experiences every drop, beat, and scene in exact sub-second sync.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0F1222] border border-slate-800 hover:border-pink-500/50 transition-all space-y-4 shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-pink-600/20 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">Study & Watch Groups</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Perfect for friend circles, study squads, and watch parties. Includes live chat, host role promotion, kick moderation, and control request approvals.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0F1222] border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4 shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HardDrive className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">Audio Locker & Presets</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Save default tracks like Despacito, Lo-Fi chill, and Synthwave into your account's locker for instantaneous 1-click playback during party streams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Timeline */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#070913]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              How It Works in 3 Simple Steps
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Get your party started in seconds with zero hassle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3 p-6 rounded-3xl bg-[#0F1222]/80 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold font-heading flex items-center justify-center mx-auto text-lg shadow-lg shadow-purple-600/30">
                1
              </div>
              <h3 className="text-base font-bold text-white font-heading">Log In & Create Room</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sign in with your BeatsLink profile, select a starter track like Despacito, and launch your room.
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-3xl bg-[#0F1222]/80 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold font-heading flex items-center justify-center mx-auto text-lg shadow-lg shadow-purple-600/30">
                2
              </div>
              <h3 className="text-base font-bold text-white font-heading">Share Party Code</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Copy your unique 5-letter party room code (e.g. WK-7F29Q) or send a 1-click shareable link.
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-3xl bg-[#0F1222]/80 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold font-heading flex items-center justify-center mx-auto text-lg shadow-lg shadow-purple-600/30">
                3
              </div>
              <h3 className="text-base font-bold text-white font-heading">Stream & Chat in Sync</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Play, pause, seek, request songs, and react together in real-time with crystal clear synchronization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Audio & Video Flow Lifecycle Switcher */}
      <section id="flow-lifecycle" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#0B0D17]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              Platform Streaming Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Switch between Audio and Video flows to see how synchronization happens behind the scenes.
            </p>

            {/* Tab Switcher */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveFlowTab('audio')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFlowTab === 'audio'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                AUDIO FLOW
              </button>
              <button
                onClick={() => setActiveFlowTab('video')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFlowTab === 'video'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                VIDEO FLOW
              </button>
            </div>
          </div>

          {/* 4 Step Horizontal Flow Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0F1222] border border-slate-800 space-y-2">
              <span className="text-[10px] font-extrabold text-purple-400 font-mono">STEP 01</span>
              <h4 className="text-sm font-bold text-white font-heading">
                {activeFlowTab === 'audio' ? 'Pick Song / Despacito' : 'Paste YouTube URL'}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {activeFlowTab === 'audio'
                  ? 'Select from preloaded top tracks or search your favorite beats.'
                  : 'Enter any valid YouTube 11-char video ID or share link.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F1222] border border-slate-800 space-y-2">
              <span className="text-[10px] font-extrabold text-purple-400 font-mono">STEP 02</span>
              <h4 className="text-sm font-bold text-white font-heading">
                {activeFlowTab === 'audio' ? 'Save in Audio Locker' : 'Load Video Metadata'}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {activeFlowTab === 'audio'
                  ? 'Store presets in your cloud quota for quick party access.'
                  : 'Extract thumbnails, duration, and stream endpoints.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F1222] border border-slate-800 space-y-2">
              <span className="text-[10px] font-extrabold text-purple-400 font-mono">STEP 03</span>
              <h4 className="text-sm font-bold text-white font-heading">Queue in Room</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Host dispatches track event to all connected WebSocket clients.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F1222] border border-slate-800 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-bl-lg">
                LIVE
              </div>
              <span className="text-[10px] font-extrabold text-emerald-400 font-mono">STEP 04</span>
              <h4 className="text-sm font-bold text-white font-heading">Synced Playback</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Continuous clock sync keeps all viewers locked within 0.75s drift.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* 7. Community Reviews & Testimonials */}
      <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#0B0D17]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Community Feedback</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              Loved by Music Lovers & Watch Partiers
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              See what hosts and listeners have to say about their synchronization experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-[#0F1222] border border-slate-800 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                    {rev.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{rev.author}</h4>
                    <p className="text-[10px] text-zinc-400">{rev.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="text-purple-400 text-xs hover:text-purple-300">
                Write Your Own Review in Profile →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070913] py-10 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-zinc-200 font-heading">BeatsLink WatchParty</span>
              <p className="text-[11px] text-zinc-500">Suno Dil Ki • Real-Time Synchronized Streaming</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <Link to="/help" className="hover:text-white transition-colors">
              Help Manual
            </Link>
            <Link to="/profile" className="hover:text-white transition-colors">
              Profile
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/create" className="hover:text-white transition-colors">
              Host Party
            </Link>
          </div>

          <p>© 2026 BeatsLink Online. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
