export type UserRole =
  | 'FARMER'
  | 'FPO'
  | 'BUYER'
  | 'WAREHOUSE_MANAGER'
  | 'TRANSPORT_PROVIDER'
  | 'ADMIN';

export interface AuthUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  full_name: string;
  roles: UserRole[];
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expires_at: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const TOKEN_KEY = 'smartmandi_session_token';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || 'Authentication request failed');
  }
  return body as T;
}

export async function authenticatedRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return request<T>(path, options);
}

export async function login(identifier: string, password: string): Promise<AuthSession> {
  const session = await request<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
  localStorage.setItem(TOKEN_KEY, session.token);
  return session;
}

export async function register(input: {
  email?: string;
  phone?: string;
  password: string;
  full_name: string;
  role: UserRole;
}): Promise<AuthSession> {
  const session = await request<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  localStorage.setItem(TOKEN_KEY, session.token);
  return session;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!localStorage.getItem(TOKEN_KEY)) return null;
  try {
    const response = await request<{ user: AuthUser }>('/auth/me');
    return response.user;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    if (localStorage.getItem(TOKEN_KEY)) {
      await request('/auth/logout', { method: 'POST' });
    }
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function hasRole(user: AuthUser | null, roles: UserRole[]): boolean {
  return Boolean(user && roles.some((role) => user.roles.includes(role)));
}
