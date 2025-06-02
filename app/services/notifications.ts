import axiosInstance from '@/app/lib/axios';
import { AxiosError } from 'axios';

export interface Notification {
  id: string;
  title: string;
  message: string;
  location: string;
  type: string;
  status: 'read' | 'unread';
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    data: Notification[];
  };
}

export class NotificationsService {
  static async getNotifications(): Promise<Notification[]> {
    try {
      const { data } = await axiosInstance.get<NotificationsResponse>('/officer/notification');
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
      return data.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access');
        }
        if (error.response?.status === 404) {
          throw new Error('Notifications endpoint not found');
        }
      }
      throw new Error('Terjadi kesalahan saat mengambil data notifikasi');
    }
  }
} 