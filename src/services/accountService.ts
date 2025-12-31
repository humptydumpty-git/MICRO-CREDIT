import { supabase } from '@/lib/supabase'
import type { Account, AccountWithCustomer, AccountType } from '@/types'

export const accountService = {
  async getAll(filters?: { account_type?: AccountType; status?: string; customer_id?: string }) {
    const query = supabase
      .from('accounts')
      .select('*, customer:customers(*)')
      .order('created_at', { ascending: false })

    if (filters?.account_type) {
      query.eq('account_type', filters.account_type)
    }
    if (filters?.status) {
      query.eq('status', filters.status)
    }
    if (filters?.customer_id) {
      query.eq('customer_id', filters.customer_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data as AccountWithCustomer[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, customer:customers(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as AccountWithCustomer
  },

  async getByAccountNumber(accountNumber: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, customer:customers(*)')
      .eq('account_number', accountNumber)
      .single()

    if (error) throw error
    return data as AccountWithCustomer
  },

  async getByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Account[]
  },

  async create(account: Omit<Account, 'id' | 'account_number' | 'balance' | 'available_balance' | 'ledger_balance' | 'created_at' | 'updated_at'>) {
    // Generate account number via database function
    const { data: accountNumber, error: numError } = await supabase
      .rpc('generate_account_number', {
        p_tenant_id: account.tenant_id,
        p_account_type: account.account_type,
      })

    if (numError) throw numError

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        ...account,
        account_number: accountNumber,
        balance: 0,
        available_balance: 0,
        ledger_balance: 0,
      })
      .select()
      .single()

    if (error) throw error
    return data as Account
  },

  async update(id: string, updates: Partial<Account>) {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Account
  },

  async updateBalance(id: string, amount: number, type: 'credit' | 'debit') {
    const account = await this.getById(id)
    
    const newBalance = type === 'credit'
      ? Number(account.balance) + amount
      : Number(account.balance) - amount

    return this.update(id, {
      balance: newBalance,
      available_balance: newBalance,
      ledger_balance: newBalance,
    })
  },

  async freeze(id: string) {
    return this.update(id, { status: 'frozen' })
  },

  async unfreeze(id: string) {
    return this.update(id, { status: 'active' })
  },

  async close(id: string) {
    return this.update(id, {
      status: 'closed',
      closed_date: new Date().toISOString().split('T')[0],
    })
  },
}

