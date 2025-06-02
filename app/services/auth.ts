import axiosInstance from '@/app/lib/axios';
import { AxiosError } from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: User;
}

export class AuthService {
  static async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const { data } = await axiosInstance.post<LoginResponse>('/login', {
        email,
        password,
      });
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      return data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Terjadi kesalahan saat login');
    }
  }

  static async getMe(): Promise<User> {
    try {
      const { data } = await axiosInstance.get<MeResponse>('/me');
      return data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Terjadi kesalahan saat mengambil data user');
    }
  }

  static async logout(): Promise<void> {
    try {
      await axiosInstance.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!this.getToken();
  }
} 