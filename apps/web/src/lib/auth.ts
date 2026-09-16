import type { ApiResponse } from '@repo/types';
import { fetchApi } from './api/client';

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export interface AuthData {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  expiresAt: number | null;
  emailConfirmationRequired?: boolean;
  user: AuthUser | null;
}

const TOKEN_KEY = 'celebrato_access_token';
const REFRESH_KEY = 'celebrato_refresh_token';

export function getAccessToken() {
  return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
}

export function saveAuth(data: AuthData) {
  if (typeof window === 'undefined') return;
  if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
  if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
}

export function getRefreshToken() {
  return typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_KEY);
}

export async function refreshAuth() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  const response = await fetchApi<AuthData>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.success) {
    clearAuth();
    return null;
  }
  saveAuth(response.data);
  return response.data;
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function login(email: string, password: string) {
  return fetchApi<AuthData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(email: string, password: string) {
  return fetchApi<AuthData>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function confirmEmail(tokenHash: string) {
  return fetchApi<AuthData>('/auth/confirm-email', {
    method: 'POST',
    body: JSON.stringify({ tokenHash }),
  });
}

export async function getCurrentUser(): Promise<ApiResponse<AuthUser>> {
  return fetchApi<AuthUser>('/auth/me', { token: getAccessToken() ?? undefined });
}
