"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, CheckCircle, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { OfficersService, RecentAlert } from "@/app/services/officers"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

export function RecentAlerts() {
  const [alerts, setAlerts] = useState<RecentAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true)
      try {
        const data = await OfficersService.getRecentAlerts()
        setAlerts(data.alerts)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load recent alerts",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchAlerts()
  }, [toast])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "incident":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "notification":
        return <Clock className="h-5 w-5 text-[#E3F553]" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getAlertBadge = (priority_label: string) => {
    switch (priority_label) {
      case "Emergency":
        return (
          <Badge variant="destructive" className="px-2 py-0.5 text-xs">
            Emergency
          </Badge>
        )
      case "Attention":
        return <Badge className="bg-[#E3F553] text-black px-2 py-0.5 text-xs">Attention</Badge>
      default:
        return <Badge className="px-2 py-0.5 text-xs">Notification</Badge>
    }
  }

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading alerts...</div>
  }

  return (
    <div className="space-y-3">
      {alerts.slice(0, 4).map((alert) => (
        <Card key={alert.id} className="overflow-hidden rounded-xl shadow-sm hover:bg-muted/60 transition-all p-4">
          <div className="flex gap-3 min-w-0">
            <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="mb-1 flex items-center justify-between min-w-0">
                <h4 className="text-sm font-semibold truncate">{alert.title}</h4>
                {getAlertBadge(alert.priority_label)}
              </div>
              <p className="text-xs text-muted-foreground truncate">{alert.location} ({alert.location_code})</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{alert.time_ago}</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs hover:bg-primary/10 transition-colors">
                  Details
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
      <Button variant="outline" className="w-full rounded-full text-xs">
        View All Notifications
      </Button>
    </div>
  )
}
