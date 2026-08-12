import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { playerService } from '../services/playerService';
import { scoutService } from '../services/scoutService';
import { extractUserFromToken } from '../utils/jwt';
import type { 
  User, 
  Player, 
  NotificationItem, 
  AuthContextType, 
  PlayerProfileDto,
  ScoutProfileDto 
} from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('jogo_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [playerProfile, setPlayerProfile] = useState<PlayerProfileDto | null>(null);
  const [scoutProfile, setScoutProfile] = useState<ScoutProfileDto | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);

  const [savedPlayerIds, setSavedPlayerIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('jogo_saved_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const tokenClaims = extractUserFromToken(token);
    const role = tokenClaims?.role || user?.role || 'player';

    if (role === 'scout') {
      try {
        const scoutData = await scoutService.getMe();
        if (scoutData) {
          setScoutProfile(scoutData);
          setUser((prev) => {
            const updated: User = {
              id: scoutData.id || tokenClaims?.id || prev?.id || '',
              name: scoutData.organization || prev?.name || 'حساب النادي',
              email: scoutData.email || tokenClaims?.email || prev?.email || '',
              role: 'scout',
              avatar:
                scoutData.avatar ||
                prev?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(scoutData.organization || 'Scout')}&background=2B43A1&color=fff`,
            };
            localStorage.setItem('jogo_user', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.error('Failed to load scout profile on refresh:', err);
      }
    } else {
      try {
        const profile = await playerService.getMe();
        if (profile) {
          setPlayerProfile(profile);
          setUser((prev) => {
            const updated: User = {
              id: profile.id || tokenClaims?.id || prev?.id || '',
              name: profile.fullName || prev?.name || 'اللاعب',
              email: profile.email || tokenClaims?.email || prev?.email || '',
              role: 'player',
              avatar:
                profile.profilePictureUrl ||
                prev?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=2B43A1&color=fff`,
            };
            localStorage.setItem('jogo_user', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.error('Failed to load player profile on refresh:', err);
      }
    }
  }, [user?.role]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshUser();
    }
  }, [refreshUser]);

  const login = async (emailOrUser: string | User, password?: string): Promise<User> => {
    if (typeof emailOrUser === 'string') {
      const authRes = await authService.login({
        email: emailOrUser,
        password: password || '',
      });

      localStorage.setItem('accessToken', authRes.accessToken);
      localStorage.setItem('refreshToken', authRes.refreshToken);

      // Extract user claims from JWT token
      const tokenClaims = extractUserFromToken(authRes.accessToken);
      const isScout = (authRes.role?.toLowerCase() === 'scout') || (tokenClaims?.role === 'scout');
      const resolvedRole: 'scout' | 'player' = isScout ? 'scout' : 'player';
      const resolvedId = tokenClaims?.id || authRes.userId || '';
      const resolvedEmail = emailOrUser || tokenClaims?.email || '';

      let loggedInUser: User = {
        id: resolvedId,
        name: resolvedEmail,
        email: resolvedEmail,
        role: resolvedRole,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedEmail)}&background=2B43A1&color=fff`,
      };

      if (resolvedRole === 'scout') {
        try {
          const scoutData = await scoutService.getMe();
          if (scoutData) {
            setScoutProfile(scoutData);
            loggedInUser = {
              ...loggedInUser,
              name: scoutData.organization || loggedInUser.name,
              avatar: scoutData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(scoutData.organization || 'Scout')}&background=2B43A1&color=fff`,
            };
          }
        } catch {
          // Continue if getMe is not yet available
        }
      } else {
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
    // If token exists, parse it to ensure correct role & id
    const token = localStorage.getItem('accessToken');
    if (token) {
      const claims = extractUserFromToken(token);
      if (claims) {
        userData = {
          ...userData,
          id: userData.id || claims.id,
          role: claims.role || userData.role,
        };
      }
    }
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
    setScoutProfile(null);
  };

  const addPlayer = (newPlayer: Player) => {
    const updated = [newPlayer, ...players];
    setPlayers(updated);
  };

  const toggleSavePlayer = (id: string | number) => {
    const strId = String(id);
    let updated: string[];
    if (savedPlayerIds.includes(strId)) {
      updated = savedPlayerIds.filter(favId => favId !== strId);
    } else {
      updated = [...savedPlayerIds, strId];
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
      scoutProfile,
      players, 
      savedPlayerIds, 
      notifications, 
      unreadCount, 
      login, 
      register,
      logout, 
      addPlayer, 
      toggleSavePlayer, 
      markAllAsRead,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};