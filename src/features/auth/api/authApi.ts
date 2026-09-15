import api, { getRefreshToken } from '../../../config/api';
import type { ApiResponse } from '../../../types/api.types';
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  RefreshTokenResponse,
  MeResponse,
} from '../types/auth.types';

// ─── Login ────────────────────────────────────────────────────────
export const loginApi = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
  return response.data.data;
};

// ─── Register ─────────────────────────────────────────────────────
export const registerApi = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
  return response.data.data;
};

// ─── Refresh token ────────────────────────────────────────────────
export const refreshTokenApi = async (refreshToken?: string): Promise<RefreshTokenResponse> => {
  const token = refreshToken || getRefreshToken();
  const response = await api.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', {
    refreshToken: token,
  });
  return response.data.data;
};

// ─── Get current user ─────────────────────────────────────────────
export const getMeApi = async (): Promise<MeResponse> => {
  const response = await api.get<ApiResponse<MeResponse>>('/auth/me');
  return response.data.data;
};

// ─── Logout ───────────────────────────────────────────────────────
export const logoutApi = async (refreshToken?: string): Promise<void> => {
  const token = refreshToken || getRefreshToken();
  await api.post('/auth/logout', { refreshToken: token });
};

// ─── Forgot password ──────────────────────────────────────────────
export const forgotPasswordApi = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export interface ResetPasswordPayload {
  email?: string;
  code?: string;
  token?: string;
  newPassword: string;
}

// ─── Reset password ───────────────────────────────────────────────
export const resetPasswordApi = async (
  payloadOrToken: ResetPasswordPayload | string,
  newPassword?: string
): Promise<AuthResponse> => {
  const payload =
    typeof payloadOrToken === 'string'
      ? { token: payloadOrToken, newPassword: newPassword! }
      : payloadOrToken;
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/reset-password', payload);
  return response.data.data;
};