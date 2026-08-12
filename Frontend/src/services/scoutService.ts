import { apiClient } from './api';
import type { UpdateProfileCommand } from '../types';

export interface ScoutProfileDto {
  id?: string;
  organization?: string;
  country?: string;
  experienceYears?: number;
  city?: string;
  height?: number;
  weight?: number;
  currentClub?: string;
  biography?: string;
}

export const scoutService = {
  getMe: () =>
    apiClient.get<ScoutProfileDto>('/scout/me').then((r) => r.data),

  updateMe: (data: UpdateProfileCommand) =>
    apiClient.put<void>('/scout/me', data).then((r) => r.data),
};
