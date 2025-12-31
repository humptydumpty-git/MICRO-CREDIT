import { supabase } from '@/lib/supabase'
import { customerService } from './customerService'
import { accountService } from './accountService'
import { loanService } from './loanService'
import { transactionService } from './transactionService'

export const analyticsService = {
  async getDashboardStats(tenantId: string) {
    const [customers, accounts, loans, transactions] = await Promise.all([
      customerService.getAll(),
      accountService.getAll(),
      loanService.getAll(),
      transactionService.getAll(),
    ])

    const totalCustomers = customers?.length || 0
    const totalAccounts = accounts?.length || 0
    const activeLoans = loans?.filter((l) => l.status === 'active' || l.status === 'disbursed').length || 0
    const overdueLoans = loans?.filter((l) => l.status === 'overdue').length || 0
    const totalLoanPortfolio = loans?.reduce((sum, l) => sum + Number(l.outstanding_total), 0) || 0
    const totalSavings = accounts
      ?.filter((a) => a.account_type === 'savings')
      .reduce((sum, a) => sum + Number(a.balance), 0) || 0

    const recentTransactions = transactions?.slice(0, 10) || []

    return {
      totalCustomers,
      totalAccounts,
      activeLoans,
      overdueLoans,
      totalLoanPortfolio,
      totalSavings,
      recentTransactions,
    }
  },

  async getMonthlyTrends() {
    const transactions = await transactionService.getAll()
    const months: Record<string, { deposits: number; withdrawals: number }> = {}

    transactions?.forEach((txn) => {
      const date = new Date(txn.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!months[monthKey]) {
        months[monthKey] = { deposits: 0, withdrawals: 0 }
      }

      if (txn.transaction_type.includes('deposit') || txn.transaction_type.includes('credit')) {
        months[monthKey].deposits += Number(txn.amount)
      } else {
        months[monthKey].withdrawals += Number(txn.amount)
      }
    })

    return Object.entries(months).map(([month, data]) => ({
      month,
      deposits: data.deposits,
      withdrawals: data.withdrawals,
    }))
  },

  async getCustomerGrowth() {
    const customers = await customerService.getAll()
    const months: Record<string, number> = {}

    customers?.forEach((customer) => {
      const date = new Date(customer.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      months[monthKey] = (months[monthKey] || 0) + 1
    })

    return Object.entries(months).map(([month, count]) => ({
      month,
      count,
    }))
  },
}

