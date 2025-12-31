import { Database } from '@/lib/database.types'

export type Tenant = Database['public']['Tables']['tenants']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Account = Database['public']['Tables']['accounts']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Loan = Database['public']['Tables']['loans']['Row']
export type LoanProduct = Database['public']['Tables']['loan_products']['Row']
export type LoanRepaymentSchedule = Database['public']['Tables']['loan_repayment_schedules']['Row']
export type SavingsProduct = Database['public']['Tables']['savings_products']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

export type UserRole = 'admin' | 'officer' | 'customer' | 'manager'
export type AccountType = 'savings' | 'current' | 'loan' | 'fixed_deposit'
export type TransactionType = Transaction['transaction_type']
export type LoanStatus = Loan['status']
export type AccountStatus = Account['status']
export type CustomerStatus = Customer['status']
export type KYCStatus = Customer['kyc_status']

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  tenant_id: string
  first_name: string | null
  last_name: string | null
}

export interface CustomerWithAccounts extends Customer {
  accounts?: Account[]
}

export interface AccountWithCustomer extends Account {
  customer?: Customer
}

export interface TransactionWithAccount extends Transaction {
  account?: Account
  customer?: Customer
}

export interface LoanWithDetails extends Loan {
  customer?: Customer
  product?: LoanProduct
  account?: Account
  schedules?: LoanRepaymentSchedule[]
}

export interface DashboardStats {
  totalCustomers: number
  totalAccounts: number
  totalLoans: number
  totalSavings: number
  totalLoanPortfolio: number
  activeLoans: number
  overdueLoans: number
  pendingKYC: number
  recentTransactions: Transaction[]
}

export interface LoanCalculation {
  principal: number
  interestRate: number
  tenureMonths: number
  interestType: 'flat' | 'reducing' | 'fixed'
  totalInterest: number
  totalAmount: number
  monthlyPayment: number
  schedule: Array<{
    month: number
    principal: number
    interest: number
    total: number
    balance: number
  }>
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
}

