"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Mail, AlertCircle, Send, Loader2 } from "lucide-react"
import { supabase, checkDatabaseTables } from "@/lib/supabase"
import { getCurrentUser, getUserProfile } from "@/lib/auth"
import { personalizeEmail, sendBulkEmails, EmailData } from "@/lib/email"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface EmailPreviewProps {
  campaignData: {
    subject: string
    content: string
    variables: string[]
    contacts: Array<{ [key: string]: string }>
    mappings: Record<string, string>
  }
  onSend: () => void
}

export function EmailPreview({ campaignData, onSend }: EmailPreviewProps) {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPreviewContent = (contact: { [key: string]: string }, text: string) => {
    let preview = text
    campaignData.variables.forEach(variable => {
      const mappedField = campaignData.mappings[variable]
      const value = contact[mappedField] || `{${variable}}`
      preview = preview.replace(new RegExp(`{${variable}}`, 'g'), value)
    })
    return preview
  }

  const validContacts = campaignData.contacts.filter(
    contact => contact[campaignData.mappings["email"]]?.trim()
  )

  const handleSendCampaign = async () => {
    try {
      setIsSending(true)
      setError(null)

      // First check if SendGrid is configured
      const configResponse = await fetch('/api/email/config')
      const configData = await configResponse.json()
      
      if (!configData.isConfigured) {
        throw new Error('SendGrid API key is not configured. Please set up your email configuration first.')
      }

      // Check if required tables exist
      const tablesCheck = await checkDatabaseTables()
      if (!tablesCheck.success) {
        console.error("Database tables check failed:", tablesCheck.errors || [])
        throw new Error(`Database configuration error: ${tablesCheck.errors?.[0]?.error || 'Required tables do not exist'}`)
      }

      // Get current user and profile
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      const profile = await getUserProfile(user.id)
      if (!profile) {
        throw new Error("Could not load user profile")
      }

      const companyId = profile.company_id
      if (!companyId) {
        throw new Error("No company ID found in user profile. Please set up your company profile first.")
      }

      console.log("Creating email template with data:", {
        name: `Template - ${new Date().toLocaleDateString()}`,
        subject: campaignData.subject,
        content: campaignData.content,
        company_id: companyId,
        created_by: user.id,
        variables: campaignData.variables,
      })

      // Create email template first
      const templateResponse = await supabase
        .from('email_templates')
        .insert({
          name: `Template - ${new Date().toLocaleDateString()}`,
          subject: campaignData.subject,
          content: campaignData.content,
          company_id: companyId,
          created_by: user.id,
          variables: campaignData.variables,
        })
        .select()
        .single()

      console.log("Template creation response:", templateResponse)

      if (templateResponse.error) {
        console.error("Template creation error:", templateResponse.error)
        
        // Check if it's a foreign key constraint error
        if (templateResponse.error.code === '23503') {
          throw new Error("Failed to create email template: Foreign key constraint failed. Please check your company settings.")
        }
        
        // Check if it's a not-null constraint error
        if (templateResponse.error.code === '23502') {
          throw new Error(`Failed to create email template: Required field missing - ${templateResponse.error.details || templateResponse.error.message}`)
        }
        
        throw new Error(`Failed to create email template: ${templateResponse.error.message || templateResponse.error.code || 'Unknown error'}`)
      }

      if (!templateResponse.data) {
        throw new Error("Failed to create email template: No data returned from the server")
      }

      const templateData = templateResponse.data
      if (!templateData.id) {
        throw new Error("Failed to create email template: No template ID returned")
      }

      console.log("Creating campaign with template ID:", templateData.id)

      // Create campaign record with the template ID
      const campaignResponse = await supabase
        .from('campaigns')
        .insert({
          name: `Email Campaign - ${new Date().toLocaleDateString()}`,
          type: 'email',
          status: 'sending',
          template_id: templateData.id,
          company_id: companyId,
          created_by: user.id,
          recipient_count: validContacts.length,
        })
        .select()
        .single()

      console.log("Campaign creation response:", campaignResponse)

      if (campaignResponse.error) {
        console.error("Campaign creation error:", campaignResponse.error)
        
        // Check if it's a foreign key constraint error
        if (campaignResponse.error.code === '23503') {
          throw new Error("Failed to create campaign: Foreign key constraint failed. Please check your template ID and company settings.")
        }
        
        throw new Error(`Failed to create campaign: ${campaignResponse.error.message || campaignResponse.error.code || 'Unknown error'}`)
      }

      if (!campaignResponse.data) {
        throw new Error("Failed to create campaign: No data returned from the server")
      }

      const campaign = campaignResponse.data
      if (!campaign.id) {
        throw new Error("Failed to create campaign: No campaign ID returned")
      }

      // Prepare emails for sending
      const emails: EmailData[] = validContacts.map(contact => {
        const personalizedSubject = getPreviewContent(contact, campaignData.subject)
        const personalizedContent = getPreviewContent(contact, campaignData.content)
        
        return {
          to: contact[campaignData.mappings["email"]],
          subject: personalizedSubject,
          html: personalizedContent,
        }
      })

      console.log(`Sending ${emails.length} emails for campaign ID:`, campaign.id)

      // Send emails
      const result = await sendBulkEmails(
        campaign.id,
        emails,
        companyId
      )

      toast({
        title: "Campaign sent successfully",
        description: `Sent to ${result.success} recipients. Failed: ${result.failed}`,
      })

      onSend()
    } catch (error: any) {
      console.error("Error sending campaign:", error)
      setError(error.message || "Failed to send campaign")
      toast({
        variant: "destructive",
        title: "Failed to send campaign",
        description: error.message || "An error occurred while sending your campaign",
      })
    } finally {
      setIsSending(false)
      setIsConfirming(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Campaign Preview</h3>
        <p className="text-sm text-muted-foreground">
          Review your campaign details before sending
        </p>
      </div>

      {/* Campaign Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Total Recipients</p>
          </div>
          <p className="mt-2 text-2xl font-bold">{validContacts.length}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Variables</Badge>
          </div>
          <p className="mt-2 text-sm">
            {campaignData.variables.join(", ") || "No variables"}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Subject Preview</Badge>
          </div>
          <p className="mt-2 text-sm truncate">
            {getPreviewContent(validContacts[0] || {}, campaignData.subject)}
          </p>
        </Card>
      </div>

      {/* Email Preview */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-2">Content Preview</h4>
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-2">
              Subject: {getPreviewContent(validContacts[0] || {}, campaignData.subject)}
            </p>
            <div className="border-t pt-2">
              <p className="text-sm whitespace-pre-wrap">
                {getPreviewContent(validContacts[0] || {}, campaignData.content)}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Preview shown with data from first contact
          </p>
        </div>
      </Card>

      {/* Sample Recipients */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-2">Sample Recipients</h4>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                {campaignData.variables.map(variable => (
                  <TableHead key={variable}>{variable}</TableHead>
                ))}
                <TableHead>Subject Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validContacts.slice(0, 3).map((contact, index) => (
                <TableRow key={index}>
                  <TableCell>{contact[campaignData.mappings["email"]]}</TableCell>
                  {campaignData.variables.map(variable => (
                    <TableCell key={variable}>
                      {contact[campaignData.mappings[variable]]}
                    </TableCell>
                  ))}
                  <TableCell className="max-w-md truncate">
                    {getPreviewContent(contact, campaignData.subject)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {validContacts.length > 3 && (
          <p className="text-sm text-muted-foreground mt-2">
            And {validContacts.length - 3} more recipients...
          </p>
        )}
      </Card>

      {/* Invalid Contacts Warning */}
      {campaignData.contacts.length !== validContacts.length && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {campaignData.contacts.length - validContacts.length} contacts were skipped due to missing or invalid email addresses
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <div className="mt-2 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/diagnostics')}
              >
                Run System Diagnostics
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/setup')}
              >
                Check Email Configuration
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Send Button */}
      <div className="flex gap-4">
        {!isConfirming ? (
          <Button 
            className="w-full"
            onClick={() => setIsConfirming(true)}
            disabled={isSending || validContacts.length === 0}
          >
            Review and Send
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsConfirming(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              className="w-full"
              onClick={handleSendCampaign}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Confirm and Send ({validContacts.length} emails)
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
} 