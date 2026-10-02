import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  favoriteGenre?: string;
  createdAt: number;
  roomsHosted: number;
  watchTimeMinutes: number;
}

export interface SavedRoom {
  code: string;
  name: string;
  createdAt: number;
}

export interface ReviewItem {
  id: string;
  author: string;
  role: string;
  stars: number;
  text: string;
  date: string;
}

export interface LockerItem {
  id: string;
  title: string;
  artist: string;
  videoId: string;
  duration: string;
  thumbnail: string;
  category: 'music' | 'study' | 'video';
}

export const DEFAULT_LOCKER_SONGS: LockerItem[] = [
  {
    id: 'despacito',
    title: 'Despacito ft. Daddy Yankee',
    artist: 'Luis Fonsi',
    videoId: 'kJQP7kiw5Fk',
    duration: '4:42',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    category: 'music',
  },
  {
    id: 'never-gonna-give-you-up',
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    videoId: 'dQw4w9WgXcQ',
    duration: '3:32',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    category: 'music',
  },
  {
    id: 'lofi-beats',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    artist: 'Lofi Girl',
    videoId: 'jfKfPfyJRdk',
    duration: 'Live / 3:45',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    category: 'study',
  },
  {
    id: 'blinding-lights',
    title: 'Blinding Lights (Official Music Video)',
    artist: 'The Weeknd',
    videoId: '4NRXx6U8ABQ',
    duration: '4:20',
    thumbnail: 'https://img.youtube.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    category: 'music',
  },
  {
    id: 'shape-of-you',
    title: 'Shape of You (Official Music Video)',
    artist: 'Ed Sheeran',
    videoId: 'JGwWNGJdvx8',
    duration: '4:23',
    thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    category: 'music',
  },
  {
    id: 'synthwave-chill',
    title: 'Synthwave Radio - Chill Retro Electro',
    artist: 'Lofi Synth',
    videoId: '4xDzrJKXOOY',
    duration: 'Live Stream',
    thumbnail: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    category: 'study',
  },
];

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Kunal Deshmukh',
    role: 'Music Producer & Host',
    stars: 5,
    text: 'BeatsLink WatchParty is insane! The zero-latency sync while listening to Despacito and new track drops with my friends across different cities is flawless.',
    date: 'Yesterday',
  },
  {
    id: 'rev-2',
    author: 'Ananya Mishra',
    role: 'Virtual Study Group Lead',
    stars: 5,
    text: 'We use the private rooms for our daily coding study sessions with lofi streams in background. Host moderation and chat keep everything super organized.',
    date: '3 days ago',
  },
  {
    id: 'rev-3',
    author: 'Rohan Joshi',
    role: 'DJ & Sound Enthusiast',
    stars: 5,
    text: 'The UI touch and feel is exceptionally premium. Clean audio lockers, instant room links, and server-authoritative playback. Best sync app hands down!',
    date: '1 week ago',
  },
];

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  guestLogin: (name?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  savedRooms: SavedRoom[];
  addSavedRoom: (code: string, name?: string) => void;
  reviews: ReviewItem[];
  submitReview: (stars: number, text: string) => void;
  lockerSongs: LockerItem[];
  addLockerSong: (song: LockerItem) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'beatslink_auth_user';
const SAVED_ROOMS_KEY = 'beatslink_saved_rooms';
const REVIEWS_KEY = 'beatslink_user_reviews';
const LOCKER_KEY = 'beatslink_locker_songs';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_ROOMS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const stored = localStorage.getItem(REVIEWS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [lockerSongs, setLockerSongs] = useState<LockerItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCKER_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_LOCKER_SONGS;
    } catch {
      return DEFAULT_LOCKER_SONGS;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(SAVED_ROOMS_KEY, JSON.stringify(savedRooms));
  }, [savedRooms]);

  useEffect(() => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(LOCKER_KEY, JSON.stringify(lockerSongs));
  }, [lockerSongs]);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please provide a valid email address.');
      return false;
    }

    // Default username derived from email
    const username = cleanEmail.split('@')[0];
    const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);

    const loggedInUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: capitalizedName,
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
      bio: 'Music and watch party lover 🎶',
      favoriteGenre: 'Pop & EDM',
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      roomsHosted: 4,
      watchTimeMinutes: 180,
    };

    setUser(loggedInUser);
    toast.success(`Welcome back, ${loggedInUser.name}!`);
    return true;
  };

  const register = async (name: string, email: string, _password?: string): Promise<boolean> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      toast.error('Name must be at least 2 characters.');
      return false;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please provide a valid email address.');
      return false;
    }

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanName}`,
      bio: 'New BeatsLink Member ✨',
      favoriteGenre: 'All Genres',
      createdAt: Date.now(),
      roomsHosted: 0,
      watchTimeMinutes: 0,
    };

    setUser(newUser);
    toast.success(`Account created! Welcome, ${newUser.name}.`);
    return true;
  };

  const guestLogin = (name?: string) => {
    const demoName = name?.trim() || 'BeatsParty Host';
    const guestUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: demoName,
      email: `${demoName.toLowerCase().replace(/\s+/g, '')}@beatslink.online`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${demoName}`,
      bio: 'Streaming high quality beats with friends 🎧',
      favoriteGenre: 'Latin Pop & Lo-Fi',
      createdAt: Date.now(),
      roomsHosted: 1,
      watchTimeMinutes: 45,
    };
    setUser(guestUser);
    toast.success(`Logged in as ${guestUser.name}!`);
  };

  const logout = () => {
    setUser(null);
    toast.info('Logged out successfully.');
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    toast.success('Profile updated successfully!');
  };

  const addSavedRoom = (code: string, name?: string) => {
    setSavedRooms((prev) => {
      const exists = prev.some((r) => r.code === code);
      if (exists) return prev;
      return [{ code, name: name || 'Watch Party Room', createdAt: Date.now() }, ...prev];
    });
    if (user) {
      setUser((prev) => (prev ? { ...prev, roomsHosted: prev.roomsHosted + 1 } : prev));
    }
  };

  const submitReview = (stars: number, text: string) => {
    const authorName = user?.name || 'Anonymous Listener';
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: authorName,
      role: 'Community Member',
      stars: Math.max(1, Math.min(5, stars)),
      text: text.trim(),
      date: 'Just now',
    };
    setReviews((prev) => [newRev, ...prev]);
    toast.success('Thank you for your review on BeatsLink!');
  };

  const addLockerSong = (song: LockerItem) => {
    setLockerSongs((prev) => [song, ...prev.filter((s) => s.videoId !== song.videoId)]);
    toast.success(`Added "${song.title}" to your audio locker!`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        register,
        guestLogin,
        logout,
        updateProfile,
        savedRooms,
        addSavedRoom,
        reviews,
        submitReview,
        lockerSongs,
        addLockerSong,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
