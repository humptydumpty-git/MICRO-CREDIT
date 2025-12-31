import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { customerService } from '@/services/customerService'
import { accountService } from '@/services/accountService'
import { transactionService } from '@/services/transactionService'
import { loanService } from '@/services/loanService'
import { Users, Wallet, Receipt, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  })

  const { data: transactions } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionService.getAll({ start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }),
  })

  const { data: loans } = useQuery({
    queryKey: ['loans'],
    queryFn: () => loanService.getAll(),
  })

  const stats = [
    {
      name: 'Total Customers',
      value: customers?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Accounts',
      value: accounts?.length || 0,
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Active Loans',
      value: loans?.filter(l => l.status === 'active' || l.status === 'disbursed').length || 0,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Recent Transactions',
      value: transactions?.length || 0,
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.first_name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions?.slice(0, 5).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{txn.transaction_type}</p>
                    <p className="text-sm text-gray-500">{txn.narration}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${txn.transaction_type.includes('deposit') || txn.transaction_type.includes('credit') ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.transaction_type.includes('deposit') || txn.transaction_type.includes('credit') ? '+' : '-'}
                      {formatCurrency(Number(txn.amount))}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(txn.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <p className="text-center text-gray-500 py-4">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loans?.filter(l => l.status === 'active' || l.status === 'disbursed').slice(0, 5).map((loan) => (
                <div key={loan.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{loan.loan_number}</p>
                    <p className="text-sm text-gray-500">Outstanding: {formatCurrency(Number(loan.outstanding_total))}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(Number(loan.principal_amount))}</p>
                    <p className="text-xs text-gray-400 capitalize">{loan.status}</p>
                  </div>
                </div>
              ))}
              {(!loans || loans.filter(l => l.status === 'active' || l.status === 'disbursed').length === 0) && (
                <p className="text-center text-gray-500 py-4">No active loans</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

