import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { playerService } from '../services/playerService';
import type { User, Player, NotificationItem, AuthContextType, PlayerProfileDto } from '../types';

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

  const [playerProfile, setPlayerProfile] = useState<PlayerProfileDto | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);

  const [savedPlayerIds, setSavedPlayerIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('jogo_saved_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      playerService.getMe()
        .then((profile) => {
          if (profile) {
            setPlayerProfile(profile);
            setUser((prev) => ({
              id: profile.id,
              name: profile.fullName || prev?.name || '',
              email: profile.email || prev?.email || '',
              role: prev?.role || 'player',
              avatar: profile.profilePictureUrl || prev?.avatar,
            }));
          }
        })
        .catch(() => {
          // Token could be for scout or expired
        });
    }
  }, []);

  const login = async (emailOrUser: string | User, password?: string): Promise<User> => {
    if (typeof emailOrUser === 'string') {
      const authRes = await authService.login({
        email: emailOrUser,
        password: password || '',
      });

      localStorage.setItem('accessToken', authRes.accessToken);
      localStorage.setItem('refreshToken', authRes.refreshToken);

      const isScoutOrClub =
        authRes.user.role?.toLowerCase() === 'scout' ||
        authRes.user.role?.toLowerCase() === 'club';

      let loggedInUser: User = {
        id: authRes.user.id,
        name: authRes.user.fullName || authRes.user.email,
        email: authRes.user.email,
        role: isScoutOrClub ? 'club' : 'player',
        avatar:
          authRes.user.profilePictureUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(authRes.user.fullName || 'User')}&background=2B43A1&color=fff`,
      };

      if (!isScoutOrClub) {
        try {
          const profile = await playerService.getMe();
          if (profile) {
            setPlayerProfile(profile);
            loggedInUser = {
              ...loggedInUser,
              name: profile.fullName || loggedInUser.name,
              avatar: profile.profilePictureUrl || loggedInUser.avatar,
            };
          }
        } catch {
          // Continue if getMe is not available
        }
      }

      setUser(loggedInUser);
      localStorage.setItem('jogo_user', JSON.stringify(loggedInUser));
      return loggedInUser;
    } else {
      setUser(emailOrUser);
      localStorage.setItem('jogo_user', JSON.stringify(emailOrUser));
      return emailOrUser;
    }
  };

  const register = (userData: User) => {
    setUser(userData);
    localStorage.setItem('jogo_user', JSON.stringify(userData));
  };

  const logout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await authService.logout({ refreshToken }).catch(() => {});
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('jogo_user');
    setUser(null);
    setPlayerProfile(null);
  };

  const addPlayer = (newPlayer: Player) => {
    const updated = [newPlayer, ...players];
    setPlayers(updated);
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
      playerProfile,
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