"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportTable } from "@/components/report-table"
import { CaseStatusChart } from "@/components/case-status-chart"
import { RecentAlerts } from "@/components/recent-alerts"
import { OfficerMap } from "@/components/officer-map"
import { DashboardService } from "@/app/services/dashboard"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState({
    response_time: 0,
    resolve_Case: 0,
    total_report: 0,
    active_police: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await DashboardService.getStats()
        setStats(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load dashboard stats",
        })
      }
    }

    fetchStats()
  }, [toast])

  const handleViewAll = () => {
    setActiveTab("reports")
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Crime Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.response_time} minutes</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolve_Case}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_report}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Police</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_police}</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportTable limit={5} />
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={handleViewAll}>
                    View All
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Case Status</CardTitle>
              </CardHeader>
              <CardContent>
                <CaseStatusChart />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentAlerts />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Officer Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <OfficerMap />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crime Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTable onPageChange={handlePageChange} currentPage={currentPage} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 