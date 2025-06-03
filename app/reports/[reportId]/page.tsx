"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ReportsService, ReportDetail } from "@/app/services/reports"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { 
  Loader2, MapPin, User, Camera, FileText, Clock, AlertCircle, 
  Calendar, Hash, ArrowLeft, Activity, Image, ChevronDown,
  Mail, Phone
} from "lucide-react"

export default function ReportDetailPage() {
  const router = useRouter()
  const { reportId } = useParams<{ reportId: string }>()
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    reporter: true,
    cctv: true,
    evidence: true,
    activity: true
  })

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await ReportsService.getReportDetail(reportId)
        setReport(data)
      } catch (err: any) {
        setError(err.message || "Failed to load report detail")
      } finally {
        setIsLoading(false)
      }
    }
    if (reportId) fetchDetail()
  }, [reportId])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-center">Loading report...</p>
        </div>
      </div>
    )
  }
  
  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load report</h3>
          <p className="text-gray-600 mb-6">{error || "Report not found"}</p>
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.push('/dashboard')} 
                variant="ghost" 
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Report Details</h1>
            </div>
            <Badge className={`px-3 py-1 text-sm font-medium border ${getStatusColor(report.status)}`}>
              {report.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {report.incident_type}
                  </Badge>
                  <span className="text-sm text-gray-500">#{report.id}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h2>
                <p className="text-gray-700 leading-relaxed">{report.description}</p>
              </div>
              {report.report_image && (
                <div className="ml-6 flex-shrink-0">
                  <img 
                    src={report.report_image} 
                    alt="Report" 
                    className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                  />
                </div>
              )}
            </div>
            
            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{report.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: id })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Camera className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Source: {report.source}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reporter Information */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('reporter')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Reporter Information</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.reporter ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
              {expandedSections.reporter && (
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{report.owner.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{report.owner.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{report.owner.phone}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{report.owner.address}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* CCTV Information */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('cctv')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-4 h-4 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">CCTV Information</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.cctv ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
              {expandedSections.cctv && (
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{report.cctv.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{report.cctv.location}</p>
                      <p className="text-gray-700 mt-2">{report.cctv.description}</p>
                    </div>
                    <Badge variant={report.cctv.status === 'active' ? 'default' : 'secondary'} className="ml-4">
                      {report.cctv.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Type: {report.cctv.camera_type}</span>
                    {report.cctv.stream_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={report.cctv.stream_url} target="_blank" rel="noopener noreferrer">
                          View Stream
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Evidence Files */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('evidence')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Image className="w-4 h-4 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">Evidence Files ({report.evidences.length})</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.evidence ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
              {expandedSections.evidence && (
                <CardContent>
                  {report.evidences.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">No evidence files</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {report.evidences.map(evidence => (
                        <a
                          key={evidence.id}
                          href={evidence.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <img
                            src={evidence.file_url}
                            alt={evidence.type}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <p className="text-white text-xs font-medium">{evidence.type}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm border-gray-200 sticky top-8">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('activity')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg">Activity</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.activity ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
              {expandedSections.activity && (
                <CardContent>
                  {report.activity_logs.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">No activity logs</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {report.activity_logs.map((log, index) => (
                        <div key={log.id} className="relative">
                          {index !== report.activity_logs.length - 1 && (
                            <div className="absolute left-2 top-6 bottom-0 w-px bg-gray-200" />
                          )}
                          <div className="flex items-start space-x-3">
                            <div className="w-4 h-4 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{log.action}</p>
                              <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: id })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}