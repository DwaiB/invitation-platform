import { ApiResponse } from '@repo/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const ACCESS_TOKEN_KEY = 'celebrato_access_token';
const REFRESH_TOKEN_KEY = 'celebrato_refresh_token';

export interface RequestOptions extends RequestInit {
  token?: string;
  devUserId?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { token, devUserId, headers, ...rest } = options;

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  } else if (devUserId || process.env.NODE_ENV !== 'production') {
    requestHeaders['x-dev-user-id'] = devUserId || 'user_dev_001';
  }

  try {
    let res = await fetch(url, { ...rest, headers: requestHeaders });

    if (res.status === 401 && !endpoint.includes('/auth/refresh') && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshResponse.ok) {
          const refreshed = await refreshResponse.json() as { data?: { accessToken?: string; refreshToken?: string } };
          const newToken = refreshed.data?.accessToken;
          if (newToken) {
            localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
            if (refreshed.data?.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshed.data.refreshToken);
            requestHeaders.Authorization = `Bearer ${newToken}`;
            res = await fetch(url, { ...rest, headers: requestHeaders });
          }
        } else {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
    }

    const data = await res.json();
    return data as ApiResponse<T>;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network request failed';
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message,
      },
    };
  }
}
