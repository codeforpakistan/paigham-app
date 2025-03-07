import { redirect } from "next/navigation"

export default function DashboardLayoutIndexPage() {
  redirect("/dashboard")
  return null
} 