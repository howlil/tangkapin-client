"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  Users,
  Bell,
} from "lucide-react"
import { ReportTable } from "@/components/report-table"
import { OfficerMap } from "@/components/officer-map"
import { CaseStatusChart } from "@/components/case-status-chart"
import { RecentAlerts } from "@/components/recent-alerts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardService, DashboardStats } from "@/app/services/dashboard"
import { useToast } from "@/components/ui/use-toast"
import { OfficersService, PoliceOfficer } from "@/app/services/officers"
import pusher from "@/lib/pusher-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availableOfficers, setAvailableOfficers] = useState<PoliceOfficer[]>([])
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(true)
  const { toast } = useToast()
  const [incidentDialog, setIncidentDialog] = useState<null | {
    incidentType: string;
    location: string;
    priority: string;
    evidenceUrl?: string;
    timestamp?: string;
  }>(null)

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
      } finally {
        setIsLoading(false)
      }
    }

    const fetchAvailableOfficers = async () => {
      setIsLoadingOfficers(true)
      try {
        const data = await OfficersService.getAvailableOfficers()
        setAvailableOfficers(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load available officers",
        })
      } finally {
        setIsLoadingOfficers(false)
      }
    }

    const channel = pusher.subscribe('officers-dashboard')
    const handler = (data: { reportId: string; incidentType: string; location: string; status: string; evidenceUrl?: string; timestamp?: string; priority: string }) => {
      setIncidentDialog({
        incidentType: data.incidentType,
        location: data.location,
        priority: data.priority,
        evidenceUrl: data.evidenceUrl,
        timestamp: data.timestamp,
      })
      toast({
        title: "Incident Update",
        description: `New ${data.incidentType} incident at ${data.location} (Priority: ${data.priority})`,
        variant: data.priority === 'critical' ? "destructive" : "default",
      })
    }
    channel.bind('incident-update', handler)

    fetchStats()
    fetchAvailableOfficers()

    return () => {
      channel.unbind('incident-update', handler)
      pusher.unsubscribe('officers-dashboard')
    }
  }, [toast])

  useEffect(() => {
    if (incidentDialog) {
      const timeout = setTimeout(() => setIncidentDialog(null), 5000)
      return () => clearTimeout(timeout)
    }
  }, [incidentDialog])

  return (
    <>
      <Dialog open={!!incidentDialog} onOpenChange={open => !open && setIncidentDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-red-600">New Incident Alert</DialogTitle>
            <DialogDescription className="flex flex-col items-center gap-3 mt-2">
              {incidentDialog && (
                <>
                  {incidentDialog.evidenceUrl && (
                    <a href={incidentDialog.evidenceUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                      <img
                        src={incidentDialog.evidenceUrl}
                        alt="Incident Evidence"
                        className="mx-auto mb-2 max-h-56 rounded-lg border shadow object-contain bg-muted w-full"
                      />
                    </a>
                  )}
                  <div className="w-full text-center">
                    <div className="mt-1 text-base font-semibold">Type: <span className="capitalize">{incidentDialog.incidentType}</span></div>
                    <div className="mt-1 text-base">Location: <span className="font-medium">{incidentDialog.location}</span></div>
                    <div className="mt-1 text-base">Priority: <span className={incidentDialog.priority === 'critical' ? 'text-red-600 font-bold' : 'text-yellow-600 font-bold'}>{incidentDialog.priority}</span></div>
                    {incidentDialog.timestamp && (
                      <div className="mt-1 text-base">Time: <span className="font-mono">{new Date(incidentDialog.timestamp).toLocaleString()}</span></div>
                    )}
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button variant="outline" className="w-full mt-4">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      <div className="p-6 bg-muted/40">
        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card">
              <div className="stat-card-icon">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="stat-card-label">New Reports</div>
              <div className="stat-card-value">
                {isLoading ? "..." : stats?.total_report || 0}
              </div>
              <div className="stat-card-meta">
                <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                <span>Total reports</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">
                <Users className="h-5 w-5" />
              </div>
              <div className="stat-card-label">Active Officers</div>
              <div className="stat-card-value">
                {isLoading ? "..." : stats?.active_police || 0}
              </div>
              <div className="stat-card-meta">
                <span>Currently on field duty</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="stat-card-label">Resolved Cases</div>
              <div className="stat-card-value">
                {isLoading ? "..." : stats?.resolve_Case || 0}
              </div>
              <div className="stat-card-meta">
                <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                <span>Total resolved cases</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">
                <Clock className="h-5 w-5" />
              </div>
              <div className="stat-card-label">Response Time</div>
              <div className="stat-card-value">
                {isLoading ? "..." : `${stats?.response_time || 0} min`}
              </div>
              <div className="stat-card-meta">
                <ArrowDown className="mr-1 h-3 w-3 text-green-500" />
                <span>Average response time</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex space-x-1 rounded-full bg-muted p-1">
            <button
              className={`tab-button ${activeTab === "overview" ? "tab-button-active" : ""} px-6 py-2 rounded-full font-semibold transition-colors`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === "reports" ? "tab-button-active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              Crime Reports
            </button>
            <button
              className={`tab-button ${activeTab === "officers" ? "tab-button-active" : ""}`}
              onClick={() => setActiveTab("officers")}
            >
              Officer Assignment
            </button>
          
          </div>

          {/* Tab content */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="dashboard-card col-span-1 lg:col-span-2 shadow-md">
                  <CardHeader className="dashboard-card-header px-6 py-4">
                    <div>
                      <CardTitle>Current Incident Map</CardTitle>
                      <CardDescription>Crime locations and active officers</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Live
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <OfficerMap />
                  </CardContent>
                </Card>
                <Card className="dashboard-card shadow-md">
                  <CardHeader className="dashboard-card-header px-6 py-4">
                    <div>
                      <CardTitle>Recent Alerts</CardTitle>
                      <CardDescription>Important warnings and notifications</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      4 New
                    </Badge>
                  </CardHeader>
                  <CardContent className="dashboard-card-content px-6 pb-6">
                    <RecentAlerts />
                  </CardContent>
                </Card>
                <Card className="dashboard-card">
                  <CardHeader className="dashboard-card-header">
                    <div>
                      <CardTitle>Case Status</CardTitle>
                      <CardDescription>Distribution of case handling status</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="dashboard-card-content">
                    <CaseStatusChart />
                  </CardContent>
                </Card>
                <Card className="dashboard-card col-span-1 lg:col-span-2 shadow-md">
                  <CardHeader className="dashboard-card-header px-6 py-4">
                    <div>
                      <CardTitle>Latest Reports</CardTitle>
                      <CardDescription>Recently submitted crime reports</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <FileText className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent className="dashboard-card-content">
                    <ReportTable limit={5} />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "reports" && (
              <Card className="dashboard-card shadow-md">
                <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
                  <div>
                    <CardTitle>Crime Report Management</CardTitle>
                    <CardDescription>Manage all incoming crime reports</CardDescription>
                  </div>
                 
                </CardHeader>
                <CardContent>
                  <ReportTable />
                </CardContent>
              </Card>
            )}

            {activeTab === "officers" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="dashboard-card col-span-1 lg:col-span-2 shadow-md">
                  <CardHeader className="dashboard-card-header px-6 py-4">
                    <div>
                      <CardTitle>Officer Assignment Map</CardTitle>
                      <CardDescription>Location and status of field officers</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Live
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <OfficerMap showControls={true} />
                  </CardContent>
                </Card>
                <Card className="dashboard-card shadow-md">
                  <CardHeader className="dashboard-card-header px-6 py-4">
                    <div>
                      <CardTitle>Available Officers</CardTitle>
                      <CardDescription>Officers ready for assignment</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="dashboard-card-content px-6 pb-6">
                    {isLoadingOfficers ? (
                      <div className="text-center text-muted-foreground">Loading officers...</div>
                    ) : (
                      <div className="space-y-4">
                        {availableOfficers.map((officer) => (
                          <div key={officer.id} className="flex items-center gap-4 rounded-xl border p-4 bg-white shadow-sm hover:bg-muted/60 transition-all min-w-0">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Officer" />
                              <AvatarFallback>{officer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-semibold truncate">{officer.name}</p>
                              <p className="text-xs text-muted-foreground break-all">{officer.phone}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 min-w-[90px]">
                              <Badge variant="outline" className="px-2 py-0.5 w-fit text-xs font-medium">
                                {officer.status}
                              </Badge>
                              <Button size="sm" variant="outline" className="rounded-full w-fit hover:bg-primary/10 transition-colors">
                                Assign
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  )
}
