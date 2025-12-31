import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Download, FileText } from 'lucide-react'
import { customerService } from '@/services/customerService'
import { accountService } from '@/services/accountService'
import { loanService } from '@/services/loanService'
import { transactionService } from '@/services/transactionService'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('customers')
  const [dateRange, setDateRange] = useState('30')

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  })

  const { data: loans } = useQuery({
    queryKey: ['loans'],
    queryFn: () => loanService.getAll(),
  })

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(),
  })

  const generateReport = () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(dateRange))

    let reportData: any[] = []
    let headers: string[] = []

    switch (reportType) {
      case 'customers':
        headers = ['Customer Number', 'Name', 'Email', 'Phone', 'Status', 'Credit Score', 'Created Date']
        reportData = customers?.map((c) => [
          c.customer_number,
          `${c.first_name} ${c.last_name}`,
          c.email || '-',
          c.phone,
          c.status,
          c.credit_score,
          formatDate(c.created_at),
        ]) || []
        break

      case 'accounts':
        headers = ['Account Number', 'Customer', 'Type', 'Balance', 'Status', 'Created Date']
        reportData =
          accounts?.map((a) => [
            a.account_number,
            a.customer ? `${a.customer.first_name} ${a.customer.last_name}` : '-',
            a.account_type,
            formatCurrency(Number(a.balance)),
            a.status,
            formatDate(a.created_at),
          ]) || []
        break

      case 'loans':
        headers = [
          'Loan Number',
          'Customer',
          'Principal',
          'Outstanding',
          'Status',
          'Tenure',
          'Maturity Date',
        ]
        reportData =
          loans?.map((l) => [
            l.loan_number,
            l.customer ? `${l.customer.first_name} ${l.customer.last_name}` : '-',
            formatCurrency(Number(l.principal_amount)),
            formatCurrency(Number(l.outstanding_total)),
            l.status,
            `${l.tenure_months} months`,
            l.maturity_date ? formatDate(l.maturity_date) : '-',
          ]) || []
        break

      case 'transactions':
        headers = [
          'Reference',
          'Type',
          'Account',
          'Amount',
          'Balance After',
          'Status',
          'Date',
        ]
        reportData =
          transactions
            ?.filter((t) => {
              const txnDate = new Date(t.created_at)
              return txnDate >= startDate && txnDate <= endDate
            })
            .map((t) => [
              t.transaction_ref,
              t.transaction_type,
              t.account?.account_number || '-',
              formatCurrency(Number(t.amount)),
              formatCurrency(Number(t.balance_after || 0)),
              t.status,
              formatDate(t.created_at),
            ]) || []
        break
    }

    // Convert to CSV
    const csvContent = [headers.join(','), ...reportData.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Statements</h1>
        <p className="text-gray-500 mt-1">Generate and download reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: 'customers', label: 'Customer Report' },
                { value: 'accounts', label: 'Account Report' },
                { value: 'loans', label: 'Loan Report' },
                { value: 'transactions', label: 'Transaction Report' },
              ]}
            />
          </div>

          {reportType === 'transactions' && (
            <div>
              <label className="block text-sm font-medium mb-2">Date Range (Days)</label>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={[
                  { value: '7', label: 'Last 7 days' },
                  { value: '30', label: 'Last 30 days' },
                  { value: '90', label: 'Last 90 days' },
                  { value: '365', label: 'Last year' },
                ]}
              />
            </div>
          )}

          <Button onClick={generateReport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Report (CSV)
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{customers?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{accounts?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loans?.filter((l) => l.status === 'active' || l.status === 'disbursed').length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{transactions?.length || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

