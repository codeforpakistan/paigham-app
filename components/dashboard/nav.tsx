"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  MessageSquarePlus,
  Users,
  CreditCard,
  Settings,
} from "lucide-react"

const links = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "New Campaign",
    href: "/dashboard/campaigns/new",
    icon: MessageSquarePlus,
  },
  {
    title: "Contacts",
    href: "/dashboard/contacts",
    icon: Users,
  },
  {
    title: "Credits",
    href: "/dashboard/credits",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {links.map((link) => {
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
          >
            <Button
              variant={pathname === link.href ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <Icon className="h-4 w-4" />
              {link.title}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
} 