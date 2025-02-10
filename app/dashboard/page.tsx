"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { Button } from "@/components/ui/button"
import { PlusCircle, Mail, MessageSquare } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            New Email Campaign
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            New SMS Campaign
          </Button>
        </div>
      </div>
      
      <DashboardStats />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Campaign performance across all channels
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>
              Your latest campaign activities
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