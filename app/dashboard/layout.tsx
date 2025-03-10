"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionCookie, clearSessionCookie } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [session, setSession] = useState(getSessionCookie())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check session on mount
    const currentSession = getSessionCookie()
    setSession(currentSession)
    
    if (!currentSession) {
      router.push('/auth/login')
    } else {
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      clearSessionCookie()
      router.push('/auth/login')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Paigham</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Sidebar */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="h-full py-6 pl-8 pr-6 lg:py-8">
            <nav className="flex flex-col space-y-2">
              <Button variant="ghost" className="justify-start" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <a href="/dashboard/messages">Messages</a>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <a href="/dashboard/settings">Settings</a>
              </Button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex w-full flex-col overflow-hidden py-6">
          {children}
        </main>
      </div>
    </div>
  )
} 