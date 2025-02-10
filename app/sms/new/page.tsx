"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComposeMessage } from "@/components/sms/compose-message"
import { UploadContacts } from "@/components/sms/upload-contacts"
import { MapFields } from "@/components/sms/map-fields"
import { CampaignPreview } from "@/components/sms/campaign-preview"

type Step = "compose" | "upload" | "map" | "preview"

export default function NewSMSCampaign() {
  const [currentStep, setCurrentStep] = useState<Step>("compose")
  const [campaignData, setCampaignData] = useState({
    message: "",
    variables: [] as string[],
    contacts: [] as any[],
    mappings: {} as Record<string, string>,
  })

  const steps: { [key in Step]: string } = {
    compose: "Compose Message",
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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create SMS Campaign</h1>
      
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
          <ComposeMessage
            message={campaignData.message}
            onUpdate={(message, variables) => {
              setCampaignData(prev => ({ ...prev, message, variables }))
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
            requiredFields={["phone", ...campaignData.variables]}
            onFieldsMapped={(mappings) => {
              setCampaignData(prev => ({ ...prev, mappings }))
              handleNext()
            }}
          />
        )}
        
        {currentStep === "preview" && (
          <CampaignPreview
            campaignData={campaignData}
            onSend={() => {
              // Handle campaign sending
              console.log("Sending campaign:", campaignData)
            }}
          />
        )}
      </Card>
    </div>
  )
} 