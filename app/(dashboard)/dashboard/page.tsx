"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { Button } from "@/components/ui/button"
import { PlusCircle, CreditCard } from "lucide-react"
import { useEffect, useState } from "react"
import { getCurrentUser, getUserProfile } from "@/lib/auth"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const profile = await getUserProfile(user.id)
        if (profile) {
          setCredits(profile.companies?.credits_balance || 0)
          setUserName(profile.first_name || "")
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Credits: {credits}
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Credits
          </Button>
        </div>
      </div>
      <DashboardStats />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>
              You sent 10 campaigns this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentCampaigns />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 