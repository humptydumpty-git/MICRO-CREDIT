import { supabase } from '@/lib/supabase'
import type { Transaction, TransactionWithAccount } from '@/types'
import { accountService } from './accountService'

export const transactionService = {
  async getAll(filters?: {
    account_id?: string
    customer_id?: string
    transaction_type?: Transaction['transaction_type']
    status?: string
    start_date?: string
    end_date?: string
  }) {
    const query = supabase
      .from('transactions')
      .select('*, account:accounts(*), customer:customers(*)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (filters?.account_id) {
      query.eq('account_id', filters.account_id)
    }
    if (filters?.customer_id) {
      query.eq('customer_id', filters.customer_id)
    }
    if (filters?.transaction_type) {
      query.eq('transaction_type', filters.transaction_type)
    }
    if (filters?.status) {
      query.eq('status', filters.status)
    }
    if (filters?.start_date) {
      query.gte('created_at', filters.start_date)
    }
    if (filters?.end_date) {
      query.lte('created_at', filters.end_date)
    }

    const { data, error } = await query
    if (error) throw error
    return data as TransactionWithAccount[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, account:accounts(*), customer:customers(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as TransactionWithAccount
  },

  async getByTransactionRef(ref: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, account:accounts(*), customer:customers(*)')
      .eq('transaction_ref', ref)
      .single()

    if (error) throw error
    return data as TransactionWithAccount
  },

  async create(transaction: Omit<Transaction, 'id' | 'transaction_ref' | 'status' | 'created_at' | 'updated_at'>) {
    // Generate transaction reference
    const { data: txnRef, error: refError } = await supabase
      .rpc('generate_transaction_ref', { p_tenant_id: transaction.tenant_id })

    if (refError) throw refError

    // Get current account balance
    const account = await accountService.getById(transaction.account_id)
    const balanceBefore = Number(account.balance)
    
    // Calculate balance after
    let balanceAfter = balanceBefore
    if (['deposit', 'transfer_in', 'loan_disbursement', 'interest_credit'].includes(transaction.transaction_type)) {
      balanceAfter = balanceBefore + Number(transaction.amount)
    } else if (['withdrawal', 'transfer_out', 'loan_repayment', 'fee_charge'].includes(transaction.transaction_type)) {
      balanceAfter = balanceBefore - Number(transaction.amount)
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        transaction_ref: txnRef,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Update account balance
    await accountService.update(transaction.account_id, {
      balance: balanceAfter,
      available_balance: balanceAfter,
      ledger_balance: balanceAfter,
    })

    // Update transaction status to completed
    const { data: updated, error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .select()
      .single()

    if (updateError) throw updateError

    return updated as Transaction
  },

  async deposit(accountId: string, amount: number, narration?: string, createdBy?: string) {
    const account = await accountService.getById(accountId)
    
    return this.create({
      tenant_id: account.tenant_id,
      account_id: accountId,
      customer_id: account.customer_id,
      transaction_type: 'deposit',
      amount,
      narration: narration || 'Deposit',
      channel: 'web',
      currency_code: account.currency_code,
      created_by: createdBy,
    })
  },

  async withdraw(accountId: string, amount: number, narration?: string, createdBy?: string) {
    const account = await accountService.getById(accountId)
    
    if (Number(account.available_balance) < amount) {
      throw new Error('Insufficient balance')
    }

    return this.create({
      tenant_id: account.tenant_id,
      account_id: accountId,
      customer_id: account.customer_id,
      transaction_type: 'withdrawal',
      amount,
      narration: narration || 'Withdrawal',
      channel: 'web',
      currency_code: account.currency_code,
      created_by: createdBy,
    })
  },

  async transfer(fromAccountId: string, toAccountId: string, amount: number, narration?: string, createdBy?: string) {
    const fromAccount = await accountService.getById(fromAccountId)
    
    if (Number(fromAccount.available_balance) < amount) {
      throw new Error('Insufficient balance')
    }

    // Create debit transaction
    const debitTxn = await this.create({
      tenant_id: fromAccount.tenant_id,
      account_id: fromAccountId,
      customer_id: fromAccount.customer_id,
      transaction_type: 'transfer_out',
      amount,
      narration: narration || `Transfer to ${toAccountId}`,
      channel: 'web',
      currency_code: fromAccount.currency_code,
      related_account_id: toAccountId,
      created_by: createdBy,
    })

    // Get to account
    const toAccount = await accountService.getById(toAccountId)

    // Create credit transaction
    const creditTxn = await this.create({
      tenant_id: toAccount.tenant_id,
      account_id: toAccountId,
      customer_id: toAccount.customer_id,
      transaction_type: 'transfer_in',
      amount,
      narration: narration || `Transfer from ${fromAccount.account_number}`,
      channel: 'web',
      currency_code: toAccount.currency_code,
      related_account_id: fromAccountId,
      related_transaction_id: debitTxn.id,
      created_by: createdBy,
    })

    // Update debit transaction with related transaction
    await supabase
      .from('transactions')
      .update({ related_transaction_id: creditTxn.id })
      .eq('id', debitTxn.id)

    return { debit: debitTxn, credit: creditTxn }
  },

  async reverse(transactionId: string, reason?: string) {
    const transaction = await this.getById(transactionId)
    
    if (transaction.status === 'reversed') {
      throw new Error('Transaction already reversed')
    }

    // Create reversal transaction
    const reversalAmount = Number(transaction.amount)
    const reversalType = ['deposit', 'transfer_in'].includes(transaction.transaction_type)
      ? 'withdrawal'
      : 'deposit'

    return this.create({
      tenant_id: transaction.tenant_id,
      account_id: transaction.account_id,
      customer_id: transaction.customer_id,
      transaction_type: 'reversal',
      amount: reversalAmount,
      narration: reason || `Reversal of ${transaction.transaction_ref}`,
      channel: 'web',
      currency_code: transaction.currency_code,
      related_transaction_id: transactionId,
      created_by: transaction.created_by,
    })
  },
}

