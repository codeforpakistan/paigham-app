"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComposeEmail } from "@/components/email/compose-email"
import { UploadContacts } from "@/components/sms/upload-contacts" // We can reuse this
import { MapFields } from "@/components/sms/map-fields" // We can reuse this
import { EmailPreview } from "@/components/email/email-preview"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

type Step = "compose" | "upload" | "map" | "preview"

export default function NewEmailCampaign() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("compose")
  const [campaignData, setCampaignData] = useState({
    subject: "",
    content: "",
    variables: [] as string[],
    contacts: [] as any[],
    mappings: {} as Record<string, string>,
  })

  const steps: { [key in Step]: string } = {
    compose: "Compose Email",
    upload: "Upload Contacts",
    map: "Map Fields",
    preview: "Preview & Send",
  }

  const handleNext = () => {
    const stepOrder: Step[] = ["compose", "upload", "map", "preview"]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handleCampaignSent = () => {
    toast({
      title: "Campaign sent successfully",
      description: "Your email campaign has been sent.",
    })
    
    // Redirect to dashboard or campaigns list
    router.push("/dashboard")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create Email Campaign</h1>
      
      {/* Progress Steps */}
      <div className="mb-6">
        <Tabs value={currentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(steps).map(([key, label]) => (
              <TabsTrigger
                key={key}
                value={key}
                disabled={true}
                className={currentStep === key ? "text-primary" : ""}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Step Content */}
      <Card className="p-6">
        {currentStep === "compose" && (
          <ComposeEmail
            subject={campaignData.subject}
            content={campaignData.content}
            onUpdate={(subject, content, variables) => {
              setCampaignData(prev => ({ ...prev, subject, content, variables }))
            }}
            onNext={handleNext}
          />
        )}
        
        {currentStep === "upload" && (
          <UploadContacts
            onContactsUploaded={(contacts) => {
              setCampaignData(prev => ({ ...prev, contacts }))
              handleNext()
            }}
          />
        )}
        
        {currentStep === "map" && (
          <MapFields
            contacts={campaignData.contacts}
            requiredFields={["email", ...campaignData.variables]}
            onFieldsMapped={(mappings) => {
              setCampaignData(prev => ({ ...prev, mappings }))
              handleNext()
            }}
          />
        )}
        
        {currentStep === "preview" && (
          <EmailPreview
            campaignData={campaignData}
            onSend={handleCampaignSent}
          />
        )}
      </Card>
    </div>
  )
} 