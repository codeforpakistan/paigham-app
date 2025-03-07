"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CreditCard, 
  Mail, 
  MessageSquare, 
  Users,
  BarChart,
  AlertCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, getUserProfile } from "@/lib/auth"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function DashboardStats() {
  const router = useRouter()
  const [stats, setStats] = useState({
    credits: 0,
    emailsSent: 0,
    smsSent: 0,
    contacts: 0,
    loading: true,
    error: false
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        const profile = await getUserProfile(user.id)
        if (!profile) {
          throw new Error("Could not load user profile")
        }

        const companyId = profile.company_id

        // Get company credits
        const { data: company } = await supabase
          .from('companies')
          .select('credits_balance')
          .eq('id', companyId)
          .single()

        // Get email campaign stats
        const { data: emailCampaigns } = await supabase
          .from('campaigns')
          .select('recipient_count')
          .eq('company_id', companyId)
          .eq('type', 'email')
          .eq('status', 'sent')

        // Get SMS campaign stats
        const { data: smsCampaigns } = await supabase
          .from('campaigns')
          .select('recipient_count')
          .eq('company_id', companyId)
          .eq('type', 'sms')
          .eq('status', 'sent')

        // Get contact count
        const { count: contactCount } = await supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)

        // Calculate total emails and SMS sent
        const totalEmailsSent = emailCampaigns?.reduce((sum, campaign) => sum + (campaign.recipient_count || 0), 0) || 0
        const totalSmsSent = smsCampaigns?.reduce((sum, campaign) => sum + (campaign.recipient_count || 0), 0) || 0

        setStats({
          credits: company?.credits_balance || 0,
          emailsSent: totalEmailsSent,
          smsSent: totalSmsSent,
          contacts: contactCount || 0,
          loading: false,
          error: false
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        setStats(prev => ({ ...prev, loading: false, error: true }))
      }
    }

    fetchStats()
  }, [router])

  if (stats.loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 rounded-full bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Loading data...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (stats.error) {
    return (
      <Card className="border-destructive">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <CardTitle className="text-sm font-medium">Error Loading Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There was an error loading your dashboard statistics. Please try refreshing the page.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credits Balance</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.credits}</div>
          <div className="mt-2">
            <Progress value={stats.credits > 100 ? 100 : stats.credits} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.credits < 10 ? (
              <span className="text-destructive">Low balance! Consider purchasing more credits.</span>
            ) : (
              "Available for sending emails and SMS"
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.emailsSent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.emailsSent > 0 
              ? `${(stats.emailsSent / (stats.emailsSent + stats.smsSent) * 100).toFixed(1)}% of total messages`
              : "No emails sent yet"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.smsSent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.smsSent > 0 
              ? `${(stats.smsSent / (stats.emailsSent + stats.smsSent) * 100).toFixed(1)}% of total messages`
              : "No SMS sent yet"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.contacts.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.contacts > 0 
              ? `Potential reach: ${stats.contacts} contacts`
              : "No contacts added yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 