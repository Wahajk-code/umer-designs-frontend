import 'server-only';
import { getServerEnv } from '@/lib/server/env';
import { buildInternalAttestationHeaders } from '@/lib/server/internal-signature';

export class BackendError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'BackendError';
  }
}

interface CallBackendOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** The caller's own access token, forwarded so Nest can identify the user. Omit for public/auth-bootstrap calls. */
  accessToken?: string;
}

interface BackendErrorShape {
  statusCode: number;
  error: string;
  message: string | string[];
}

/**
 * The only way any BFF route handler talks to Nest. Never called from a
 * 'use client' component — `server-only` enforces that at build time.
 * Attaches the internal HMAC attestation on every call, including calls for
 * "public" content, because the backend's default posture is closed: it only
 * accepts requests that prove they came from this BFF.
 */
export async function callBackend<T>(path: string, options: CallBackendOptions = {}): Promise<T> {
  const env = getServerEnv();
  const method = options.method ?? 'GET';
  const url = `${env.INTERNAL_API_URL}${path}`;

  const headers: Record<string, string> = {
    ...buildInternalAttestationHeaders(env.INTERNAL_HMAC_SECRET, method, path),
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
    });
  } catch {
    // Never leak the backend's address/connection details to callers.
    throw new BackendError(502, 'The service is temporarily unavailable. Please try again.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const shape = data as BackendErrorShape | undefined;
    const message = Array.isArray(shape?.message)
      ? shape.message.join(' ')
      : (shape?.message ?? 'Something went wrong. Please try again.');
    throw new BackendError(response.status, message);
  }

  return data as T;
}
