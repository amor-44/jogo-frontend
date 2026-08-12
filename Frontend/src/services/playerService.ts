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
    apiClient.put<void>('/player/me', data).then((r) => r.data),

  uploadProfilePicture: (formData: FormData) =>
    apiClient
      .post<string>('/player/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  getAllPlayers: (params?: PlayersQueryParams) => {
    const queryParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) queryParams.PageNumber = params.page;
      if (params.pageSize !== undefined) queryParams.PageSize = params.pageSize;
      if (params.minAge !== undefined) queryParams.MinAge = params.minAge;
      if (params.maxAge !== undefined) queryParams.MaxAge = params.maxAge;
      if (params.position !== undefined && params.position !== 'الكل') queryParams.Position = params.position;
      if (params.nationality !== undefined && params.nationality !== 'الكل') queryParams.Country = params.nationality;
      // Note: Backend might not support preferredFoot, but keeping it if needed
      // minOverallScore and maxOverallScore can be added if needed
    }

    return apiClient
      .get<PaginatedResult<PlayerCardDto>>('/players', { params: queryParams })
      .then((r) => r.data);
  },

  getPlayerById: (id: string) =>
    apiClient.get<PlayerProfileDto>(`/players/${id}`).then((r) => r.data),
};
