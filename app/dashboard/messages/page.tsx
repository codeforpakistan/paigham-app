"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContactLists } from "@/components/messages/contact-lists"
import { Campaigns } from "@/components/messages/campaigns"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Loader2 } from "lucide-react"

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("contact-lists")
  const [isUploading, setIsUploading] = useState(false)
  const [showNewCampaign, setShowNewCampaign] = useState(false)

  const handleUploadClick = () => {
    const input = document.getElementById('csv-upload') as HTMLInputElement
    if (input) {
      input.click()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground">
            Manage your contact lists and send messages
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "contact-lists" ? (
            <Button onClick={handleUploadClick} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => setShowNewCampaign(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="contact-lists" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contact-lists">Contact Lists</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>
        <TabsContent value="contact-lists" className="space-y-4">
          <ContactLists onUploadStateChange={setIsUploading} />
        </TabsContent>
        <TabsContent value="campaigns" className="space-y-4">
          <Campaigns showNewCampaign={showNewCampaign} onClose={() => setShowNewCampaign(false)} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 