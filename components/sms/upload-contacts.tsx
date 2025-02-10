"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Contact {
  [key: string]: string
}

interface UploadContactsProps {
  onContactsUploaded: (contacts: Contact[]) => void
}

export function UploadContacts({ onContactsUploaded }: UploadContactsProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setError("Please upload a CSV file")
      return
    }

    setFile(file)
    setError("")
    
    try {
      setLoading(true)
      const contacts = await parseCSV(file)
      onContactsUploaded(contacts)
    } catch (err) {
      setError("Error parsing CSV file. Please check the format.")
    } finally {
      setLoading(false)
    }
  }

  const parseCSV = (file: File): Promise<Contact[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string
          const lines = text.split('\n')
          const headers = lines[0].split(',').map(header => header.trim())
          
          const contacts = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',').map(value => value.trim())
              return headers.reduce((obj, header, index) => {
                obj[header] = values[index] || ''
                return obj
              }, {} as Contact)
            })

          resolve(contacts)
        } catch (err) {
          reject(err)
        }
      }

      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Upload Contacts</h3>
        <p className="text-sm text-muted-foreground">
          Upload a CSV file containing your contacts' information
        </p>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="cursor-pointer"
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground">
          {file ? (
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {file.name}
            </span>
          ) : (
            "Supported format: CSV"
          )}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Upload className="h-4 w-4 animate-spin" />
          Processing file...
        </div>
      )}
    </div>
  )
} 