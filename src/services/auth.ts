import api from './api';
import {AuthResponse, LoginCredentials, RegisterCredentials} from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const {data} = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const {data} = await api.post<AuthResponse>('/auth/register', credentials);
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async me(): Promise<AuthResponse> {
    const {data} = await api.get<AuthResponse>('/auth/me');
    return data;
  },
};
