import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <div className="hidden md:block w-64 border-r bg-background">
          <Sidebar />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
} 