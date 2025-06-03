"use client";

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { AuthService } from "@/app/services/auth"
import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { NotificationsService, Notification } from "@/app/services/notifications"
import { differenceInHours } from "date-fns"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof AuthService.getUser> | 'loading'>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [notifCount, setNotifCount] = useState<number>(0);
  const [notifLoading, setNotifLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoadingAuth(true);
      try {
        const currentUser = AuthService.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error getting user from AuthService:", error);
        setUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoadingAuth && user === null) {
      console.log("Redirecting to login: Auth loading complete and user is null");
      router.push('/login');
    }
  }, [isLoadingAuth, user, router]);

  useEffect(() => {
    const fetchNotif = async () => {
      setNotifLoading(true);
      try {
        const notifs = await NotificationsService.getNotifications();
        const count = notifs.filter(n => n.status === 'unread' && differenceInHours(new Date(), new Date(n.created_at)) < 1).length;
        setNotifCount(count);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifCount(0);
      } finally {
        setNotifLoading(false);
      }
    };

    if (user && user !== 'loading') {
      fetchNotif();
    } else {
      setNotifCount(0);
      setNotifLoading(false);
    }
  }, [user]);

  if (isLoadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading authentication...</div>
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  console.log(user)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold">Tangkapin Dashboard</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" asChild className="relative">
                <a href="/notifications" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifLoading ? (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white bg-red-500" />
                    </span>
                  ) : notifCount > 0 ? (
                    <Badge className="absolute top-0 right-0 min-w-[1.25rem] h-5 px-1 py-0 text-xs flex items-center justify-center rounded-full bg-red-500 text-white ring-2 ring-background shadow">{notifCount}</Badge>
                  ) : null}
                </a>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user && user !== 'loading' ? (
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Loading user...</div>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await AuthService.logout();
                      router.push('/login');
                    }}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
} 