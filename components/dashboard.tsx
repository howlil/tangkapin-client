"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  Users,
  Bell,
  Activity,
  Shield,
  Search,
  Filter,
  MoreVertical,
  RefreshCw
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
import { Input } from "@/components/ui/input"

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
        title: "New Incident Alert",
        description: `${data.incidentType} reported at ${data.location}`,
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
      const timeout = setTimeout(() => setIncidentDialog(null), 8000)
      return () => clearTimeout(timeout)
    }
  }, [incidentDialog])

  const getStatTrend = (value: number, isPositive: boolean = true) => {
    return isPositive ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      default: return 'bg-blue-500 text-white'
    }
  }

  return (
    <>
      {/* Incident Alert Dialog */}
      <Dialog open={!!incidentDialog} onOpenChange={open => !open && setIncidentDialog(null)}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Emergency Alert
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-2">
                {incidentDialog?.evidenceUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={incidentDialog.evidenceUrl}
                      alt="Incident Evidence"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{incidentDialog?.incidentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Location:</span>
                    <span>{incidentDialog?.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Priority:</span>
                    <Badge className={`${getPriorityColor(incidentDialog?.priority || '')} capitalize`}>
                      {incidentDialog?.priority}
                    </Badge>
                  </div>
                  {incidentDialog?.timestamp && (
                    <div className="flex justify-between">
                      <span className="font-medium">Time:</span>
                      <span className="text-sm">
                        {new Date(incidentDialog.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" variant="outline" onClick={() => setIncidentDialog(null)}>
              Dismiss
            </Button>
            <Button className="flex-1">
              Assign Officer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="min-h-screen bg-gray-50">
     
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Reports</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {isLoading ? "..." : stats?.total_report || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Total reports today</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {getStatTrend(12)}
                  <span className="text-sm text-green-600 ml-1">12% from yesterday</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Officers</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {isLoading ? "..." : stats?.active_police || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Currently on duty</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600 ml-1">All operational</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Resolved Cases</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {isLoading ? "..." : stats?.resolve_Case || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {getStatTrend(8)}
                  <span className="text-sm text-green-600 ml-1">8% increase</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {isLoading ? "..." : `${stats?.response_time || 0}m`}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Average response</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 ml-1">2min faster</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 p-1 mb-8 inline-flex">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "overview" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "reports" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("reports")}
            >
              Crime Reports
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "officers" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("officers")}
            >
              Officers
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Section */}
              <Card className="lg:col-span-2 border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Live Incident Map</CardTitle>
                    <CardDescription>Real-time crime locations and officer positions</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Live
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <OfficerMap />
                </CardContent>
              </Card>

              {/* Recent Alerts */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
                  <CardDescription>Latest incident notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentAlerts />
                </CardContent>
              </Card>

              {/* Case Status Chart */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Case Status</CardTitle>
                  <CardDescription>Current case distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <CaseStatusChart />
                </CardContent>
              </Card>

              {/* Latest Reports */}
              <Card className="lg:col-span-2 border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Latest Reports</CardTitle>
                    <CardDescription>Recently submitted crime reports</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <ReportTable limit={5} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "reports" && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Crime Report Management</CardTitle>
                  <CardDescription>Monitor and manage all crime reports</CardDescription>
                </div>
                
              </CardHeader>
              <CardContent>
                <ReportTable />
              </CardContent>
            </Card>
          )}

          {activeTab === "officers" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Officer Map */}
              <Card className="lg:col-span-2 border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Officer Deployment</CardTitle>
                    <CardDescription>Current officer locations and assignments</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Tracking
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <OfficerMap showControls={true} />
                </CardContent>
              </Card>

              {/* Available Officers */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Available Officers</CardTitle>
                  <CardDescription>Officers ready for assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOfficers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">Loading officers...</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableOfficers.map((officer) => (
                        <div key={officer.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <Avatar className="w-10 h-10">
                            <AvatarImage alt="Officer" />
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                              {officer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{officer.name}</p>
                            <p className="text-xs text-gray-600">{officer.phone}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={officer.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}
                            >
                              {officer.status}
                            </Badge>
                            <Button size="sm" variant="outline">
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
      </div>
    </>
  )
}