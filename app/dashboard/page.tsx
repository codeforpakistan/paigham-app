"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, CreditCard, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getSessionCookie } from '@/lib/session'

interface DashboardStats {
  totalContacts: number
  totalCampaigns: number
  creditsBalance: number
  messagesSent: number
}

export default function DashboardPage() {
  const router = useRouter()
  const session = getSessionCookie()
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalCampaigns: 0,
    creditsBalance: 0,
    messagesSent: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!session?.company_id) {
      console.log('No company_id in session, redirecting to login...')
      router.replace('/auth/login')
      return
    }

    try {
      console.log('Fetching stats for company:', session.company_id)
      setIsLoading(true)

      // Fetch all stats in parallel
      const [
        contactsResult,
        campaignsResult,
        companyResult
      ] = await Promise.all([
        // Get total contacts
        supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', session.company_id),

        // Get campaigns with total messages and sent count
        supabase
          .from('campaigns')
          .select('total_messages, sent_messages')
          .eq('company_id', session.company_id),

        // Get company credits balance
        supabase
          .from('companies')
          .select('credits_balance')
          .eq('id', session.company_id)
          .single()
      ])

      // Log results for debugging
      console.log('Stats query results:', {
        contacts: contactsResult,
        campaigns: campaignsResult,
        company: companyResult
      })

      // Handle any errors
      if (contactsResult.error) console.error('Contacts error:', contactsResult.error)
      if (campaignsResult.error) console.error('Campaigns error:', campaignsResult.error)
      if (companyResult.error) console.error('Company error:', companyResult.error)

      // Calculate total messages sent from all campaigns
      const totalMessagesSent = (campaignsResult.data || []).reduce(
        (sum, campaign) => sum + (campaign.sent_messages || 0),
        0
      )

      setStats({
        totalContacts: contactsResult.count || 0,
        totalCampaigns: (campaignsResult.data || []).length,
        creditsBalance: companyResult.data?.credits_balance || 0,
        messagesSent: totalMessagesSent,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session?.company_id, router])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back{session?.user?.email ? `, ${session.user.email}` : ''}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalContacts.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalCampaigns.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.messagesSent.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.creditsBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display.
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button 
                className="w-full rounded-lg border p-3 text-left hover:bg-muted"
                onClick={() => router.push('/dashboard/messages')}
              >
                New Message
              </button>
              <button className="w-full rounded-lg border p-3 text-left hover:bg-muted">
                View Reports
              </button>
              <button className="w-full rounded-lg border p-3 text-left hover:bg-muted">
                Account Settings
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 