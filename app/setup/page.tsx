"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Database, Copy, ExternalLink, Mail, Loader2 } from "lucide-react"
import { checkDatabaseTables } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { setupSqlScript } from "./sql-script"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function SetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tablesStatus, setTablesStatus] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testSubject, setTestSubject] = useState("Paigham Test Email")
  const [testContent, setTestContent] = useState("This is a test email from Paigham to verify your SendGrid integration is working correctly.")
  const [testEmailError, setTestEmailError] = useState<string | null>(null)
  const [testEmailSuccess, setTestEmailSuccess] = useState<string | null>(null)
  const [testEmailLoading, setTestEmailLoading] = useState(false)
  const [emailConfig, setEmailConfig] = useState<{
    sendgridApiKey: boolean;
    defaultSenderEmail: string | null;
    defaultSenderName: string | null;
  } | null>(null)
  const [configLoading, setConfigLoading] = useState(false)

  const checkTables = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const tablesCheck = await checkDatabaseTables()
      setTablesStatus(tablesCheck)
    } catch (err) {
      console.error('Error checking tables:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const setupDatabase = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`)
      }
      
      setSuccess(data.message || 'Database setup completed successfully')
      
      // Check tables again after setup
      await checkTables()
    } catch (err) {
      console.error('Error setting up database:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(setupSqlScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendTestEmail = async () => {
    setTestEmailLoading(true)
    setTestEmailError(null)
    setTestEmailSuccess(null)
    
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: testEmail,
          subject: testSubject,
          content: testContent
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`)
      }
      
      setTestEmailSuccess(data.message || 'Test email sent successfully')
    } catch (err) {
      console.error('Error sending test email:', err)
      setTestEmailError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setTestEmailLoading(false)
    }
  }

  // Check email configuration
  const checkEmailConfig = async () => {
    setConfigLoading(true)
    
    try {
      const response = await fetch('/api/email/config')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`)
      }
      
      setEmailConfig(data.config)
    } catch (err) {
      console.error('Error checking email configuration:', err)
    } finally {
      setConfigLoading(false)
    }
  }

  // Check tables and email config on initial load
  useEffect(() => {
    checkTables()
    checkEmailConfig()
  }, [])

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Database Setup</h1>
        
        <Tabs defaultValue="automatic">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="automatic">Automatic Setup</TabsTrigger>
            <TabsTrigger value="manual">Manual Setup</TabsTrigger>
            <TabsTrigger value="test-email">Test Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="automatic">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Automatic Database Setup
                </CardTitle>
                <CardDescription>
                  Initialize your database tables for Paigham automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tablesStatus && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-sm font-medium">Tables Status:</div>
                      <div className="text-sm">
                        {tablesStatus.success ? (
                          <Alert className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>All Tables Available</AlertTitle>
                            <AlertDescription>
                              Your database is properly configured with all required tables.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Missing Tables</AlertTitle>
                            <AlertDescription>
                              Some required tables are missing. Click the "Setup Database" button below to create them.
                              {tablesStatus.errors && tablesStatus.errors.length > 0 && (
                                <div className="mt-2 text-xs">
                                  {tablesStatus.errors.map((err: any, index: number) => (
                                    <div key={index} className="mb-1">
                                      <strong>{err.table}:</strong> {err.error}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="bg-green-50 text-green-700 border-green-200 mb-4">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-4">
                    <Button 
                      onClick={checkTables} 
                      variant="outline"
                      disabled={loading}
                      className="gap-2"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Check Tables
                    </Button>
                    
                    <Button 
                      onClick={setupDatabase}
                      disabled={loading || (tablesStatus && tablesStatus.success)}
                      className="gap-2"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Database className="h-4 w-4" />
                      )}
                      Setup Database
                    </Button>
                    
                    {tablesStatus && tablesStatus.success && (
                      <Button 
                        onClick={() => router.push('/dashboard')}
                        variant="default"
                        className="ml-auto"
                      >
                        Continue to Dashboard
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manual">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Manual Database Setup
                </CardTitle>
                <CardDescription>
                  Run this SQL script in your Supabase SQL Editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Instructions</AlertTitle>
                    <AlertDescription>
                      <ol className="list-decimal pl-4 space-y-2 mt-2">
                        <li>Copy the SQL script below</li>
                        <li>Go to your Supabase dashboard</li>
                        <li>Navigate to the SQL Editor</li>
                        <li>Paste the script and run it</li>
                        <li>Return here and click "Check Tables" to verify</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="relative">
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md text-xs overflow-auto max-h-96">
                      {setupSqlScript}
                    </pre>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="absolute top-2 right-2 gap-1"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open('https://app.supabase.com', '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Supabase Dashboard
                    </Button>
                    
                    <Button 
                      onClick={checkTables} 
                      className="gap-2"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Check Tables
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test-email">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Test Email Configuration
                </CardTitle>
                <CardDescription>
                  Send a test email to verify your SendGrid integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Email Configuration</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 text-xs space-y-1">
                        {configLoading ? (
                          <div className="flex items-center">
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                            Loading configuration...
                          </div>
                        ) : emailConfig ? (
                          <>
                            <div>
                              <strong>SendGrid API Key:</strong> {emailConfig.sendgridApiKey ? (
                                <span className="text-green-600">Configured ✓</span>
                              ) : (
                                <span className="text-red-600">Not configured ✗</span>
                              )}
                            </div>
                            <div>
                              <strong>Default Sender Email:</strong> {emailConfig.defaultSenderEmail || (
                                <span className="text-amber-600">Not configured (will use fallback)</span>
                              )}
                            </div>
                            <div>
                              <strong>Default Sender Name:</strong> {emailConfig.defaultSenderName || (
                                <span className="text-amber-600">Not configured (will use fallback)</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-red-600">Failed to load configuration</div>
                        )}
                      </div>
                      <div className="mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={checkEmailConfig}
                          disabled={configLoading}
                          className="text-xs h-7 px-2"
                        >
                          {configLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          Refresh
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Recipient Email</Label>
                      <Input
                        id="email"
                        placeholder="Enter recipient email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Test Email Subject"
                        value={testSubject}
                        onChange={(e) => setTestSubject(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Email content"
                        value={testContent}
                        onChange={(e) => setTestContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                  
                  {testEmailError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{testEmailError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {testEmailSuccess && (
                    <Alert className="bg-green-50 text-green-700 border-green-200 mt-4">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>{testEmailSuccess}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    onClick={sendTestEmail}
                    disabled={testEmailLoading || !testEmail}
                    className="w-full mt-4"
                  >
                    {testEmailLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>
            This setup page will create all the necessary tables in your Supabase database.
          </p>
          <p className="mt-1">
            Make sure your Supabase URL and API key are correctly configured in your environment variables.
          </p>
        </div>
      </div>
    </div>
  )
} 