"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useRouter } from "next/navigation"
import { Search, Filter, X, RefreshCw } from "lucide-react"
import axiosInstance from '@/app/lib/axios'
import { AxiosError } from 'axios'

// Enhanced interfaces
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

// Enhanced ReportsService
export class EnhancedReportsService {
  static async getReports(
    page: number = 1, 
    limit: number = 10, 
    status?: string, 
    search?: string
  ): Promise<PaginatedResponse<Report>> {
    try {
      const params: any = { page, limit }
      if (status && status !== 'all') params.status = status
      if (search && search.trim()) params.search = search.trim()

      const { data } = await axiosInstance.get<LatestReportsResponse>('/officer/latest-report', {
        params
      })

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch reports')
      }
      return data.data
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access')
        }
        if (error.response?.status === 404) {
          throw new Error('Reports endpoint not found')
        }
      }
      throw new Error('Failed to load reports')
    }
  }
}

const statusConfig = {
  new: { label: "New", color: "bg-blue-500 hover:bg-blue-600" },
  assigned: { label: "Assigned", color: "bg-yellow-500 hover:bg-yellow-600" },
  in_progress: { label: "In Progress", color: "bg-orange-500 hover:bg-orange-600" },
  verified: { label: "Verified", color: "bg-purple-500 hover:bg-purple-600" },
  completed: { label: "Completed", color: "bg-green-500 hover:bg-green-600" },
  rejected: { label: "Rejected", color: "bg-red-500 hover:bg-red-600" },
  pending: { label: "Pending", color: "bg-gray-500 hover:bg-gray-600" },
  resolved: { label: "Resolved", color: "bg-emerald-500 hover:bg-emerald-600" },
}

const incidentTypeConfig = {
  theft: { label: "Theft", color: "bg-red-100 text-red-800" },
  violence: { label: "Violence", color: "bg-orange-100 text-orange-800" },
  vandalism: { label: "Vandalism", color: "bg-yellow-100 text-yellow-800" },
  suspicious: { label: "Suspicious Activity", color: "bg-purple-100 text-purple-800" },
  accident: { label: "Accident", color: "bg-blue-100 text-blue-800" },
  other: { label: "Other", color: "bg-gray-100 text-gray-800" },
}

interface ReportTableProps {
  limit?: number
  showSearch?: boolean
  showFilter?: boolean
  showPagination?: boolean
}

export function ReportTable({ 
  limit, 
  showSearch = true, 
  showFilter = true, 
  showPagination = true 
}: ReportTableProps) {
  const [data, setData] = useState<PaginatedResponse<Report> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to first page when searching
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        const response = await EnhancedReportsService.getReports(
          currentPage,
          limit || 10,
          statusFilter,
          debouncedSearch
        )
        setData(response)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load reports",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [currentPage, limit, statusFilter, debouncedSearch, toast])

  const handlePageChange = (page: number) => {
    if (!data || page < 1 || page > data.pagination.total_pages) return
    setCurrentPage(page)
  }

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all'

  if (isLoading) {
    return (
      <div className="space-y-4">
        {(showSearch || showFilter) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {showSearch && (
                <div className="relative w-64">
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                  <Input
                    placeholder="Searching..."
                    disabled
                    className="pl-10"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex h-[200px] items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <div className="text-gray-500">Loading reports...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      {(showSearch || showFilter) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {showSearch && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            {showFilter && (
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {data && (
            <div className="text-sm text-gray-600">
              {data.pagination.total} total reports
            </div>
          )}
        </div>
      )}

      {/* Results Info */}
      {hasActiveFilters && data && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          {data.pagination.total === 0 ? (
            <span>No reports found matching your criteria</span>
          ) : (
            <span>
              Found {data.pagination.total} report{data.pagination.total !== 1 ? 's' : ''} 
              {searchQuery.trim() && ` matching "${searchQuery.trim()}"`}
              {statusFilter !== 'all' && ` with status "${statusConfig[statusFilter as keyof typeof statusConfig]?.label}"`}
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Incident Type</TableHead>
              <TableHead className="font-semibold">CCTV</TableHead>
              <TableHead className="font-semibold">Reported</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data || data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="text-gray-500">
                    {hasActiveFilters ? "No reports match your search criteria" : "No reports available"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((report) => (
                <TableRow key={report.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusConfig[report.status as keyof typeof statusConfig]?.color || 'bg-gray-500'} text-white border-none`}
                    >
                      {statusConfig[report.status as keyof typeof statusConfig]?.label || report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{report.location}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={`${incidentTypeConfig[report.incident_type as keyof typeof incidentTypeConfig]?.color || 'bg-gray-100 text-gray-800'} border-none`}
                    >
                      {incidentTypeConfig[report.incident_type as keyof typeof incidentTypeConfig]?.label || report.incident_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{report.cctv_name || '-'}</TableCell>
                  <TableCell className="text-gray-600">
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push(`/reports/${report.id}`)}
                      className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && data && data.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} results
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {/* Show page numbers */}
              {Array.from({ length: Math.min(5, data.pagination.total_pages) }, (_, i) => {
                let pageNumber
                if (data.pagination.total_pages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                } else if (currentPage >= data.pagination.total_pages - 2) {
                  pageNumber = data.pagination.total_pages - 4 + i
                } else {
                  pageNumber = currentPage - 2 + i
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === data.pagination.total_pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}