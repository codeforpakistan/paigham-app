"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, getUserProfile } from "@/lib/auth"
import { CreditTransaction } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"

export function CreditHistory() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCreditHistory() {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const profile = await getUserProfile(user.id)
        if (!profile) {
          throw new Error("Could not load user profile")
        }

        const companyId = profile.company_id

        const { data, error } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error

        setTransactions(data || [])
      } catch (error: any) {
        console.error("Error fetching credit history:", error)
        setError(error.message || "Failed to load credit history")
      } finally {
        setLoading(false)
      }
    }

    fetchCreditHistory()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        <p>Error loading credit history: {error}</p>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No credit transactions found. Purchase credits to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {new Date(transaction.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>
                <TransactionTypeBadge type={transaction.type} />
              </TableCell>
              <TableCell className="text-right">
                <span className={`flex items-center justify-end ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.amount > 0 ? (
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                  )}
                  {Math.abs(transaction.amount)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TransactionTypeBadge({ type }: { type: string }) {
  switch (type) {
    case 'purchase':
      return <Badge className="bg-green-500">Purchase</Badge>
    case 'usage':
      return <Badge variant="outline">Usage</Badge>
    case 'refund':
      return <Badge className="bg-blue-500">Refund</Badge>
    case 'bonus':
      return <Badge className="bg-purple-500">Bonus</Badge>
    default:
      return <Badge variant="secondary">{type}</Badge>
  }
} 