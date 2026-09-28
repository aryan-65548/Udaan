export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  code: string;
  details?: unknown;
  status: number;

  constructor(status: number, error: ApiErrorPayload) {
    super(error.message || 'An unexpected server error occurred');
    this.name = 'ApiClientError';
    this.status = status;
    this.code = error.code || 'UNKNOWN_ERROR';
    this.details = error.details;
  }
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const AUTH_TOKENS_KEY = 'udaan_auth_tokens';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export function getStoredTokens(): StoredTokens | null {
  try {
    const raw = localStorage.getItem(AUTH_TOKENS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: StoredTokens | null) {
  if (tokens) {
    localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(AUTH_TOKENS_KEY);
  }
}

let activeRefreshPromise: Promise<string | null> | null = null;

async function doRefreshToken(refreshToken: string): Promise<string | null> {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newTokens: StoredTokens = {
          accessToken: refreshData.data.accessToken,
          refreshToken: refreshData.data.refreshToken,
        };
        setStoredTokens(newTokens);
        return newTokens.accessToken;
      } else {
        setStoredTokens(null);
        window.dispatchEvent(new CustomEvent('udaan:auth_expired'));
        return null;
      }
    } catch {
      setStoredTokens(null);
      window.dispatchEvent(new CustomEvent('udaan:auth_expired'));
      return null;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const tokens = getStoredTokens();
  if (tokens?.accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized with token refresh if possible
  if (
    response.status === 401 &&
    tokens?.refreshToken &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/register') &&
    !endpoint.includes('/auth/refresh')
  ) {
    const newAccessToken = await doRefreshToken(tokens.refreshToken);
    if (newAccessToken) {
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  // Parse response
  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorPayload: ApiErrorPayload = data?.error || {
      code: response.status === 404 ? 'NOT_FOUND' : 'SERVER_ERROR',
      message: typeof data === 'string' ? data : 'Request failed',
    };
    throw new ApiClientError(response.status, errorPayload);
  }

  return data?.data !== undefined ? data.data : data;
}
