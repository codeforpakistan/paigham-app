"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  Send,
  MessageSquare,
  Users,
  Variable,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { getSessionCookie } from "@/lib/session"
import { supabase } from "@/lib/supabase"

interface ContactList {
  id: string
  name: string
  contact_count: number
}

interface Campaign {
  id: string
  name: string
  message_template: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  progress: number
  total_messages: number
  sent_messages: number
  failed_messages: number
  created_at: string
}

interface CampaignsProps {
  showNewCampaign?: boolean
  onClose?: () => void
}

export function Campaigns({ showNewCampaign, onClose }: CampaignsProps) {
  const router = useRouter()
  const session = getSessionCookie()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [contactLists, setContactLists] = useState<ContactList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    listId: "",
    messageTemplate: ""
  })

  // Available variables for message template
  const variables = [
    { key: "first_name", description: "Recipient's first name" },
    { key: "last_name", description: "Recipient's last name" },
    { key: "phone", description: "Recipient's phone number" },
  ]

  // Memoize fetchData to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    if (!session?.company_id) return

    try {
      setIsLoading(true)
      console.log('Fetching campaigns and contact lists...')

      // Fetch campaigns
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          *,
          contact_list:contact_lists (
            name,
            contact_count
          )
        `)
        .eq('company_id', session.company_id)
        .order('created_at', { ascending: false })

      if (campaignError) {
        console.error('Failed to fetch campaigns:', campaignError)
        toast.error('Failed to fetch campaigns')
        return
      }

      console.log('Campaigns fetched:', campaignData)
      setCampaigns(campaignData || [])

      // Fetch contact lists
      const { data: listData, error: listError } = await supabase
        .from('contact_lists')
        .select('id, name, contact_count')
        .eq('company_id', session.company_id)

      if (listError) {
        console.error('Failed to fetch contact lists:', listError)
        toast.error('Failed to fetch contact lists')
        return
      }

      console.log('Contact lists fetched:', listData)
      setContactLists(listData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }, [session?.company_id]) // Only recreate if company_id changes

  // Fetch campaigns and contact lists
  useEffect(() => {
    fetchData()
  }, [fetchData]) // Depend on memoized fetchData

  // Insert variable at cursor position
  const insertVariable = (variable: string) => {
    const template = newCampaign.messageTemplate
    const variableText = `{{${variable}}}`
    setNewCampaign(prev => ({
      ...prev,
      messageTemplate: template + variableText
    }))
  }

  // Create new campaign
  const handleCreateCampaign = async () => {
    if (!session || !newCampaign.listId || !newCampaign.messageTemplate) return

    try {
      setIsCreating(true)
      console.log('Creating campaign...')

      // Get contact count for the selected list
      const selectedList = contactLists.find(list => list.id === newCampaign.listId)
      if (!selectedList) throw new Error('Contact list not found')

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name: newCampaign.name,
          message_template: newCampaign.messageTemplate,
          contact_list_id: newCampaign.listId,
          company_id: session.company_id,
          status: 'draft',
          total_messages: selectedList.contact_count,
          sent_messages: 0,
          failed_messages: 0,
          progress: 0
        })
        .select(`
          *,
          contact_list:contact_lists (
            name,
            contact_count
          )
        `)
        .single()

      if (campaignError) {
        console.error('Campaign creation error:', campaignError)
        throw new Error(`Failed to create campaign: ${campaignError.message}`)
      }

      console.log('Campaign created:', campaign)

      // Start processing the campaign
      console.log('Starting campaign processing...')
      console.log('Session state:', {
        exists: !!session,
        company_id: session.company_id,
        user_id: session.user?.id
      })

      const response = await fetch('/api/campaigns/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include credentials
        body: JSON.stringify({
          campaignId: campaign.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Campaign processing error response:', errorData)
        throw new Error(errorData.error || 'Failed to start campaign processing')
      }

      const result = await response.json()
      console.log('Campaign processing started:', result)

      toast.success('Campaign created and started processing')
      onClose?.()
      setNewCampaign({
        name: "",
        listId: "",
        messageTemplate: ""
      })
      
      // Update the campaigns list with the new campaign
      setCampaigns(prev => [campaign, ...prev])
    } catch (error) {
      console.error('Create campaign error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create campaign')
    } finally {
      setIsCreating(false)
    }
  }

  // Get status icon
  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'processing':
        return <PlayCircle className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <PauseCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <>
      {/* Campaigns Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading campaigns...
                  </div>
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No campaigns yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      {campaign.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={campaign.progress} />
                      <p className="text-xs text-muted-foreground">
                        {campaign.sent_messages} / {campaign.total_messages} messages sent
                        {campaign.failed_messages > 0 && ` (${campaign.failed_messages} failed)`}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      <span className="capitalize">{campaign.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* New Campaign Dialog */}
      <Dialog open={showNewCampaign} onOpenChange={(open) => {
        if (!open) {
          onClose?.()
          setNewCampaign({
            name: "",
            listId: "",
            messageTemplate: ""
          })
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Create a new message campaign with dynamic variables.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="e.g., Welcome Message"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="contact-list">Contact List</Label>
              <Select
                value={newCampaign.listId}
                onValueChange={(value) => setNewCampaign(prev => ({
                  ...prev,
                  listId: value
                }))}
              >
                <SelectTrigger id="contact-list">
                  <SelectValue placeholder="Select a contact list" />
                </SelectTrigger>
                <SelectContent>
                  {contactLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {list.name} ({list.contact_count} contacts)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full gap-1.5">
              <Label>Available Variables</Label>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <Button
                    key={variable.key}
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable.key)}
                  >
                    <Variable className="mr-2 h-4 w-4" />
                    {variable.key}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click a variable to insert it into your message
              </p>
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="message">Message Template</Label>
              <Textarea
                id="message"
                placeholder="Type your message here. Use variables like {{first_name}} to personalize."
                className="h-32"
                value={newCampaign.messageTemplate}
                onChange={(e) => setNewCampaign(prev => ({
                  ...prev,
                  messageTemplate: e.target.value
                }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={!newCampaign.name || !newCampaign.listId || !newCampaign.messageTemplate || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 