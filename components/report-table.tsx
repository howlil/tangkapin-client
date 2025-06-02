"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ReportsService, Report, PaginatedResponse } from "@/app/services/reports"
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

const statusColors = {
  new: "bg-blue-500",
  assigned: "bg-yellow-500",
  in_progress: "bg-orange-500",
  verified: "bg-purple-500",
  completed: "bg-green-500",
  rejected: "bg-red-500",
}

const statusLabels = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In Progress",
  verified: "Verified",
  completed: "Completed",
  rejected: "Rejected",
}

interface ReportTableProps {
  limit?: number;
  onPageChange?: (page: number) => void;
  currentPage?: number;
}

export function ReportTable({ limit, onPageChange, currentPage = 1 }: ReportTableProps) {
  const [data, setData] = useState<PaginatedResponse<Report> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        const response = await ReportsService.getLatestReports(currentPage, limit || 10)
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
  }, [currentPage, limit, toast])

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="text-muted-foreground">No reports available</div>
      </div>
    )
  }

  // Always use parent's currentPage and onPageChange for pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > data.pagination.total_pages) return
    if (onPageChange) {
      onPageChange(page)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Incident Type</TableHead>
              <TableHead>CCTV</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.title}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${statusColors[report.status as keyof typeof statusColors]} text-white`}
                  >
                    {statusLabels[report.status as keyof typeof statusLabels]}
                  </Badge>
                </TableCell>
                <TableCell>{report.location}</TableCell>
                <TableCell className="capitalize">{report.incident_type}</TableCell>
                <TableCell>{report.cctv_name || '-'}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(report.created_at), {
                    addSuffix: true,
                    locale: id,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/reports/${report.id}`)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!limit && data.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} results
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange((currentPage || 1) - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: data.pagination.total_pages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange((currentPage || 1) + 1)}
                  className={currentPage === data.pagination.total_pages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
