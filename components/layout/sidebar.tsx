"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Mail, 
  MessageSquare, 
  Settings, 
  Users,
  BarChart,
  FileText,
  ListFilter,
  Tag,
  CreditCard
} from "lucide-react"

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart
  }
]

const campaignItems = [
  {
    title: "Email Campaigns",
    href: "/email/campaigns",
    icon: Mail
  },
  {
    title: "SMS Campaigns",
    href: "/sms/campaigns",
    icon: MessageSquare
  }
]

const templateItems = [
  {
    title: "Email Templates",
    href: "/email/templates",
    icon: FileText
  },
  {
    title: "SMS Templates",
    href: "/sms/templates",
    icon: FileText
  }
]

const contactItems = [
  {
    title: "All Contacts",
    href: "/contacts",
    icon: Users
  },
  {
    title: "Lists",
    href: "/contacts/lists",
    icon: ListFilter
  },
  {
    title: "Tags",
    href: "/contacts/tags",
    icon: Tag
  }
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <div className="pb-12 h-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-tight uppercase">
            Main
          </h2>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-tight uppercase">
            Campaigns
          </h2>
          <div className="space-y-1">
            {campaignItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-tight uppercase">
            Templates
          </h2>
          <div className="space-y-1">
            {templateItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-tight uppercase">
            Contacts
          </h2>
          <div className="space-y-1">
            {contactItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-tight uppercase">
            Account
          </h2>
          <div className="space-y-1">
            <Link href="/settings">
              <Button
                variant={pathname === "/settings" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Link href="/billing">
              <Button
                variant={pathname === "/billing" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Billing & Credits
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 