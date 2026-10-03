import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import {
  loginApi,
  registerApi,
  updateProfileApi,
  addCreatedRoomApi,
  addJoinedRoomApi,
  removeCreatedRoomApi,
  removeJoinedRoomApi,
  clearJoinedHistoryApi,
} from '../services/api';

export interface SavedRoom {
  code: string;
  name: string;
  createdAt: number;
}

export interface JoinedRoomHistory {
  code: string;
  name: string;
  joinedAt: number;
  hostName?: string;
}

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
  createdRooms: SavedRoom[];
  joinedRooms: JoinedRoomHistory[];
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
    text: 'WatchParty is insane! The zero-latency sync while listening to Despacito and new track drops with my friends across different cities is flawless.',
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

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<AuthResult>;
  register: (name: string, email: string, password?: string) => Promise<AuthResult>;
  guestLogin: (name?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  
  // User specific Created Rooms
  createdRooms: SavedRoom[];
  addCreatedRoom: (code: string, name?: string) => void;
  removeCreatedRoom: (code: string) => void;

  // User specific Previously Joined Rooms History
  joinedRooms: JoinedRoomHistory[];
  addJoinedRoom: (code: string, name?: string, hostName?: string) => void;
  removeJoinedRoom: (code: string) => void;
  clearJoinedHistory: () => void;

  // Aliases for compatibility
  savedRooms: SavedRoom[];
  addSavedRoom: (code: string, name?: string) => void;

  reviews: ReviewItem[];
  submitReview: (stars: number, text: string) => void;
  lockerSongs: LockerItem[];
  addLockerSong: (song: LockerItem) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'watchparty_auth_user';
const REVIEWS_KEY = 'watchparty_user_reviews';
const LOCKER_KEY = 'watchparty_locker_songs';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Current active logged in user - NULL by default so site starts clean in guest mode
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          createdRooms: parsed.createdRooms || [],
          joinedRooms: parsed.joinedRooms || [],
        };
      }
      return null;
    } catch {
      return null;
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

  // Save active user session to sessionStorage
  useEffect(() => {
    if (user) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(LOCKER_KEY, JSON.stringify(lockerSongs));
  }, [lockerSongs]);

  /**
   * Database-backed Login: Validates against SQLite backend database
   */
  const login = async (email: string, password?: string): Promise<AuthResult> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = 'Please provide a valid email address.';
      toast.error(msg);
      return { success: false, message: msg };
    }

    if (!password || password.trim().length < 4) {
      const msg = 'Password must be at least 4 characters.';
      toast.error(msg);
      return { success: false, message: msg };
    }

    try {
      const dbUser = await loginApi(cleanEmail, password);
      setUser(dbUser);
      toast.success(`Welcome back, ${dbUser.name}!`);
      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.message || 'Login failed. Please verify your credentials.';
      toast.error(errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  /**
   * Database-backed Account Creation / Register
   */
  const register = async (name: string, email: string, password?: string): Promise<AuthResult> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      const msg = 'Name must be at least 2 characters.';
      toast.error(msg);
      return { success: false, message: msg };
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = 'Please provide a valid email address.';
      toast.error(msg);
      return { success: false, message: msg };
    }

    if (!password || password.length < 4) {
      const msg = 'Password must be at least 4 characters.';
      toast.error(msg);
      return { success: false, message: msg };
    }

    try {
      const newUser = await registerApi(cleanName, cleanEmail, password);
      setUser(newUser);
      toast.success(`Account created! Welcome to WatchParty, ${newUser.name}.`);
      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const guestLogin = async (name?: string) => {
    const demoName = name?.trim() || 'Alex Carter';
    const demoEmail = 'alex@watchparty.live';
    const demoPass = 'password123';

    // Try login or register on database
    try {
      const dbUser = await loginApi(demoEmail, demoPass);
      setUser(dbUser);
      toast.success(`Logged in as ${dbUser.name}!`);
    } catch {
      try {
        const newUser = await registerApi(demoName, demoEmail, demoPass);
        setUser(newUser);
        toast.success(`Demo account created and logged in!`);
      } catch (err: any) {
        toast.error('Failed demo login');
      }
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast.info('Logged out successfully.');
  };

  /**
   * Update profile information & avatar photo (committed only on explicit save)
   */
  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated: AuthUser = {
      ...user,
      ...updates,
      createdRooms: user.createdRooms || [],
      joinedRooms: user.joinedRooms || [],
    };
    setUser(updated);

    // Sync to database
    try {
      await updateProfileApi({
        userId: user.id,
        name: updates.name,
        bio: updates.bio,
        favoriteGenre: updates.favoriteGenre,
        avatar: updates.avatar,
      });
      toast.success('Profile and changes saved successfully!');
    } catch {
      toast.success('Profile updated locally!');
    }
  };

  /**
   * Add a room created by THIS logged-in user only
   */
  const addCreatedRoom = (code: string, name?: string) => {
    if (!user) return;
    const cleanCode = code.trim().toUpperCase();
    const roomName = name?.trim() || `${user.name}'s Watch Party`;
    const newRoom: SavedRoom = {
      code: cleanCode,
      name: roomName,
      createdAt: Date.now(),
    };

    const existingRooms = user.createdRooms || [];
    const filtered = existingRooms.filter((r) => r.code !== cleanCode);
    const updatedRooms = [newRoom, ...filtered];

    const updatedUser: AuthUser = {
      ...user,
      createdRooms: updatedRooms,
      roomsHosted: updatedRooms.length,
    };

    setUser(updatedUser);
    addCreatedRoomApi(user.id, cleanCode, roomName);
  };

  /**
   * Remove a created room for THIS user
   */
  const removeCreatedRoom = (code: string) => {
    if (!user) return;
    const cleanCode = code.trim().toUpperCase();
    const updatedRooms = (user.createdRooms || []).filter((r) => r.code !== cleanCode);
    const updatedUser: AuthUser = {
      ...user,
      createdRooms: updatedRooms,
      roomsHosted: updatedRooms.length,
    };
    setUser(updatedUser);
    removeCreatedRoomApi(user.id, cleanCode);
    toast.info(`Room ${cleanCode} removed from your created rooms.`);
  };

  /**
   * Add a room to THIS logged-in user's Previously Joined Rooms History
   */
  const addJoinedRoom = (code: string, name?: string, hostName?: string) => {
    if (!user) return;
    const cleanCode = code.trim().toUpperCase();
    const roomName = name?.trim() || 'Watch Party Room';

    const newHistoryItem: JoinedRoomHistory = {
      code: cleanCode,
      name: roomName,
      joinedAt: Date.now(),
      hostName: hostName || undefined,
    };

    const existingHistory = user.joinedRooms || [];
    const filtered = existingHistory.filter((r) => r.code !== cleanCode);
    const updatedHistory = [newHistoryItem, ...filtered];

    const updatedUser: AuthUser = {
      ...user,
      joinedRooms: updatedHistory,
    };

    setUser(updatedUser);
    addJoinedRoomApi(user.id, cleanCode, roomName, hostName);
  };

  /**
   * Remove a single room from THIS user's joined history
   */
  const removeJoinedRoom = (code: string) => {
    if (!user) return;
    const cleanCode = code.trim().toUpperCase();
    const updatedHistory = (user.joinedRooms || []).filter((r) => r.code !== cleanCode);
    const updatedUser: AuthUser = {
      ...user,
      joinedRooms: updatedHistory,
    };
    setUser(updatedUser);
    removeJoinedRoomApi(user.id, cleanCode);
    toast.info(`Room ${cleanCode} removed from joined history.`);
  };

  /**
   * Clear all joined room history for THIS user
   */
  const clearJoinedHistory = () => {
    if (!user) return;
    const updatedUser: AuthUser = {
      ...user,
      joinedRooms: [],
    };
    setUser(updatedUser);
    clearJoinedHistoryApi(user.id);
    toast.info('Joined rooms history cleared.');
  };

  // Compatibility alias
  const addSavedRoom = (code: string, name?: string) => {
    addCreatedRoom(code, name);
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
    toast.success('Thank you for your review on WatchParty!');
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
        createdRooms: user?.createdRooms || [],
        addCreatedRoom,
        removeCreatedRoom,
        joinedRooms: user?.joinedRooms || [],
        addJoinedRoom,
        removeJoinedRoom,
        clearJoinedHistory,
        savedRooms: user?.createdRooms || [],
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
