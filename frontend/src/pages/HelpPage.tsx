import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Zap,
  ShieldCheck,
  Music,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Headphones,
  Sliders,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface FaqItem {
  question: string;
  answer: string;
  category: 'sync' | 'host' | 'audio' | 'troubleshooting';
}

const FAQS: FaqItem[] = [
  {
    category: 'sync',
    question: 'How does BeatsLink real-time synchronization work?',
    answer:
      'BeatsLink uses server-authoritative monotonic timestamps with periodic clock drift calculations. When the Host or Moderator plays, pauses, seeks, or changes a song/video, the state is instantly dispatched to all connected clients. If a client drifts by more than 0.75 seconds, smooth micro-seeks bring it into exact millisecond lockstep.',
  },
  {
    category: 'host',
    question: 'Do I need an account to create or host a watch party room?',
    answer:
      'Yes! To maintain room safety, prevent spam, and link your private audio/video locker, BeatsLink requires hosts to log in first before creating rooms. Guests joining via an invite code or link can join immediately with their display name.',
  },
  {
    category: 'audio',
    question: 'Can I play songs like Despacito, Lo-Fi, and custom YouTube links?',
    answer:
      'Absolutely! BeatsLink comes preloaded with popular default tracks like Luis Fonsi - Despacito ft. Daddy Yankee, Rick Astley, and Lo-Fi Study Streams in your Audio Locker. You can also paste any valid YouTube video URL or 11-character video ID at any moment during the party.',
  },
  {
    category: 'host',
    question: 'What are the different roles in a room (Host, Moderator, Participant)?',
    answer:
      '• Host: The room creator with complete control over video selection, playback, participant moderation, and role assignments.\n• Moderator: Can pause, play, seek, and change songs for everyone.\n• Participant: Can watch in sync, chat, and submit playback or song change requests to the host.',
  },
  {
    category: 'troubleshooting',
    question: 'What should I do if the YouTube audio does not start automatically?',
    answer:
      'Modern web browsers (like Chrome, Safari, and Edge) enforce strict autoplay policies. If playback is blocked, simply click the purple "Click to Start / Unblock Audio" banner on the video player to grant audio permission.',
  },
  {
    category: 'sync',
    question: 'How do control requests work for participants?',
    answer:
      'If you are a Participant and want to skip a track or seek to a specific timestamp, click "Request Play/Pause/Seek/Change Video". The host receives an instant notification badge and can click Approve (which applies the action for everyone) or Reject.',
  },
];

export const HelpPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFaqs =
    activeCategory === 'all' ? FAQS : FAQS.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#070913]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <div className="h-4 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-tight font-heading text-white">
                Beats<span className="text-purple-400">Link</span> Help Manual
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/join">
              <Button variant="ghost" size="sm" className="text-zinc-300">
                Join Room
              </Button>
            </Link>
            <Link to="/create">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold">
                Create Party
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Title Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Complete User Guide & Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
            How to Use <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300">BeatsLink</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
            Everything you need to know about setting up rooms, managing synchronized playlists, inviting friends, and mastering host playback controls.
          </p>
        </div>

        {/* 3 Step Visual Quick Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0F1222] border border-slate-800 space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-white font-heading">Sign In & Create Room</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Log in with your free BeatsLink account, select your starting track (e.g. Despacito or custom URL), and generate a unique party code.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0F1222] border border-slate-800 space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-white font-heading">Invite Friends Instantly</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Copy the 1-click invite link or 5-character room code (e.g., WK-7F29Q) and share it anywhere.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0F1222] border border-slate-800 space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-pink-600/20 text-pink-400 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-white font-heading">Stream & Chat in Sync</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enjoy zero-latency audio and video playback, live emojis, interactive request moderation, and locker playlists.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0F1222] to-[#0B0D17] border border-slate-800 space-y-6">
          <h2 className="text-xl font-bold font-heading text-white text-center">Core Architectural Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <Zap className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Server-Authoritative Clock</strong>
                <span className="text-zinc-400">Drift auto-correction ensures every connected viewer hears the same beat.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Host & Moderator RBAC</strong>
                <span className="text-zinc-400">Promote trusted co-hosts or kick troublesome guests with 1 click.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <Music className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Audio & Video Locker</strong>
                <span className="text-zinc-400">Save your favorite YouTube music, podcasts, and study tracks in your profile.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <Sliders className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Participant Control Requests</strong>
                <span className="text-zinc-400">Allows non-hosts to request plays, pauses, or songs without hijacking the stream.</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold font-heading text-white">Frequently Asked Questions</h2>
            <div className="flex flex-wrap gap-1.5 bg-[#0F1222] p-1 rounded-xl border border-slate-800 text-xs">
              {['all', 'sync', 'host', 'audio', 'troubleshooting'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0F1222] border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
                  >
                    <span className="text-sm font-bold text-zinc-100">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-slate-800/60 whitespace-pre-line animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
