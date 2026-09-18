export type { User as ProfileUser } from '../../auth/types/auth.types';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  preferredLanguage?: string;
  locale?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}