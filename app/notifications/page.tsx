"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NotificationsService, Notification } from "@/app/services/notifications"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { Bell, MapPin, Clock } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await NotificationsService.getNotifications()
        setNotifications(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load notifications",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">No notifications available</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">View and manage your notifications</p>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`${notification.status === 'unread' ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{notification.title}</CardTitle>
                  <CardDescription className="mt-1">{notification.message}</CardDescription>
                </div>
                {notification.status === 'unread' && (
                  <Badge variant="default" className="ml-2">
                    New
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{notification.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Bell className="h-4 w-4" />
                  <span className="capitalize">{notification.type}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 