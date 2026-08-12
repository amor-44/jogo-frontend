import { apiClient } from './api';
import type { VideoDto, PaginatedResult } from '../types';

export const videoService = {
  getVideos: (pageNumber = 1, pageSize = 10) => {
    return apiClient.get<PaginatedResult<VideoDto>>('/Videos', { params: { pageNumber, pageSize } }).then((r) => r.data);
  },

  uploadVideo: (formData: FormData) => {
    return apiClient.post<{ id: string }>('/Videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  getVideoById: (id: string) => {
    return apiClient.get<VideoDto>(`/Videos/${id}`).then((r) => r.data);
  },

  deleteVideo: (id: string) => {
    return apiClient.delete<void>(`/Videos/${id}`).then((r) => r.data);
  },

  analyzeVideo: (id: string) => {
    return apiClient.post<void>(`/Videos/${id}/analysis`).then((r) => r.data);
  },

  retryAnalysis: (id: string) => {
    return apiClient.post<void>(`/Videos/${id}/analysis/retry`).then((r) => r.data);
  },
};
