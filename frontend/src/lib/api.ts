import { getToken, clearSession } from './session';
import { FieldError } from '@/types';

export class ApiError extends Error {
  status: number;
  fieldErrors?: FieldError[];

  constructor(status: number, message: string, fieldErrors?: FieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null;
  skipAuth?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, skipAuth, headers, ...rest } = options;
  const resolvedToken = skipAuth ? null : (token || getToken());

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (resolvedToken) {
    reqHeaders['Authorization'] = `Bearer ${resolvedToken}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      cache: options.cache || 'no-store',
      headers: reqHeaders,
      ...rest,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network connection failed';
    throw new ApiError(0, `Cannot connect to server (${errorMsg}). Please verify the backend is running.`);
  }

  // Handle 401 Unauthorized: clear session and redirect to /auth/login
  if (response.status === 401) {
    clearSession();
    if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login' && window.location.pathname !== '/auth/register') {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/auth/login';
    }
  }

  let data: unknown = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorObj = data as { error?: string; details?: FieldError[] } | null;
    const message = errorObj?.error || response.statusText || 'Request failed';
    const fieldErrors = errorObj?.details;
    throw new ApiError(response.status, message, fieldErrors);
  }

  return data as T;
}
