import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight } from 'lucide-react'
import TransactionForm from '@/components/transactions/TransactionForm'
import { useQuery } from '@tanstack/react-query'
import { transactionService } from '@/services/transactionService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useQueryClient } from '@tanstack/react-query'

export default function TransactionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal' | 'transfer'>('deposit')
  const queryClient = useQueryClient()

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionService.getAll(),
  })

  const handleOpenForm = (type: 'deposit' | 'withdrawal' | 'transfer') => {
    setTransactionType(type)
    setIsFormOpen(true)
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['accounts'] })
  }

  const getTransactionIcon = (type: string) => {
    if (type.includes('deposit') || type.includes('credit') || type.includes('in')) {
      return <ArrowDownCircle className="h-4 w-4 text-green-600" />
    } else if (type.includes('withdrawal') || type.includes('debit') || type.includes('out')) {
      return <ArrowUpCircle className="h-4 w-4 text-red-600" />
    } else {
      return <ArrowLeftRight className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-1">View and manage transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleOpenForm('deposit')}>
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Deposit
          </Button>
          <Button variant="outline" onClick={() => handleOpenForm('withdrawal')}>
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Withdrawal
          </Button>
          <Button variant="outline" onClick={() => handleOpenForm('transfer')}>
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Transfer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance After</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 50).map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-sm">{txn.transaction_ref}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(txn.transaction_type)}
                          <span className="capitalize">{txn.transaction_type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{txn.account?.account_number}</TableCell>
                      <TableCell
                        className={`font-semibold ${
                          txn.transaction_type.includes('deposit') || txn.transaction_type.includes('credit') || txn.transaction_type.includes('in')
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {txn.transaction_type.includes('deposit') || txn.transaction_type.includes('credit') || txn.transaction_type.includes('in')
                          ? '+'
                          : '-'}
                        {formatCurrency(Number(txn.amount))}
                      </TableCell>
                      <TableCell>{formatCurrency(Number(txn.balance_after || 0))}</TableCell>
                      <TableCell>
                        <Badge variant={txn.status === 'completed' ? 'success' : 'secondary'}>
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDateTime(txn.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TransactionForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        type={transactionType}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
