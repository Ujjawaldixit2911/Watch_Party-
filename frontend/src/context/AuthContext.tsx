import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

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

export interface RegisteredAccount extends AuthUser {
  password?: string;
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

const DEFAULT_SEED_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'usr_demo_1',
    name: 'Alex Carter',
    email: 'alex@watchparty.live',
    password: 'password123',
    avatar: '/assets/3d_dj_hero.jpg',
    bio: '3D DJ Host & Music Producer. Streaming high quality synchronized beats.',
    favoriteGenre: 'Pop & EDM',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    roomsHosted: 2,
    watchTimeMinutes: 240,
    createdRooms: [
      {
        code: 'WK-8F92A',
        name: "Alex's Friday DJ Stage",
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },
      {
        code: 'WK-3K19P',
        name: 'Late Night Beats & Chills',
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      },
    ],
    joinedRooms: [
      {
        code: 'WK-99X21',
        name: 'Lo-Fi Chill Study Squad',
        joinedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        hostName: 'Maya Beats',
      },
      {
        code: 'WK-12T88',
        name: 'Synthwave Night Drive',
        joinedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        hostName: 'Neon DJ',
      },
    ],
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
const ACCOUNTS_STORAGE_KEY = 'watchparty_registered_accounts';
const REVIEWS_KEY = 'watchparty_user_reviews';
const LOCKER_KEY = 'watchparty_locker_songs';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load registered accounts database from localStorage
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    try {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_SEED_ACCOUNTS));
      return DEFAULT_SEED_ACCOUNTS;
    } catch {
      return DEFAULT_SEED_ACCOUNTS;
    }
  });

  // Current active logged in user - starts as NULL by default so site opens in clean guest mode
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      // Clear legacy persistent localStorage auth key so fresh visits are always logged out
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

  // Save registered accounts changes
  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(registeredAccounts));
    } catch (e) {
      console.error('Failed to persist registered accounts', e);
    }
  }, [registeredAccounts]);

  // Save active user session to sessionStorage (clears on tab/browser close)
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

  // Sync user state back into registeredAccounts store
  const syncUserToAccounts = (updatedUser: AuthUser) => {
    setRegisteredAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === updatedUser.id || acc.email.toLowerCase() === updatedUser.email.toLowerCase()) {
          return {
            ...acc,
            ...updatedUser,
            password: acc.password, // preserve password
          };
        }
        return acc;
      })
    );
  };

  /**
   * Strict Login: Only allows login if the user has ALREADY created an account!
   */
  const login = async (email: string, password?: string): Promise<AuthResult> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = 'Please provide a valid email address.';
      toast.error(msg);
      return { success: false, message: msg };
    }

    // Lookup in registered accounts
    const existingAccount = registeredAccounts.find(
      (acc) => acc.email.toLowerCase() === cleanEmail
    );

    if (!existingAccount) {
      const errorMsg = 'No account found with this email. Please create an account first!';
      toast.error(errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    }

    // Verify password if provided
    if (password && existingAccount.password && existingAccount.password !== password) {
      const errorMsg = 'Incorrect password. Please verify your credentials.';
      toast.error(errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    }

    // Log the user in with their full profile and isolated room lists
    const activeUser: AuthUser = {
      id: existingAccount.id,
      name: existingAccount.name,
      email: existingAccount.email,
      avatar: existingAccount.avatar,
      bio: existingAccount.bio || 'Music and watch party lover 🎶',
      favoriteGenre: existingAccount.favoriteGenre || 'Pop & EDM',
      createdAt: existingAccount.createdAt || Date.now(),
      roomsHosted: existingAccount.roomsHosted || existingAccount.createdRooms?.length || 0,
      watchTimeMinutes: existingAccount.watchTimeMinutes || 60,
      createdRooms: existingAccount.createdRooms || [],
      joinedRooms: existingAccount.joinedRooms || [],
    };

    setUser(activeUser);
    toast.success(`Welcome back, ${activeUser.name}!`);
    return { success: true };
  };

  /**
   * Account Creation / Register
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

    // Check if email already registered
    const exists = registeredAccounts.some(
      (acc) => acc.email.toLowerCase() === cleanEmail
    );

    if (exists) {
      const msg = 'An account with this email already exists. Please log in.';
      toast.error(msg);
      return {
        success: false,
        message: msg,
      };
    }

    // Create brand new account
    const newAccount: RegisteredAccount = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: password,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      bio: 'New WatchParty Member ✨ Ready for sync music & stream parties.',
      favoriteGenre: 'Pop & EDM',
      createdAt: Date.now(),
      roomsHosted: 0,
      watchTimeMinutes: 0,
      createdRooms: [],
      joinedRooms: [],
    };

    // Store in accounts list
    setRegisteredAccounts((prev) => [newAccount, ...prev]);

    const activeUser: AuthUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      avatar: newAccount.avatar,
      bio: newAccount.bio,
      favoriteGenre: newAccount.favoriteGenre,
      createdAt: newAccount.createdAt,
      roomsHosted: 0,
      watchTimeMinutes: 0,
      createdRooms: [],
      joinedRooms: [],
    };

    setUser(activeUser);
    toast.success(`Account created! Welcome to WatchParty, ${newAccount.name}.`);
    return { success: true };
  };

  const guestLogin = (name?: string) => {
    const demoName = name?.trim() || 'Alex Carter';
    const demoEmail = 'alex@watchparty.live';
    
    // Find if demo account already exists
    const existing = registeredAccounts.find((acc) => acc.email === demoEmail);
    if (existing) {
      setUser(existing);
      toast.success(`Logged in as ${existing.name}!`);
      return;
    }

    // Else create seed account
    const guestUser: RegisteredAccount = {
      id: `usr_guest_${Date.now()}`,
      name: demoName,
      email: demoEmail,
      password: 'password123',
      avatar: '/assets/3d_dj_hero.jpg',
      bio: 'Streaming high quality sync parties with friends 🎧',
      favoriteGenre: 'Latin Pop & Lo-Fi',
      createdAt: Date.now(),
      roomsHosted: 1,
      watchTimeMinutes: 45,
      createdRooms: [],
      joinedRooms: [],
    };

    setRegisteredAccounts((prev) => [guestUser, ...prev]);
    setUser(guestUser);
    toast.success(`Logged in as ${guestUser.name}!`);
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
  const updateProfile = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated: AuthUser = {
      ...user,
      ...updates,
      createdRooms: user.createdRooms || [],
      joinedRooms: user.joinedRooms || [],
    };
    setUser(updated);
    syncUserToAccounts(updated);
    toast.success('Profile and changes saved successfully!');
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
    syncUserToAccounts(updatedUser);
  };

  /**
   * Remove a created room for THIS user
   */
  const removeCreatedRoom = (code: string) => {
    if (!user) return;
    const updatedRooms = (user.createdRooms || []).filter((r) => r.code !== code);
    const updatedUser: AuthUser = {
      ...user,
      createdRooms: updatedRooms,
      roomsHosted: updatedRooms.length,
    };
    setUser(updatedUser);
    syncUserToAccounts(updatedUser);
    toast.info(`Room ${code} removed from your created rooms.`);
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
    syncUserToAccounts(updatedUser);
  };

  /**
   * Remove a single room from THIS user's joined history
   */
  const removeJoinedRoom = (code: string) => {
    if (!user) return;
    const updatedHistory = (user.joinedRooms || []).filter((r) => r.code !== code);
    const updatedUser: AuthUser = {
      ...user,
      joinedRooms: updatedHistory,
    };
    setUser(updatedUser);
    syncUserToAccounts(updatedUser);
    toast.info(`Room ${code} removed from joined history.`);
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
    syncUserToAccounts(updatedUser);
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
