import { apiClient } from './api';
import type { VideoDto } from '../types';

export const videoService = {
  getVideos: () =>
    apiClient.get<VideoDto[]>('/Videos').then((r) => r.data),

  uploadVideo: (formData: FormData) =>
    apiClient
      .post<VideoDto>('/Videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  getVideoById: (id: string) =>
    apiClient.get<VideoDto>(`/Videos/${id}`).then((r) => r.data),

  deleteVideo: (id: string) =>
    apiClient.delete<void>(`/Videos/${id}`).then((r) => r.data),

  analyzeVideo: (id: string) =>
    apiClient.post<void>(`/Videos/${id}/analysis`).then((r) => r.data),
};
