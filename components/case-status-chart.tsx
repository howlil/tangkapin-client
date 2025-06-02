"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { DashboardService, CaseStatusResponse } from "@/app/services/dashboard"
import { useToast } from "@/components/ui/use-toast"

const statusColors = {
  new: "bg-blue-500",
  assigned: "bg-yellow-500",
  in_progress: "bg-orange-500",
  verified: "bg-purple-500",
  completed: "bg-green-500",
}

const statusLabels = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In Progress",
  verified: "Verified",
  completed: "Completed",
}

export function CaseStatusChart() {
  const [data, setData] = useState<CaseStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await DashboardService.getCaseStatus()
        setData(response)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load case status",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-muted-foreground">No data available</div>
      </div>
    )
  }

  const totalCases = data.total_case
  const resolutionRate = data.resolution_rate

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Total Cases</div>
          <div className="mt-1 text-2xl font-bold">{totalCases}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Resolution Rate</div>
          <div className="mt-1 text-2xl font-bold">{resolutionRate}%</div>
        </Card>
      </div>

      <div className="space-y-2">
        {Object.entries(data.case_status).map(([status, count]) => (
          <div key={status} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{statusLabels[status as keyof typeof statusLabels]}</span>
              <span className="text-muted-foreground">{count} cases</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${statusColors[status as keyof typeof statusColors]}`}
                style={{ width: `${(count / totalCases) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
