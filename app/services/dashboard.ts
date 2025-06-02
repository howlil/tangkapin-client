import axiosInstance from '@/app/lib/axios';
import { AxiosError } from 'axios';

export interface DashboardStats {
  response_time: number;
  resolve_Case: number;
  total_report: number;
  active_police: number;
}

export interface CaseStatus {
  new: number;
  assigned: number;
  in_progress: number;
  verified: number;
  completed: number;
}

export interface CaseStatusResponse {
  total_case: number;
  resolution_rate: number;
  case_status: CaseStatus;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}

export interface CaseStatusApiResponse {
  success: boolean;
  message: string;
  data: CaseStatusResponse;
}

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    try {
      const { data } = await axiosInstance.get<DashboardResponse>('/officer/count');
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch dashboard stats');
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
          throw new Error('Dashboard stats endpoint not found');
        }
      }
      throw new Error('Terjadi kesalahan saat mengambil data dashboard');
    }
  }

  static async getCaseStatus(): Promise<CaseStatusResponse> {
    try {
      const { data } = await axiosInstance.get<CaseStatusApiResponse>('/officer/case-status');
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch case status');
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
          throw new Error('Case status endpoint not found');
        }
      }
      throw new Error('Terjadi kesalahan saat mengambil data status kasus');
    }
  }
} 