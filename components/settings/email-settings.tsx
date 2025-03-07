"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Save, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, getUserProfile } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { CompanySettings } from "@/lib/supabase"

export function EmailSettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    sendgrid_api_key: "",
    default_sender_email: "",
    default_sender_name: ""
  })
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        setError(null)

        const user = await getCurrentUser()
        if (!user) return

        const profile = await getUserProfile(user.id)
        if (!profile) {
          throw new Error("Could not load user profile")
        }

        const companyId = profile.company_id

        // Check if settings exist
        const { data, error } = await supabase
          .from("company_settings")
          .select("*")
          .eq("company_id", companyId)
          .single()

        if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned" error
          throw error
        }

        // If settings exist, set them
        if (data) {
          setSettings(data)
          setFormData({
            sendgrid_api_key: data.sendgrid_api_key || "",
            default_sender_email: data.default_sender_email || "",
            default_sender_name: data.default_sender_name || ""
          })
        }
      } catch (error: any) {
        console.error("Error loading email settings:", error)
        setError(error.message || "Failed to load email settings")
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError(null)

      const user = await getCurrentUser()
      if (!user) return

      const profile = await getUserProfile(user.id)
      if (!profile) {
        throw new Error("Could not load user profile")
      }

      const companyId = profile.company_id

      // Check if we're updating or inserting
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from("company_settings")
          .update({
            sendgrid_api_key: formData.sendgrid_api_key,
            default_sender_email: formData.default_sender_email,
            default_sender_name: formData.default_sender_name,
            updated_at: new Date().toISOString()
          })
          .eq("id", settings.id)

        if (error) throw error
      } else {
        // Insert new settings
        const { error } = await supabase
          .from("company_settings")
          .insert({
            company_id: companyId,
            sendgrid_api_key: formData.sendgrid_api_key,
            default_sender_email: formData.default_sender_email,
            default_sender_name: formData.default_sender_name
          })

        if (error) throw error
      }

      toast({
        title: "Settings saved",
        description: "Your email settings have been updated successfully.",
      })

      // Reload settings
      const { data } = await supabase
        .from("company_settings")
        .select("*")
        .eq("company_id", companyId)
        .single()

      setSettings(data)
    } catch (error: any) {
      console.error("Error saving email settings:", error)
      setError(error.message || "Failed to save email settings")
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: error.message || "An error occurred while saving your settings.",
      })
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    try {
      setTestStatus("loading")
      setError(null)

      // Call our API to test the SendGrid connection
      const response = await fetch("/api/email/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: formData.sendgrid_api_key,
          from: formData.default_sender_email,
          fromName: formData.default_sender_name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to test connection")
      }

      setTestStatus("success")
      toast({
        title: "Connection successful",
        description: "Your SendGrid API key is working correctly.",
      })
    } catch (error: any) {
      console.error("Error testing SendGrid connection:", error)
      setTestStatus("error")
      setError(error.message || "Failed to test connection")
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error.message || "Failed to connect to SendGrid. Please check your API key.",
      })
    } finally {
      // Reset test status after 3 seconds
      setTimeout(() => {
        setTestStatus("idle")
      }, 3000)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>Configure your SendGrid integration</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
        <CardDescription>Configure your SendGrid integration for sending emails</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="sendgrid_api_key">SendGrid API Key</Label>
          <Input
            id="sendgrid_api_key"
            name="sendgrid_api_key"
            type="password"
            value={formData.sendgrid_api_key}
            onChange={handleChange}
            placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <p className="text-sm text-muted-foreground">
            You can get your API key from the <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">SendGrid dashboard</a>.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="default_sender_email">Default Sender Email</Label>
          <Input
            id="default_sender_email"
            name="default_sender_email"
            type="email"
            value={formData.default_sender_email}
            onChange={handleChange}
            placeholder="noreply@yourcompany.com"
          />
          <p className="text-sm text-muted-foreground">
            This email must be verified in your SendGrid account.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="default_sender_name">Default Sender Name</Label>
          <Input
            id="default_sender_name"
            name="default_sender_name"
            value={formData.default_sender_name}
            onChange={handleChange}
            placeholder="Your Company Name"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={testConnection}
          disabled={!formData.sendgrid_api_key || !formData.default_sender_email || testStatus === "loading"}
        >
          {testStatus === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : testStatus === "success" ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              Connected
            </>
          ) : testStatus === "error" ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
              Failed
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
        <Button 
          onClick={saveSettings}
          disabled={saving || !formData.sendgrid_api_key || !formData.default_sender_email}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 