import api from './axios';
import type { User } from '../store/authStore';

// ─── Auth API ─────────────────────────────────────────────────────────────────
// These functions are ready to use — just uncomment the call in Login.tsx.
// The backend sets HttpOnly cookies (access_token + refresh_token) automatically.
// ─────────────────────────────────────────────────────────────────────────────

interface LoginResponse {
    message: string;
    user: User;
}

/**
 * POST /api/auth/login
 * Sends credentials to the server. On success, the server sets HttpOnly cookies
 * (access_token + refresh_token). Returns the logged-in user object.
 */
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
};

/**
 * POST /api/auth/logout
 * Tells the server to invalidate the refresh token and clear cookies.
 */
export const logoutUser = async (): Promise<void> => {
    await api.post('/auth/logout');
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user, or 401 if the cookie is expired.
 * Useful to hydrate the store on page load without re-login.
 */
export const getMe = async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
};
