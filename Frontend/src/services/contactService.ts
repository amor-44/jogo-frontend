import { apiClient } from './api';
import type {
  ContactRequestDto,
  CreateContactRequestCommand,
  RespondToContactRequestDto,
  PaginatedResult,
} from '../types';

export const contactService = {
  createContactRequest: (data: CreateContactRequestCommand) =>
    apiClient
      .post<string>('/contact-requests', data)
      .then((r) => r.data),

  respondToContactRequest: (id: string, data: RespondToContactRequestDto) =>
    apiClient
      .post<void>(`/contact-requests/${id}/respond`, data)
      .then((r) => r.data),

  getPlayerContactRequests: (pageNumber = 1, pageSize = 10) =>
    apiClient
      .get<PaginatedResult<ContactRequestDto>>('/contact-requests/player', {
        params: { pageNumber, pageSize },
      })
      .then((r) => r.data),

  getScoutContactRequests: (pageNumber = 1, pageSize = 10) =>
    apiClient
      .get<PaginatedResult<ContactRequestDto>>('/contact-requests/scout', {
        params: { pageNumber, pageSize },
      })
      .then((r) => r.data),
};
