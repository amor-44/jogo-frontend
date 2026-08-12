import { apiClient } from './api';
import type { ScoutProfileDto, UpdateScoutProfileCommand } from '../types';

export const scoutService = {
  getMe: () =>
    apiClient.get<ScoutProfileDto>('/scout/me').then((r) => r.data),

  updateMe: (data: UpdateScoutProfileCommand) =>
    apiClient.put<void>('/scout/me', data).then((r) => r.data),
};
export type { ScoutProfileDto };
