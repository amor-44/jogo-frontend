import React, { createContext, useContext, useState } from 'react';

export interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  country: string;
  foot: string;
  club: string;
  height: string;
  overall: number;
  aiScore: number;
  value: string;
  image?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

interface User {
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  players: Player[];
  savedPlayerIds: number[];
  notifications: NotificationItem[];
  unreadCount: number;
  login: (userData: User) => void;
  register: (userData: User) => void;
  logout: () => void;
  addPlayer: (player: Player) => void;
  toggleSavePlayer: (id: number) => void;
  markAllAsRead: () => void;
}

const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: "عبدالرحمن الغامدي", position: "وسط", age: 22, country: "السعودية", foot: "اليمنى", club: "الاتفاق", height: "178 سم", overall: 82, aiScore: 89, value: "€2.5M" },
  { id: 2, name: "محمد القحطاني", position: "مهاجم", age: 20, country: "السعودية", foot: "اليسرى", club: "الهلال", height: "175 سم", overall: 85, aiScore: 92, value: "€4.0M" },
  { id: 3, name: "أحمد الرشيدي", position: "مدافع", age: 12, country: "مصر", foot: "اليمنى", club: "الأهلي (براعم)", height: "150 سم", overall: 70, aiScore: 85, value: "€50K" },
  { id: 4, name: "رياض محرز", position: "جناح", age: 33, country: "الجزائر", foot: "اليسرى", club: "الأهلي السعودي", height: "179 سم", overall: 86, aiScore: 89, value: "€12M" },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, title: "تحليل جديد جاهز", desc: "قام المدرب الذكي بتحديث تقرير أداء اللاعب عبدالرحمن الغامدي.", time: "منذ 10 دقائق", read: false },
  { id: 2, title: "لاعب جديد مضاف", desc: "انضم لاعب جديد بنفس اهتماماتك الرياضية إلى المنصة.", time: "منذ ساعة", read: false },
  { id: 3, title: "ترشيح ذكي", desc: "الذكاء الاصطناعي يوصي بمشاهدة ملف اللاعب رياض محرز.", time: "منذ 3 ساعات", read: false },
];

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('jogo_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('jogo_players');
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [savedPlayerIds, setSavedPlayerIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('jogo_saved_ids');
    return saved ? JSON.parse(saved) : [1];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('jogo_user', JSON.stringify(userData));
  };

  const register = (userData: User) => {
    setUser(userData);
    localStorage.setItem('jogo_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jogo_user');
  };

  const addPlayer = (newPlayer: Player) => {
    const updated = [newPlayer, ...players];
    setPlayers(updated);
    localStorage.setItem('jogo_players', JSON.stringify(updated));
  };

  const toggleSavePlayer = (id: number) => {
    let updated: number[];
    if (savedPlayerIds.includes(id)) {
      updated = savedPlayerIds.filter(favId => favId !== id);
    } else {
      updated = [...savedPlayerIds, id];
    }
    setSavedPlayerIds(updated);
    localStorage.setItem('jogo_saved_ids', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      players, 
      savedPlayerIds, 
      notifications, 
      unreadCount, 
      login, 
      register,
      logout, 
      addPlayer, 
      toggleSavePlayer, 
      markAllAsRead 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};