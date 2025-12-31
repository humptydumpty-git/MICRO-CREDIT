import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import LoanApplicationForm from '@/components/loans/LoanApplicationForm'
import { useQuery } from '@tanstack/react-query'
import { loanService } from '@/services/loanService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useQueryClient } from '@tanstack/react-query'

export default function LoansPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: loans, isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => loanService.getAll(),
  })

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['loans'] })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'success'> = {
      pending: 'secondary',
      approved: 'default',
      disbursed: 'success',
      active: 'success',
      overdue: 'destructive',
      defaulted: 'destructive',
      closed: 'secondary',
      rejected: 'destructive',
    }
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-500 mt-1">Manage loans and loan products</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Loan Application
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
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
                  <TableHead>Loan Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Principal Amount</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Maturity Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans && loans.length > 0 ? (
                  loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.loan_number}</TableCell>
                      <TableCell>
                        {loan.customer
                          ? `${loan.customer.first_name} ${loan.customer.last_name}`
                          : '-'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(Number(loan.principal_amount))}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(Number(loan.outstanding_total))}
                      </TableCell>
                      <TableCell>{loan.tenure_months} months</TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>
                        {loan.maturity_date ? formatDate(loan.maturity_date) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No loans found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LoanApplicationForm open={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={handleSuccess} />
    </div>
  )
}
