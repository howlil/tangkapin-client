import axiosInstance from '@/app/lib/axios';
import { AxiosError } from 'axios';

export interface Report {
  id: string;
  title: string;
  status: string;
  location: string;
  created_at: string;
  report_image: string;
  incident_type: string;
  cctv_name: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface LatestReportsResponse {
  success: boolean;
  message: string;
  data: PaginatedResponse<Report>;
}

export class ReportsService {
  static async getLatestReports(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Report>> {
    try {
      const { data } = await axiosInstance.get<LatestReportsResponse>('/officer/latest-report', {
        params: {
          page,
          limit: perPage,
        },
      });
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch latest reports');
      }
      return data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access');
        }
        if (error.response?.status === 404) {
          throw new Error('Latest reports endpoint not found');
        }
      }
      throw new Error('Terjadi kesalahan saat mengambil data laporan terbaru');
    }
  }
} 