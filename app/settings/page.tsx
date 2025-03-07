"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailSettings } from "@/components/settings/email-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, MessageSquare, CreditCard, User, Building } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("email")

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <aside className="lg:w-1/5">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure your account and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <nav className="flex flex-col space-y-1">
                <div className="flex flex-col space-y-1">
                  <button
                    className={`flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "email" ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setActiveTab("email")}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email Settings
                  </button>
                  <button
                    className={`flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "sms" ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setActiveTab("sms")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    SMS Settings
                  </button>
                  <button
                    className={`flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "billing" ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setActiveTab("billing")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing & Credits
                  </button>
                  <button
                    className={`flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "profile" ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    User Profile
                  </button>
                  <button
                    className={`flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "company" ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setActiveTab("company")}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Company Details
                  </button>
                </div>
              </nav>
            </CardContent>
          </Card>
        </aside>
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsContent value="email" className="space-y-4">
              <EmailSettings />
            </TabsContent>
            <TabsContent value="sms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SMS Settings</CardTitle>
                  <CardDescription>Configure your SMS provider integration</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    SMS integration is coming soon. Stay tuned for updates!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Credits</CardTitle>
                  <CardDescription>Manage your subscription and credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Billing settings will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Profile settings will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                  <CardDescription>Update your company information</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Company settings will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 