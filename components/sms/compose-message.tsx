"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  PersonIcon, 
  TargetIcon, 
  MobileIcon, 
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

interface ComposeMessageProps {
  message: string
  onUpdate: (message: string, variables: string[]) => void
  onNext: () => void
}

const VARIABLE_SUGGESTIONS = [
  { name: "name", icon: <PersonIcon className="h-4 w-4" />, description: "Recipient's name" },
  { name: "offer", icon: <TargetIcon className="h-4 w-4" />, description: "Special offer or discount" },
  { name: "phone", icon: <MobileIcon className="h-4 w-4" />, description: "Phone number" },
  { name: "custom", icon: <MixerHorizontalIcon className="h-4 w-4" />, description: "Custom field" }
]

export function ComposeMessage({ message, onUpdate, onNext }: ComposeMessageProps) {
  const [text, setText] = useState(message)
  const [variables, setVariables] = useState<string[]>([])

  // Extract variables from text
  const extractVariables = (text: string) => {
    const matches = text.match(/\{([^}]+)\}/g) || []
    return Array.from(new Set(matches.map(match => match.slice(1, -1))))
  }

  // Handle text change
  const handleTextChange = (newText: string) => {
    setText(newText)
    const newVars = extractVariables(newText)
    setVariables(newVars)
    onUpdate(newText, newVars)
  }

  const insertVariable = (varName: string) => {
    const newText = text + `{${varName}}`
    handleTextChange(newText)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            <ReaderIcon className="h-4 w-4" />
            Message Text
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground">
                  {Math.ceil(text.length / 160)} SMS ({text.length} characters)
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Messages longer than 160 characters will be split into multiple SMS</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          placeholder="Write your message here... Use {variable} for personalization"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="h-32 font-mono text-sm"
        />
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
        disabled={!text.trim()}
        className="w-full gap-2"
      >
        Continue to Upload Contacts
        <ArrowRightIcon className="h-4 w-4" />
      </Button>
    </div>
  )
} 