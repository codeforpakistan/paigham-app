import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45,231</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-green-500 flex items-center">
              <ArrowUpRight className="h-4 w-4" />
              +20.1%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12,234</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-green-500 flex items-center">
              <ArrowUpRight className="h-4 w-4" />
              +12.4%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SMS Delivered</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24,553</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-red-500 flex items-center">
              <ArrowDownRight className="h-4 w-4" />
              -2.5%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">32.5%</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-green-500 flex items-center">
              <ArrowUpRight className="h-4 w-4" />
              +4.1%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 