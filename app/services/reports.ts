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

export interface ReportOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface ReportCCTV {
  id: string;
  name: string;
  location: string;
  description: string;
  camera_type: string;
  status: string;
  stream_url: string;
}

export interface ReportEvidence {
  id: string;
  file_url: string;
  type: string;
  created_at: string;
}

export interface ReportActivityLog {
  id: string;
  action: string;
  description: string;
  actor: string | null;
  created_at: string;
}

export interface ReportMetadata {
  unread_notifications: number;
  has_evidence: boolean;
  response_time: string | null;
  resolution_time: string | null;
}

export interface ReportDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  location: string;
  incident_type: string;
  report_image: string;
  is_assigned: boolean | null;
  created_at: string;
  updated_at: string | null;
  source: string;
  owner: ReportOwner;
  cctv: ReportCCTV;
  evidences: ReportEvidence[];
  assignment: any;
  activity_logs: ReportActivityLog[];
  metadata: ReportMetadata;
}

export interface ReportDetailResponse {
  success: boolean;
  message: string;
  data: ReportDetail;
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

  static async getReportDetail(reportId: string): Promise<ReportDetail> {
    try {
      const { data } = await axiosInstance.get<ReportDetailResponse>(`/officer/report/${reportId}`)
      if (!data.success) throw new Error(data.message || 'Failed to fetch report detail')
      return data.data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Terjadi kesalahan saat mengambil detail laporan')
    }
  }
} 