const CSRF_COOKIE = 'ud_csrf';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function readCsrfCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
}

/**
 * Client-side helper for calling our own BFF routes (never the backend
 * directly — the browser has no way to reach it). Attaches the CSRF header
 * for mutating requests and retries once after a silent token refresh on 401.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}, _retried = false): Promise<T> {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (MUTATING_METHODS.has(method)) {
    const csrf = readCsrfCookie();
    if (csrf) headers['x-csrf-token'] = csrf;
  }

  const response = await fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && !_retried && path !== '/api/auth/refresh') {
    const refreshHeaders: Record<string, string> = {};
    const refreshCsrf = readCsrfCookie();
    if (refreshCsrf) refreshHeaders['x-csrf-token'] = refreshCsrf;

    const refreshed = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: refreshHeaders,
    });
    if (refreshed.ok) {
      return apiFetch<T>(path, options, true);
    }
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(' ') : (data?.message ?? 'Something went wrong.');
    throw new ApiError(response.status, message);
  }

  return data as T;
}
