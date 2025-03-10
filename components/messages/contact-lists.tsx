"use client"

import { useState, useEffect } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, Trash2, Users, Eye, Loader2 } from "lucide-react"
import { getSessionCookie } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import Papa from 'papaparse'

interface Contact {
  first_name: string
  last_name: string
  phone: string
  [key: string]: string // For additional dynamic columns
}

interface ContactList {
  id: string
  name: string
  contact_count: number
  created_at: string
}

interface ContactListsProps {
  onUploadStateChange?: (isUploading: boolean) => void
}

export function ContactLists({ onUploadStateChange }: ContactListsProps) {
  const router = useRouter()
  const session = getSessionCookie()
  const [lists, setLists] = useState<ContactList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<{
    contacts: Contact[]
    headers: string[]
    listName: string
  }>({
    contacts: [],
    headers: [],
    listName: ""
  })

  // Fetch contact lists on mount
  useEffect(() => {
    fetchLists()
  }, [])

  // Update parent's upload state
  useEffect(() => {
    onUploadStateChange?.(isUploading)
  }, [isUploading, onUploadStateChange])

  // Fetch contact lists
  const fetchLists = async () => {
    if (!session) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('contact_lists')
        .select('*')
        .eq('company_id', session.company_id)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to fetch contact lists')
        return
      }

      setLists(data)
    } catch (error) {
      console.error('Error fetching lists:', error)
      toast.error('Failed to fetch contact lists')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle CSV upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      console.log('Starting CSV parse...')
      const result = await new Promise<Papa.ParseResult<Contact>>((resolve, reject) => {
        Papa.parse<Contact>(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => {
            // Remove extra spaces and trim the header
            return header.trim()
          },
          complete: (results) => {
            console.log('Parse complete:', results)
            resolve(results)
          },
          error: (error) => {
            console.error('Parse error:', error)
            reject(error)
          },
        })
      })

      console.log('Parsed data:', result)

      // Clean up the data by trimming all string values
      const cleanedData = result.data.map(contact => {
        const cleaned: { [key: string]: string } = {}
        Object.entries(contact).forEach(([key, value]) => {
          cleaned[key.trim()] = typeof value === 'string' ? value.trim() : value
        })
        return cleaned as Contact
      })

      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'phone']
      const headers = result.meta.fields?.map(f => f.trim()) || []
      console.log('Headers found:', headers)
      const missingFields = requiredFields.filter(field => !headers.includes(field))

      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(', ')}`)
        return
      }

      if (cleanedData.length === 0) {
        toast.error('No valid contacts found in the CSV file')
        return
      }

      // Show preview dialog
      setPreviewData({
        contacts: cleanedData.slice(0, 5), // Preview first 5 contacts
        headers: headers,
        listName: file.name.replace('.csv', '')
      })
      setShowPreview(true)
    } catch (error) {
      console.error('CSV parse error:', error)
      toast.error('Failed to parse CSV file. Please check the file format.')
    } finally {
      setIsUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  // Handle contact list creation
  const handleCreateList = async () => {
    if (!session || !previewData.contacts.length) return

    try {
      setIsUploading(true)
      console.log('Creating contact list...')

      // First create the contact list
      const { data: list, error: listError } = await supabase
        .from('contact_lists')
        .insert({
          name: previewData.listName,
          company_id: session.company_id,
          contact_count: previewData.contacts.length
        })
        .select()
        .single()

      if (listError) {
        console.error('List creation error:', listError)
        throw new Error(`Failed to create contact list: ${listError.message}`)
      }

      console.log('Contact list created:', list)

      // Then insert all contacts
      const { error: contactsError } = await supabase
        .from('contacts')
        .insert(
          previewData.contacts.map(contact => ({
            ...contact,
            company_id: session.company_id,
            list_id: list.id
          }))
        )

      if (contactsError) {
        console.error('Contacts creation error:', contactsError)
        // Try to clean up the list if contacts insertion fails
        await supabase.from('contact_lists').delete().eq('id', list.id)
        throw new Error(`Failed to create contacts: ${contactsError.message}`)
      }

      console.log('Contacts created successfully')
      toast.success('Contact list created successfully')
      setShowPreview(false)
      fetchLists()
    } catch (error) {
      console.error('Create list error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create contact list')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle list deletion
  const handleDeleteList = async (listId: string) => {
    if (!session) return

    try {
      // Delete contacts first (cascade delete in database would also work)
      await supabase
        .from('contacts')
        .delete()
        .eq('list_id', listId)

      // Then delete the list
      await supabase
        .from('contact_lists')
        .delete()
        .eq('id', listId)

      toast.success('Contact list deleted')
      fetchLists()
    } catch (error) {
      console.error('Delete list error:', error)
      toast.error('Failed to delete contact list')
    }
  }

  return (
    <>
      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileUpload}
        disabled={isUploading}
      />

      {/* Contact Lists Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading contact lists...
                  </div>
                </TableCell>
              </TableRow>
            ) : lists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No contact lists yet. Upload a CSV file to get started.
                </TableCell>
              </TableRow>
            ) : (
              lists.map((list) => (
                <TableRow key={list.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      {list.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {list.contact_count.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(list.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteList(list.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={(open) => {
        if (!open) {
          setShowPreview(false)
          setPreviewData({
            contacts: [],
            headers: [],
            listName: ""
          })
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview Contact List</DialogTitle>
            <DialogDescription>
              Review the first 5 contacts from your CSV file before creating the list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                value={previewData.listName}
                onChange={(e) => setPreviewData(prev => ({
                  ...prev,
                  listName: e.target.value
                }))}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewData.headers.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.contacts.map((contact, index) => (
                    <TableRow key={index}>
                      {previewData.headers.map((header) => (
                        <TableCell key={header}>{contact[header]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {previewData.contacts.length} of {previewData.contacts.length} contacts
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateList}
              disabled={!previewData.listName || previewData.contacts.length === 0}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Contact List'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 