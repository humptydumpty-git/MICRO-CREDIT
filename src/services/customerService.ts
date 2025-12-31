import { supabase } from '@/lib/supabase'
import type { Customer, CustomerWithAccounts } from '@/types'

export const customerService = {
  async getAll(filters?: { status?: string; kyc_status?: string }) {
    const query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query.eq('status', filters.status)
    }
    if (filters?.kyc_status) {
      query.eq('kyc_status', filters.kyc_status)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Customer[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*, accounts(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as CustomerWithAccounts
  },

  async getByCustomerNumber(customerNumber: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*, accounts(*)')
      .eq('customer_number', customerNumber)
      .single()

    if (error) throw error
    return data as CustomerWithAccounts
  },

  async create(customer: Omit<Customer, 'id' | 'customer_number' | 'created_at' | 'updated_at'>) {
    // Generate customer number via database function
    const { data: customerNumber, error: numError } = await supabase
      .rpc('generate_customer_number', { p_tenant_id: customer.tenant_id })

    if (numError) throw numError

    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customer,
        customer_number: customerNumber,
      })
      .select()
      .single()

    if (error) throw error
    return data as Customer
  },

  async update(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Customer
  },

  async updateKYCStatus(id: string, status: Customer['kyc_status'], verifiedBy?: string) {
    const updates: any = { kyc_status: status }
    if (status === 'verified') {
      updates.kyc_verified_at = new Date().toISOString()
      updates.kyc_verified_by = verifiedBy
    }

    return this.update(id, updates)
  },

  async updateCreditScore(id: string, creditScore: number) {
    let tier: Customer['tier'] = 'bronze'
    if (creditScore >= 750) tier = 'platinum'
    else if (creditScore >= 700) tier = 'gold'
    else if (creditScore >= 650) tier = 'silver'

    return this.update(id, { credit_score: creditScore, tier })
  },
}

