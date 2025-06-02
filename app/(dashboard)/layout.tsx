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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<ReturnType<typeof AuthService.getUser>>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = AuthService.getUser()
        if (!currentUser) {
          redirect('/login')
        }
        setUser(currentUser)
      } catch (error) {
        redirect('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

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
                  <Badge className="absolute top-0 right-0 min-w-[1.25rem] h-5 px-1 py-0 text-xs flex items-center justify-center rounded-full bg-red-500 text-white ring-2 ring-background shadow">3</Badge>
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
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/profile">Profile</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await AuthService.logout()
                      redirect('/login')
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