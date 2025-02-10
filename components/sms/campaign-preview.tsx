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
import { MessageSquare, AlertCircle, Send } from "lucide-react"

interface CampaignPreviewProps {
  campaignData: {
    message: string
    variables: string[]
    contacts: Array<{ [key: string]: string }>
    mappings: Record<string, string>
  }
  onSend: () => void
}

export function CampaignPreview({ campaignData, onSend }: CampaignPreviewProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const getPreviewMessage = (contact: { [key: string]: string }) => {
    let preview = campaignData.message
    campaignData.variables.forEach(variable => {
      const mappedField = campaignData.mappings[variable]
      const value = contact[mappedField] || `{${variable}}`
      preview = preview.replace(`{${variable}}`, value)
    })
    return preview
  }

  const validContacts = campaignData.contacts.filter(
    contact => contact[campaignData.mappings["phone"]]?.trim()
  )

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
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Total Messages</p>
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
            <Badge variant="secondary">Message Length</Badge>
          </div>
          <p className="mt-2 text-sm">
            {getPreviewMessage(validContacts[0] || {}).length} characters
            ({Math.ceil(getPreviewMessage(validContacts[0] || {}).length / 160)} SMS)
          </p>
        </Card>
      </div>

      {/* Message Preview */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-2">Message Preview</h4>
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm whitespace-pre-wrap">
              {getPreviewMessage(validContacts[0] || {})}
            </p>
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
                <TableHead>Phone</TableHead>
                {campaignData.variables.map(variable => (
                  <TableHead key={variable}>{variable}</TableHead>
                ))}
                <TableHead>Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validContacts.slice(0, 3).map((contact, index) => (
                <TableRow key={index}>
                  <TableCell>{contact[campaignData.mappings["phone"]]}</TableCell>
                  {campaignData.variables.map(variable => (
                    <TableCell key={variable}>
                      {contact[campaignData.mappings[variable]]}
                    </TableCell>
                  ))}
                  <TableCell className="max-w-md truncate">
                    {getPreviewMessage(contact)}
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
            {campaignData.contacts.length - validContacts.length} contacts were skipped due to missing or invalid phone numbers
          </AlertDescription>
        </Alert>
      )}

      {/* Send Button */}
      <div className="flex gap-4">
        {!isConfirming ? (
          <Button 
            className="w-full"
            onClick={() => setIsConfirming(true)}
          >
            Review and Send
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsConfirming(false)}
            >
              Cancel
            </Button>
            <Button 
              className="w-full"
              onClick={onSend}
            >
              <Send className="mr-2 h-4 w-4" />
              Confirm and Send ({validContacts.length} messages)
            </Button>
          </>
        )}
      </div>
    </div>
  )
} 