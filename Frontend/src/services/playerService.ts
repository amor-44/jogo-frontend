import { apiClient } from './api';
import type {
  PaginatedResult,
  PlayerCardDto,
  PlayerProfileDto,
  PlayersQueryParams,
  UpdateProfileCommand,
} from '../types';

export const playerService = {
  getMe: () =>
    apiClient.get<PlayerProfileDto>('/player/me').then((r) => r.data),

  updateMe: (data: UpdateProfileCommand) =>
    apiClient.put<PlayerProfileDto>('/player/me', data).then((r) => r.data),

  uploadProfilePicture: (formData: FormData) =>
    apiClient
      .post<PlayerProfileDto>('/player/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  getAllPlayers: (params?: PlayersQueryParams) =>
    apiClient
      .get<PaginatedResult<PlayerCardDto>>('/players', { params })
      .then((r) => r.data),

  getPlayerById: (id: string) =>
    apiClient.get<PlayerProfileDto>(`/players/${id}`).then((r) => r.data),
};
