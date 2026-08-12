import { apiClient } from './api';
import type { AnalysisReportDto, PageParams, PaginatedResult } from '../types';

export const reportService = {
  getReports: (params?: PageParams) =>
    apiClient
      .get<PaginatedResult<AnalysisReportDto>>('/Reports', { params })
      .then((r) => r.data),

  getReportById: (id: string) =>
    apiClient.get<AnalysisReportDto>(`/Reports/${id}`).then((r) => r.data),
};
