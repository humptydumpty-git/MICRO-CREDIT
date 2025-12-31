import { useQuery } from '@tanstack/react-query'
import { accountService } from '@/services/accountService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Search } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AccountList({ onEdit, onView }: { onEdit: (id: string) => void; onView: (id: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts', typeFilter],
    queryFn: () => accountService.getAll(typeFilter !== 'all' ? { account_type: typeFilter as any } : undefined),
  })

  const filteredAccounts = accounts?.filter(
    (account) =>
      account.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'success'> = {
      active: 'success',
      dormant: 'secondary',
      frozen: 'destructive',
      closed: 'secondary',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Accounts</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">All Types</option>
              <option value="savings">Savings</option>
              <option value="current">Current</option>
              <option value="loan">Loan</option>
              <option value="fixed_deposit">Fixed Deposit</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Available Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts && filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.account_number}</TableCell>
                  <TableCell>
                    {account.customer
                      ? `${account.customer.first_name} ${account.customer.last_name}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {account.account_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(Number(account.balance))}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(Number(account.available_balance))}
                  </TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onView(account.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(account.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No accounts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

