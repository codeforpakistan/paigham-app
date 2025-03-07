"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  LayoutDashboard, 
  Mail, 
  MessageSquare, 
  Settings, 
  User,
  LogOut,
  Bell,
  Plus,
  ChevronDown
} from "lucide-react"
import { signOut } from "@/lib/auth"

export function Navbar() {
  const pathname = usePathname()
  
  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/login"
  }
  
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard" className="font-bold text-xl mr-6">
          Paigham
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link 
            href="/dashboard" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/dashboard" 
                ? "text-primary" 
                : "text-muted-foreground"
            }`}
          >
            <div className="flex items-center">
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Dashboard
            </div>
          </Link>
          <Link 
            href="/email/new" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/email/new" 
                ? "text-primary" 
                : "text-muted-foreground"
            }`}
          >
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              Email
            </div>
          </Link>
          <Link 
            href="/sms/new" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/sms/new" 
                ? "text-primary" 
                : "text-muted-foreground"
            }`}
          >
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              SMS
            </div>
          </Link>
          <Link 
            href="/settings" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/settings" 
                ? "text-primary" 
                : "text-muted-foreground"
            }`}
          >
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </div>
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Campaign
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/email/new" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>New Email Campaign</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/sms/new" className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>New SMS Campaign</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="@user" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 