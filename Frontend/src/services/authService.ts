import { apiClient } from './api';
import type {
  AuthResponseDto,
  LoginCommand,
  LogoutCommand,
  RefreshCommand,
  RegisterPlayerCommand,
  RegisterScoutCommand,
} from '../types';

export const authService = {
  login: (data: LoginCommand) =>
    apiClient.post<AuthResponseDto>('/auth/login', data).then((r) => r.data),

  registerPlayer: (data: RegisterPlayerCommand) => {
    return apiClient.post<AuthResponseDto>('/auth/register/player', data).then((r) => r.data);
  },

  registerScout: (data: RegisterScoutCommand) =>
    apiClient.post<AuthResponseDto>('/auth/register/scout', data).then((r) => r.data),

  refreshToken: (data: RefreshCommand) =>
    apiClient.post<AuthResponseDto>('/auth/refresh', data).then((r) => r.data),

  logout: (data: LogoutCommand) =>
    apiClient.post<void>('/auth/logout', data).then((r) => r.data),
};
