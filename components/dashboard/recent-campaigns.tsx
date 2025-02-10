"use client"

import { Avatar } from "@/components/ui/avatar"
import { Mail, MessageSquare, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type CampaignStats = {
  sent?: number
  opened?: number
  clicked?: number
  delivered?: number
  responded?: number
  recipients?: number
}

type Campaign = {
  id: number
  name: string
  type: "email" | "sms"
  status: "Sent" | "Sending" | "Draft"
  date: string
  stats: CampaignStats
}

const campaigns: Campaign[] = [
  {
    id: 1,
    name: "Summer Sale Newsletter",
    type: "email",
    status: "Sent",
    date: "2024-03-15",
    stats: {
      sent: 12500,
      opened: 7800,
      clicked: 2300,
    },
  },
  {
    id: 2,
    name: "Flash Deal Alert",
    type: "sms",
    status: "Sending",
    date: "2024-03-14",
    stats: {
      sent: 5000,
      delivered: 4950,
      responded: 750,
    },
  },
  {
    id: 3,
    name: "Product Launch",
    type: "email",
    status: "Draft",
    date: "2024-03-14",
    stats: {
      recipients: 20000,
    },
  },
]

export function RecentCampaigns() {
  return (
    <div className="space-y-8">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            {campaign.type === "email" ? (
              <Mail className="h-4 w-4" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{campaign.name}</p>
            <p className="text-sm text-muted-foreground">
              {campaign.status} • {campaign.date}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {campaign.status === "Sent" && campaign.stats.opened && campaign.stats.sent ? (
              <span className="text-green-500">
                {((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1)}% opened
              </span>
            ) : campaign.status === "Sending" ? (
              <span className="text-blue-500">In Progress</span>
            ) : (
              <span className="text-muted-foreground">Draft</span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 ml-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
} 