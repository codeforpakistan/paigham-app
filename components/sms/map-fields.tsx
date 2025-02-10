"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface MapFieldsProps {
  contacts: Array<{ [key: string]: string }>
  requiredFields: string[]
  onFieldsMapped: (mappings: Record<string, string>) => void
}

export function MapFields({ contacts, requiredFields, onFieldsMapped }: MapFieldsProps) {
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [error, setError] = useState<string>("")

  // Get available columns from the first contact
  const availableColumns = contacts.length > 0 ? Object.keys(contacts[0]) : []

  const handleMapping = (requiredField: string, selectedColumn: string) => {
    setMappings(prev => ({
      ...prev,
      [requiredField]: selectedColumn
    }))
    setError("")
  }

  const handleSubmit = () => {
    // Check if all required fields are mapped
    const missingFields = requiredFields.filter(field => !mappings[field])
    
    if (missingFields.length > 0) {
      setError(`Please map the following fields: ${missingFields.join(", ")}`)
      return
    }

    onFieldsMapped(mappings)
  }

  const previewValue = (field: string) => {
    const mappedColumn = mappings[field]
    if (!mappedColumn || !contacts.length) return "No preview available"
    return contacts[0][mappedColumn]
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Map Fields</h3>
        <p className="text-sm text-muted-foreground">
          Match your CSV columns to the required fields
        </p>
      </div>

      <div className="space-y-4">
        {requiredFields.map(field => (
          <div key={field} className="grid gap-2">
            <label className="text-sm font-medium capitalize">
              {field.replace("_", " ")}
              <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-4">
              <Select
                value={mappings[field]}
                onValueChange={(value) => handleMapping(field, value)}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map(column => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Preview:</span>
                <span className="font-mono">{previewValue(field)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleSubmit} className="w-full">
        Continue to Preview
      </Button>
    </div>
  )
} 