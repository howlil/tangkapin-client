import axiosInstance from '@/app/lib/axios';
import { AxiosError } from 'axios';

export interface OfficerLocation {
  latitude: number;
  longitude: number;
}

export interface PoliceOfficer {
  id: string;
  name: string;
  phone: string;
  status: string;
  location: OfficerLocation;
  office_name: string;
}

export interface PoliceListResponse {
  success: boolean;
  message: string;
  data: {
    data: PoliceOfficer[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
}

export interface AvailableOfficersResponse {
  success: boolean;
  message: string;
  data: PoliceOfficer[];
}

export interface IncidentCoordinates {
  latitude: number;
  longitude: number;
}

export interface CrimeLocation {
  id: string;
  title: string;
  location: string;
  incident_type: string;
  status: string;
  coordinates: IncidentCoordinates;
  created_at: string;
  source: string;
  cctv_name?: string;
}

export interface IncidentMapSummary {
  total_incidents: number;
  active_officers: number;
  busy_officers: number;
  incident_types: Record<string, number>;
}

export interface IncidentMapOfficer {
  id: string;
  name: string;
  status: string;
  coordinates: IncidentCoordinates;
  assigned_to: string | null;
  estimated_arrival: string | null;
}

export interface IncidentMapResponse {
  success: boolean;
  message: string;
  data: {
    summary: IncidentMapSummary;
    crime_locations: CrimeLocation[];
    active_officers: IncidentMapOfficer[];
  };
}

export interface RecentAlert {
  id: string;
  type: string;
  title: string;
  priority: string;
  priority_label: string;
  location: string;
  location_code: string;
  time_ago: string;
  status: string;
  incident_type: string;
  source: string;
  created_at: string;
  message?: string;
}

export interface RecentAlertsResponse {
  success: boolean;
  message: string;
  data: {
    alerts: RecentAlert[];
    total_alerts: number;
    critical_count: number;
    high_count: number;
  };
}

export class OfficersService {
  static async getAvailableOfficers(): Promise<PoliceOfficer[]> {
    try {
      const { data } = await axiosInstance.get<AvailableOfficersResponse>('/officer/available');
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch available officers');
      }
      return data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Terjadi kesalahan saat mengambil data petugas tersedia');
    }
  }

  static async getPoliceList(page = 1, limit = 10): Promise<PoliceListResponse['data']> {
    try {
      const { data } = await axiosInstance.get<PoliceListResponse>('/officer/police', {
        params: { page, limit },
      });
      if (!data.success) throw new Error(data.message || 'Failed to fetch police list');
      return data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Terjadi kesalahan saat mengambil data polisi');
    }
  }

  static async getIncidentMap(): Promise<IncidentMapResponse['data']> {
    try {
      const { data } = await axiosInstance.get<IncidentMapResponse>('/officer/incident-map');
      if (!data.success) throw new Error(data.message || 'Failed to fetch incident map');
      return data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Terjadi kesalahan saat mengambil data peta insiden');
    }
  }

  static async getRecentAlerts(): Promise<RecentAlertsResponse['data']> {
    try {
      const { data } = await axiosInstance.get<RecentAlertsResponse>('/officer/recent-alerts');
      if (!data.success) throw new Error(data.message || 'Failed to fetch recent alerts');
      return data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Terjadi kesalahan saat mengambil data peringatan terbaru');
    }
  }
} 