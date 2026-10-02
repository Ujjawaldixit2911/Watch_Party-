import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Music,
  Shield,
  Star,
  Tv,
  LogOut,
  Sparkles,
  Play,
  Copy,
  Check,
  Save,
  Clock,
  Radio,
  ArrowLeft,
  ChevronRight,
  HardDrive,
  Plus,
  Camera,
  Upload,
  Image,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

const PRESET_AVATARS = [
  {
    id: '3d-dj',
    label: '3D Cyber DJ',
    url: '/assets/3d_dj_hero.jpg',
  },
  {
    id: 'synth-guy',
    label: 'Neon Producer',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'lofi-girl',
    label: 'Lo-Fi Chill',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-gamer',
    label: 'Cyber Gamer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'sound-artist',
    label: 'Sound Artist',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'dj-bot',
    label: 'Synth Bot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=BeatsPartyDJ',
  },
];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout, savedRooms, reviews, submitReview, lockerSongs, addLockerSong } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'locker' | 'rooms' | 'review' | 'security'>('profile');

  // Edit profile states
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [favoriteGenre, setFavoriteGenre] = useState(user?.favoriteGenre || 'Pop & EDM');
  const [avatarUrlInput, setAvatarUrlInput] = useState(user?.avatar || '');

  // Review form states
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hoverStar, setHoverStar] = useState(0);

  // Locker add song states
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongVideoId, setNewSongVideoId] = useState('');
  const [isAddingSong, setIsAddingSong] = useState(false);

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0F1222] border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">Login Required</h2>
          <p className="text-xs text-zinc-400">Please sign in to view and manage your WatchParty profile.</p>
          <div className="pt-2 flex gap-3 justify-center">
            <Link to="/login">
              <Button variant="primary">Sign In Now</Button>
            </Link>
            <Link to="/">
              <Button variant="ghost">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle local file image upload (converted to base64)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max ~5MB for smooth storage)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        setAvatarUrlInput(base64String);
        updateProfile({ avatar: base64String });
        toast.success('Profile picture updated successfully!');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyAvatarUrl = () => {
    if (!avatarUrlInput.trim()) {
      toast.error('Please enter a valid image URL.');
      return;
    }
    updateProfile({ avatar: avatarUrlInput.trim() });
    toast.success('Profile avatar updated!');
  };

  const handleSelectPresetAvatar = (url: string) => {
    setAvatarUrlInput(url);
    updateProfile({ avatar: url });
    toast.success('Preset avatar selected!');
  };

  const handleResetAvatar = () => {
    const defaultBot = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`;
    setAvatarUrlInput(defaultBot);
    updateProfile({ avatar: defaultBot });
    toast.info('Avatar reset to default.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      favoriteGenre: favoriteGenre.trim(),
      avatar: avatarUrlInput.trim() || user.avatar,
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.error('Please enter your review feedback.');
      return;
    }
    submitReview(reviewStars, reviewText);
    setReviewText('');
    toast.success('Your review has been posted on WatchParty!');
  };

  const handleAddCustomSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSongTitle.trim() || !newSongVideoId.trim()) {
      toast.error('Title and YouTube Video ID are required.');
      return;
    }
    addLockerSong({
      id: `custom-${Date.now()}`,
      title: newSongTitle.trim(),
      artist: newSongArtist.trim() || 'Custom Artist',
      videoId: newSongVideoId.trim(),
      duration: 'Custom',
      thumbnail: `https://img.youtube.com/vi/${newSongVideoId.trim()}/hqdefault.jpg`,
      category: 'music',
    });
    setNewSongTitle('');
    setNewSongArtist('');
    setNewSongVideoId('');
    setIsAddingSong(false);
  };

  const handleCopy = (code: string) => {
    const url = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    toast.success('Room invite link copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    toast.success('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileUpload}
        accept="image/*"
        className="hidden"
      />

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
              <div className="w-8 h-8 rounded-full overflow-hidden p-0.5 bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/30">
                <img
                  src="/assets/3d_dj_logo.jpg"
                  alt="WatchParty Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-sm font-bold tracking-tight font-heading text-white">
                Watch<span className="text-purple-400">Party</span> Profile
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/create">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold">
                <Radio className="w-3.5 h-3.5 mr-1.5" />
                Create Room
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Profile Banner Card */}
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/50 via-[#0F1222] to-indigo-950/40 border border-slate-800/90 p-6 sm:p-8 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Clickable Profile Avatar with Camera Overlay */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 p-1 shadow-xl shadow-purple-600/25">
                <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-extrabold text-white">{user.name.charAt(0)}</span>
                  )}
                  {/* Hover Camera Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                    <Camera className="w-6 h-6 text-purple-300" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Upload</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white border-2 border-slate-950 shadow-md transition-transform group-hover:scale-110"
                title="Upload custom profile photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                  {user.name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold w-fit mx-auto sm:mx-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Room Host & Member
                </span>
              </div>
              <p className="text-xs text-zinc-400">{user.email}</p>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">{user.bio}</p>

              {/* Mini Stats Bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <Tv className="w-4 h-4 text-purple-400" />
                  <span className="text-zinc-400">Rooms Hosted:</span>
                  <span className="font-bold text-white">{user.roomsHosted || savedRooms.length}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span className="text-zinc-400">Watch Time:</span>
                  <span className="font-bold text-white">{user.watchTimeMinutes} mins</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <Music className="w-4 h-4 text-pink-400" />
                  <span className="text-zinc-400">Locker Tracks:</span>
                  <span className="font-bold text-white">{lockerSongs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#0F1222]/80 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Photo</span>
          </button>

          <button
            onClick={() => setActiveTab('locker')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'locker'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Audio Locker</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'rooms'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>My Rooms</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'review'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Give Review</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </button>
        </div>

        {/* Tab 1: Profile Information & Photo Upload */}
        {activeTab === 'profile' && (
          <div className="bg-[#0F1222] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl animate-fade-in">
            {/* Custom Photo Upload Section */}
            <div className="p-6 rounded-2xl bg-[#151932]/70 border border-slate-700/80 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 font-heading">
                    <Camera className="w-4 h-4 text-purple-400" />
                    Custom Profile Photo & Avatar
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Upload your own photo from device, paste an image link, or pick from our 3D presets.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleResetAvatar}
                  className="text-xs border-slate-700 text-zinc-300"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              </div>

              {/* Photo Upload Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  type="button"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo from Device
                </Button>

                <div className="w-full sm:w-auto flex-1 flex gap-2">
                  <Input
                    placeholder="Or paste image URL (https://...)"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    icon={<Image className="w-4 h-4 text-zinc-400" />}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleApplyAvatarUrl}
                    className="h-10 text-xs flex-shrink-0"
                  >
                    Apply URL
                  </Button>
                </div>
              </div>

              {/* Preset Avatars Library */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Quick 3D & Cyberpunk Preset Avatars
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = user.avatar === preset.url;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => handleSelectPresetAvatar(preset.url)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500 shadow-md scale-105'
                            : 'bg-slate-900/60 border-slate-800 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 relative">
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-300 truncate w-full text-center">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Profile Info Form */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold font-heading text-white">Edit Profile Details</h3>
                <p className="text-xs text-zinc-400">Update your stage name, bio, and favorite music taste.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                <Input
                  label="Display Name / Handle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Bio / About Me</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share what kind of music or videos you love streaming..."
                    rows={3}
                    className="w-full bg-[#151932] border border-slate-700/80 rounded-xl p-3 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <Input
                  label="Favorite Genre"
                  value={favoriteGenre}
                  onChange={(e) => setFavoriteGenre(e.target.value)}
                  placeholder="e.g. Latin Pop, Lo-Fi Chill, Synthwave, Rock"
                />

                <div className="pt-2">
                  <Button type="submit" size="md" className="bg-gradient-to-r from-purple-600 to-indigo-600 font-bold">
                    <Save className="w-4 h-4 mr-1.5" />
                    Save All Profile Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Audio & Video Locker (WatchParty Quota / Preset Locker) */}
        {activeTab === 'locker' && (
          <div className="space-y-6 animate-fade-in">
            {/* Storage Quota Card */}
            <div className="bg-[#0F1222] border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Audio & Video Locker Quota</h3>
                  <p className="text-xs text-zinc-400">
                    {lockerSongs.length} tracks saved • 500 MB Free Cloud Cache (Unlimited YouTube Links)
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddingSong(!isAddingSong)}
                className="text-xs border-purple-500/30 text-purple-300"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add New Track
              </Button>
            </div>

            {/* Add Custom Song Box */}
            {isAddingSong && (
              <form
                onSubmit={handleAddCustomSong}
                className="bg-slate-900/90 border border-purple-500/40 rounded-3xl p-5 space-y-4 animate-slide-up"
              >
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Add Song to Your Personal Locker
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Track Title"
                    placeholder="e.g. Blinding Lights"
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    required
                  />
                  <Input
                    label="Artist Name"
                    placeholder="e.g. The Weeknd"
                    value={newSongArtist}
                    onChange={(e) => setNewSongArtist(e.target.value)}
                  />
                  <Input
                    label="YouTube 11-Char Video ID"
                    placeholder="e.g. 4NRXx6U8ABQ"
                    value={newSongVideoId}
                    onChange={(e) => setNewSongVideoId(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingSong(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                    Save to Locker
                  </Button>
                </div>
              </form>
            )}

            {/* Tracks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockerSongs.map((song) => (
                <div
                  key={song.id}
                  className="bg-[#0F1222] border border-slate-800 hover:border-purple-500/50 transition-all rounded-2xl p-4 flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-900 relative flex-shrink-0">
                      <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                      <p className="text-[11px] text-zinc-400 truncate">{song.artist}</p>
                      <span className="inline-block mt-1 text-[10px] text-purple-400 font-mono">
                        ID: {song.videoId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-[10px] text-zinc-500">{song.duration}</span>
                    <div className="flex items-center gap-1.5">
                      <Link to="/create">
                        <Button
                          size="sm"
                          className="h-7 px-2.5 text-[11px] bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white"
                        >
                          <Play className="w-3 h-3 mr-1 fill-current" />
                          Host in Room
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: My Hosted Rooms */}
        {activeTab === 'rooms' && (
          <div className="bg-[#0F1222] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-heading text-white">Your Watch Party Rooms</h2>
                <p className="text-xs text-zinc-400">Quickly re-open or invite friends to your rooms.</p>
              </div>
              <Link to="/create">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  New Room
                </Button>
              </Link>
            </div>

            {savedRooms.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                <Radio className="w-8 h-8 text-zinc-500 mx-auto" />
                <p className="text-xs text-zinc-400">No past rooms recorded yet. Create your first party!</p>
                <Link to="/create">
                  <Button size="sm" variant="secondary">
                    Create a Watch Party
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedRooms.map((r) => (
                  <div
                    key={r.code}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/80 border border-slate-800 rounded-2xl gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-purple-400">{r.code}</span>
                        <span className="text-xs font-medium text-white">{r.name}</span>
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        Created {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopy(r.code)}
                        className="text-xs h-8"
                      >
                        {copiedCode === r.code ? (
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 mr-1" />
                        )}
                        {copiedCode === r.code ? 'Copied' : 'Copy Link'}
                      </Button>
                      <Link to={`/room/${r.code}`}>
                        <Button size="sm" className="text-xs h-8 bg-purple-600 hover:bg-purple-500">
                          Enter Room
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Give Review / Testimonials */}
        {activeTab === 'review' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Review Form */}
            <div className="lg:col-span-6 bg-[#0F1222] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Give Your Feedback</span>
                </div>
                <h2 className="text-xl font-bold font-heading text-white">Review WatchParty</h2>
                <p className="text-xs text-zinc-400">
                  How was your synchronized playback experience? Your feedback helps the community grow.
                </p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Star rating selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoverStar || reviewStars) >= star;
                      return (
                        <button
                          type="button"
                          key={star}
                          onMouseEnter={() => setHoverStar(star)}
                          onMouseLeave={() => setHoverStar(0)}
                          onClick={() => setReviewStars(star)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              active ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs font-bold text-amber-400 font-mono">
                      {reviewStars} / 5 Stars
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Your Experience</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us what you loved: sync precision, host controls, Despacito presets, sound clarity..."
                    rows={4}
                    className="w-full bg-[#151932] border border-slate-700/80 rounded-xl p-3 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="md"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 font-bold shadow-lg shadow-purple-600/25"
                >
                  Submit Public Review
                </Button>
              </form>
            </div>

            {/* Community Reviews Showcase */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className="text-sm font-bold text-white font-heading">Recent Community Testimonials</h3>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-[#0F1222] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{rev.author}</p>
                          <p className="text-[10px] text-zinc-400">{rev.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed italic">"{rev.text}"</p>
                    <span className="text-[10px] text-zinc-500 block text-right">{rev.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Security / Password */}
        {activeTab === 'security' && (
          <div className="bg-[#0F1222] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl max-w-xl animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-heading text-white">Security & Password</h2>
              <p className="text-xs text-zinc-400">Keep your WatchParty account safe and updated.</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button type="submit" size="md" className="bg-gradient-to-r from-purple-600 to-indigo-600 font-bold">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
