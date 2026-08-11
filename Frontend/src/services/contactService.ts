import { apiClient } from './api';
import type {
  ContactRequestDto,
  CreateContactRequestCommand,
  RespondToContactRequestDto,
} from '../types';

export const contactService = {
  createContactRequest: (data: CreateContactRequestCommand) =>
    apiClient
      .post<ContactRequestDto>('/contact-requests', data)
      .then((r) => r.data),

  respondToContactRequest: (id: string, data: RespondToContactRequestDto) =>
    apiClient
      .post<ContactRequestDto>(`/contact-requests/${id}/respond`, data)
      .then((r) => r.data),

  getPlayerContactRequests: () =>
    apiClient
      .get<ContactRequestDto[]>('/contact-requests/player')
      .then((r) => r.data),

  getScoutContactRequests: () =>
    apiClient
      .get<ContactRequestDto[]>('/contact-requests/scout')
      .then((r) => r.data),
};
