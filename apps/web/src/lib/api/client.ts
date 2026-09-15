import { ApiResponse } from '@repo/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

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
    const res = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });

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
