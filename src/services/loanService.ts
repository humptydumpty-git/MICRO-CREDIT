import { supabase } from '@/lib/supabase'
import type { Loan, LoanProduct, LoanWithDetails, LoanRepaymentSchedule } from '@/types'
import { accountService } from './accountService'
import { transactionService } from './transactionService'

export const loanService = {
  async getAllProducts(filters?: { status?: string }) {
    const query = supabase
      .from('loan_products')
      .select('*')
      .order('name', { ascending: true })

    if (filters?.status) {
      query.eq('status', filters.status)
    }

    const { data, error } = await query
    if (error) throw error
    return data as LoanProduct[]
  },

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('loan_products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as LoanProduct
  },

  async getAll(filters?: { customer_id?: string; status?: string }) {
    const query = supabase
      .from('loans')
      .select('*, customer:customers(*), product:loan_products(*), account:accounts(*)')
      .order('created_at', { ascending: false })

    if (filters?.customer_id) {
      query.eq('customer_id', filters.customer_id)
    }
    if (filters?.status) {
      query.eq('status', filters.status)
    }

    const { data, error } = await query
    if (error) throw error
    return data as LoanWithDetails[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('loans')
      .select('*, customer:customers(*), product:loan_products(*), account:accounts(*), schedules:loan_repayment_schedules(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as LoanWithDetails
  },

  async createApplication(loan: Omit<Loan, 'id' | 'loan_number' | 'status' | 'created_at' | 'updated_at'>) {
    // Generate loan number
    const { data: loanNumber, error: numError } = await supabase
      .rpc('generate_loan_number', { p_tenant_id: loan.tenant_id })
      .single()

    if (numError) {
      // Fallback if function doesn't exist
      const timestamp = Date.now().toString().slice(-8)
      const loanNumber = `LOAN${timestamp}`
    }

    // Get product details
    const product = await this.getProductById(loan.product_id)

    // Calculate total interest and amount
    const totalInterest = this.calculateInterest(
      loan.principal_amount,
      product.interest_rate,
      loan.tenure_months,
      product.interest_type
    )
    const totalAmount = loan.principal_amount + totalInterest
    const processingFee = (loan.principal_amount * product.processing_fee_percentage) / 100 + product.processing_fee_fixed

    // Calculate maturity date
    const applicationDate = new Date(loan.application_date || new Date())
    const maturityDate = new Date(applicationDate)
    maturityDate.setMonth(maturityDate.getMonth() + loan.tenure_months)

    const { data, error } = await supabase
      .from('loans')
      .insert({
        ...loan,
        loan_number: loanNumber || `LOAN${Date.now()}`,
        total_interest: totalInterest,
        total_amount: totalAmount,
        processing_fee: processingFee,
        outstanding_principal: loan.principal_amount,
        outstanding_interest: totalInterest,
        outstanding_total: totalAmount,
        maturity_date: maturityDate.toISOString().split('T')[0],
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Generate repayment schedule
    await this.generateRepaymentSchedule(data.id, data)

    return data as Loan
  },

  async approve(loanId: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('loans')
      .update({
        status: 'approved',
        approval_date: new Date().toISOString().split('T')[0],
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', loanId)
      .select()
      .single()

    if (error) throw error
    return data as Loan
  },

  async disburse(loanId: string, disbursedBy: string) {
    const loan = await this.getById(loanId)
    
    if (loan.status !== 'approved') {
      throw new Error('Loan must be approved before disbursement')
    }

    // Create loan account if it doesn't exist
    let loanAccount = loan.account
    if (!loanAccount) {
      loanAccount = await accountService.create({
        tenant_id: loan.tenant_id,
        customer_id: loan.customer_id,
        account_type: 'loan',
        product_id: loan.product_id,
        account_name: `Loan Account - ${loan.loan_number}`,
        currency_code: 'NGN',
      })
    }

    // Create disbursement transaction
    await transactionService.create({
      tenant_id: loan.tenant_id,
      account_id: loanAccount.id,
      customer_id: loan.customer_id,
      transaction_type: 'loan_disbursement',
      amount: loan.principal_amount - loan.processing_fee,
      narration: `Loan Disbursement - ${loan.loan_number}`,
      channel: 'web',
      currency_code: 'NGN',
      created_by: disbursedBy,
    })

    // Update loan status
    const { data, error } = await supabase
      .from('loans')
      .update({
        status: 'disbursed',
        disbursement_date: new Date().toISOString().split('T')[0],
        disbursed_by: disbursedBy,
        disbursed_amount: loan.principal_amount - loan.processing_fee,
      })
      .eq('id', loanId)
      .select()
      .single()

    if (error) throw error
    return data as Loan
  },

  async makeRepayment(loanId: string, amount: number, accountId: string, createdBy?: string) {
    const loan = await this.getById(loanId)
    const schedules = await this.getRepaymentSchedules(loanId)

    // Find next due schedule
    const nextDue = schedules.find(s => s.status === 'pending' || s.status === 'overdue')
    if (!nextDue) {
      throw new Error('No pending repayment found')
    }

    // Process payment
    await transactionService.transfer(
      accountId,
      loan.account_id,
      amount,
      `Loan Repayment - ${loan.loan_number} - Installment #${nextDue.installment_number}`,
      createdBy
    )

    // Update schedule
    const updatedPaid = Number(nextDue.total_paid) + amount
    const newStatus = updatedPaid >= nextDue.total_due ? 'paid' : 'partial'

    await supabase
      .from('loan_repayment_schedules')
      .update({
        total_paid: updatedPaid,
        principal_paid: Number(nextDue.principal_paid) + (amount * Number(nextDue.principal_due) / Number(nextDue.total_due)),
        interest_paid: Number(nextDue.interest_paid) + (amount * Number(nextDue.interest_due) / Number(nextDue.total_due)),
        paid_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null,
        status: newStatus,
      })
      .eq('id', nextDue.id)

    // Update loan totals
    const principalPaid = Number(loan.principal_paid) + (amount * Number(nextDue.principal_due) / Number(nextDue.total_due))
    const interestPaid = Number(loan.interest_paid) + (amount * Number(nextDue.interest_due) / Number(nextDue.total_due))
    const totalPaid = Number(loan.total_paid) + amount

    await supabase
      .from('loans')
      .update({
        principal_paid: principalPaid,
        interest_paid: interestPaid,
        total_paid: totalPaid,
        outstanding_principal: loan.principal_amount - principalPaid,
        outstanding_interest: loan.total_interest - interestPaid,
        outstanding_total: loan.total_amount - totalPaid,
        last_payment_date: new Date().toISOString().split('T')[0],
        status: totalPaid >= loan.total_amount ? 'closed' : 'active',
      })
      .eq('id', loanId)

    return this.getById(loanId)
  },

  async getRepaymentSchedules(loanId: string) {
    const { data, error } = await supabase
      .from('loan_repayment_schedules')
      .select('*')
      .eq('loan_id', loanId)
      .order('installment_number', { ascending: true })

    if (error) throw error
    return data as LoanRepaymentSchedule[]
  },

  async generateRepaymentSchedule(loanId: string, loan: Loan) {
    const product = await this.getProductById(loan.product_id)
    const schedules: Omit<LoanRepaymentSchedule, 'id' | 'created_at' | 'updated_at'>[] = []

    const monthlyPayment = loan.total_amount / loan.tenure_months
    const monthlyInterest = loan.total_interest / loan.tenure_months
    const monthlyPrincipal = loan.principal_amount / loan.tenure_months

    let remainingBalance = loan.total_amount
    const startDate = new Date(loan.disbursement_date || loan.application_date || new Date())

    for (let i = 1; i <= loan.tenure_months; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + i)

      schedules.push({
        tenant_id: loan.tenant_id,
        loan_id: loanId,
        installment_number: i,
        principal_due: monthlyPrincipal,
        interest_due: monthlyInterest,
        total_due: monthlyPayment,
        principal_paid: 0,
        interest_paid: 0,
        total_paid: 0,
        outstanding_balance: remainingBalance - monthlyPayment,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending',
        days_overdue: 0,
        late_fee: 0,
        metadata: {},
      })

      remainingBalance -= monthlyPayment
    }

    const { error } = await supabase
      .from('loan_repayment_schedules')
      .insert(schedules)

    if (error) throw error
  },

  calculateInterest(principal: number, rate: number, months: number, type: 'flat' | 'reducing' | 'fixed'): number {
    if (type === 'flat') {
      return (principal * rate * months) / 100
    } else if (type === 'reducing') {
      const monthlyRate = rate / 100 / 12
      const total = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      return total * months - principal
    } else {
      return (principal * rate * months) / 100
    }
  },
}

