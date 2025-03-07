"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  PersonIcon, 
  TargetIcon, 
  EnvelopeClosedIcon,
  ReaderIcon,
  ArrowRightIcon,
  MixerHorizontalIcon
} from "@radix-ui/react-icons"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ComposeEmailProps {
  subject: string
  content: string
  onUpdate: (subject: string, content: string, variables: string[]) => void
  onNext: () => void
}

const VARIABLE_SUGGESTIONS = [
  { name: "name", icon: <PersonIcon className="h-4 w-4" />, description: "Recipient's name" },
  { name: "email", icon: <EnvelopeClosedIcon className="h-4 w-4" />, description: "Email address" },
  { name: "offer", icon: <TargetIcon className="h-4 w-4" />, description: "Special offer or discount" },
  { name: "custom", icon: <MixerHorizontalIcon className="h-4 w-4" />, description: "Custom field" }
]

export function ComposeEmail({ subject, content, onUpdate, onNext }: ComposeEmailProps) {
  const [emailSubject, setEmailSubject] = useState(subject)
  const [emailContent, setEmailContent] = useState(content)
  const [variables, setVariables] = useState<string[]>([])

  // Extract variables from text
  const extractVariables = (text: string) => {
    const matches = text.match(/\{([^}]+)\}/g) || []
    return Array.from(new Set(matches.map(match => match.slice(1, -1))))
  }

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setEmailContent(newContent)
    const newVars = extractVariables(newContent + emailSubject)
    setVariables(newVars)
    onUpdate(emailSubject, newContent, newVars)
  }

  // Handle subject changes
  const handleSubjectChange = (newSubject: string) => {
    setEmailSubject(newSubject)
    const newVars = extractVariables(emailContent + newSubject)
    setVariables(newVars)
    onUpdate(newSubject, emailContent, newVars)
  }

  const insertVariable = (varName: string) => {
    const cursorPosition = document.activeElement as HTMLTextAreaElement
    const isSubjectFocused = cursorPosition?.id === 'subject'
    
    if (isSubjectFocused) {
      const newSubject = emailSubject + `{${varName}}`
      handleSubjectChange(newSubject)
    } else {
      const newContent = emailContent + `{${varName}}`
      handleContentChange(newContent)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <ReaderIcon className="h-4 w-4" />
            Email Subject
          </label>
          <Input
            id="subject"
            placeholder="Enter email subject..."
            value={emailSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <ReaderIcon className="h-4 w-4" />
            Email Content
          </label>
          <Textarea
            placeholder="Write your email content here... Use {variable} for personalization"
            value={emailContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Quick Insert Variables</label>
        <div className="flex flex-wrap gap-2">
          {VARIABLE_SUGGESTIONS.map(({ name, icon, description }) => (
            <TooltipProvider key={name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(name)}
                    className="gap-2"
                  >
                    {icon}
                    {name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {variables.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <TargetIcon className="h-4 w-4" />
            Variables Detected
          </label>
          <div className="flex flex-wrap gap-2">
            {variables.map(variable => (
              <Badge key={variable} variant="secondary" className="gap-1">
                <MixerHorizontalIcon className="h-3 w-3" />
                {variable}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button 
        onClick={onNext}
        disabled={!emailSubject.trim() || !emailContent.trim()}
        className="w-full gap-2"
      >
        Continue to Upload Contacts
        <ArrowRightIcon className="h-4 w-4" />
      </Button>
    </div>
  )
} 