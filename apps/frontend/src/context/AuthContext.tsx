import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  type User,
  getMe,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  updateProfile as apiUpdateProfile,
  deleteAccount as apiDeleteAccount,
  loginWithGoogle as apiLoginWithGoogle,
  type LoginPayload,
  type RegisterPayload,
} from '../api/auth';
import { getStoredTokens, setStoredTokens } from '../api/client';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  preferredLanguage?: 'en' | 'hi' | 'gu';
  businessName?: string;
  businessCategory?: string;
  operatingState?: string;
  operatingDistrict?: string;
  experienceLevel?: string;
  businessBackground?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserProfile: (payload: UpdateProfilePayload) => Promise<User>;
  deleteUserAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens?.accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
      setStoredTokens(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleExpired = () => {
      setUser(null);
    };

    window.addEventListener('udaan:auth_expired', handleExpired);
    return () => {
      window.removeEventListener('udaan:auth_expired', handleExpired);
    };
  }, [fetchCurrentUser]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(payload);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await apiLoginWithGoogle(idToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await apiRegister(payload);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (payload: UpdateProfilePayload) => {
    const updated = await apiUpdateProfile(payload);
    setUser(updated);
    return updated;
  };

  const deleteUserAccount = async () => {
    setIsLoading(true);
    try {
      await apiDeleteAccount();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshUser: fetchCurrentUser,
    updateUserProfile,
    deleteUserAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
