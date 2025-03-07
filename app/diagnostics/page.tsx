"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Database, Settings } from "lucide-react"
import { checkDatabaseTables } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function DiagnosticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [localTablesCheck, setLocalTablesCheck] = useState<any>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Run local table check
      const tablesCheck = await checkDatabaseTables()
      setLocalTablesCheck(tablesCheck)
      
      // Call the diagnostics API
      const response = await fetch('/api/diagnostics')
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setDiagnostics(data)
    } catch (err) {
      console.error('Error running diagnostics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">System Diagnostics</h1>
        <Button 
          onClick={runDiagnostics} 
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Run Diagnostics
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Connection
            </CardTitle>
            <CardDescription>
              Database connection status and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : diagnostics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">URL:</div>
                  <div className="text-sm">{diagnostics.supabase.url}</div>
                  
                  <div className="text-sm font-medium">API Key:</div>
                  <div className="text-sm">
                    {diagnostics.supabase.hasApiKey ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Configured
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        Missing
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm font-medium">Connection:</div>
                  <div className="text-sm">
                    {diagnostics.supabase.connectionStatus === 'connected' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </div>
                </div>

                {diagnostics.supabase.connectionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription className="text-xs">
                      {diagnostics.supabase.connectionError.message}
                      {diagnostics.supabase.connectionError.code && (
                        <div className="mt-1">Code: {diagnostics.supabase.connectionError.code}</div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>
              Required tables for the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : localTablesCheck ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Status:</div>
                  <div className="text-sm">
                    {localTablesCheck.success ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        All Tables Available
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Missing Tables
                      </Badge>
                    )}
                  </div>
                </div>

                {!localTablesCheck.success && localTablesCheck.errors && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Table Errors:</div>
                    {localTablesCheck.errors.map((err: any, index: number) => (
                      <Alert key={index} variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{err.table}</AlertTitle>
                        <AlertDescription className="text-xs">
                          {err.error}
                        </AlertDescription>
                      </Alert>
                    ))}
                    
                    <div className="mt-4">
                      <Button 
                        onClick={() => router.push('/setup')}
                        className="w-full gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Go to Database Setup
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {diagnostics && (
        <div className="mt-6 text-xs text-muted-foreground">
          Diagnostics run at: {new Date(diagnostics.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  )
} 