import { apiClient, setStoredTokens, getStoredTokens } from './client';

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  preferredLanguage: 'en' | 'hi' | 'gu';
  businessName?: string | null;
  businessCategory?: string | null;
  operatingState?: string | null;
  operatingDistrict?: string | null;
  experienceLevel?: 'BEGINNER' | 'SOME_EXPERIENCE' | 'EXPERIENCED' | string | null;
  businessBackground?: string | null;
  googleId?: string | null;
  hasPassword?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  preferredLanguage?: 'en' | 'hi' | 'gu';
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const data = await apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setStoredTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setStoredTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const data = await apiClient<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
  setStoredTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data;
}

export async function logout(): Promise<void> {
  const tokens = getStoredTokens();
  if (tokens?.refreshToken) {
    try {
      await apiClient('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
    } catch {
      // Ignore failure on logout
    }
  }
  setStoredTokens(null);
}

export async function getMe(): Promise<User> {
  return apiClient<User>('/users/me');
}

export async function updateProfile(payload: {
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
}): Promise<User> {
  return apiClient<User>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAccount(): Promise<{ success: boolean; message: string }> {
  const result = await apiClient<{ success: boolean; message: string }>('/users/me', {
    method: 'DELETE',
  });
  setStoredTokens(null);
  return result;
}

