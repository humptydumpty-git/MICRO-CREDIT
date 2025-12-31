export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          code: string
          subdomain: string | null
          email: string | null
          phone: string | null
          address: string | null
          country: string | null
          currency_code: string
          timezone: string
          logo_url: string | null
          status: 'active' | 'inactive' | 'suspended'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          phone: string | null
          first_name: string | null
          last_name: string | null
          role: 'admin' | 'officer' | 'customer' | 'manager'
          employee_id: string | null
          department: string | null
          is_active: boolean
          last_login_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      customers: {
        Row: {
          id: string
          tenant_id: string
          customer_number: string
          user_id: string | null
          first_name: string
          last_name: string
          middle_name: string | null
          email: string | null
          phone: string
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          nationality: string | null
          country: string | null
          state: string | null
          city: string | null
          address: string | null
          postal_code: string | null
          occupation: string | null
          employer_name: string | null
          employer_address: string | null
          monthly_income: number | null
          kyc_status: 'pending' | 'in_review' | 'verified' | 'rejected'
          kyc_verified_at: string | null
          kyc_verified_by: string | null
          id_type: string | null
          id_number: string | null
          id_issue_date: string | null
          id_expiry_date: string | null
          id_front_url: string | null
          id_back_url: string | null
          photo_url: string | null
          credit_score: number
          credit_limit: number
          tier: 'bronze' | 'silver' | 'gold' | 'platinum'
          bank_name: string | null
          bank_account_number: string | null
          bank_account_name: string | null
          status: 'active' | 'inactive' | 'suspended' | 'closed'
          status_reason: string | null
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'customer_number' | 'created_at' | 'updated_at' | 'credit_score' | 'credit_limit' | 'tier' | 'status' | 'kyc_status'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      accounts: {
        Row: {
          id: string
          tenant_id: string
          customer_id: string
          account_number: string
          account_type: 'savings' | 'current' | 'loan' | 'fixed_deposit'
          account_name: string | null
          product_id: string | null
          balance: number
          available_balance: number
          ledger_balance: number
          currency_code: string
          interest_rate: number
          interest_balance: number
          last_interest_calculated_at: string | null
          status: 'active' | 'dormant' | 'frozen' | 'closed'
          opened_date: string
          closed_date: string | null
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['accounts']['Row'], 'id' | 'account_number' | 'balance' | 'available_balance' | 'ledger_balance' | 'interest_rate' | 'interest_balance' | 'status' | 'opened_date' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['accounts']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          tenant_id: string
          transaction_ref: string
          account_id: string
          customer_id: string
          transaction_type: 'deposit' | 'withdrawal' | 'transfer_out' | 'transfer_in' | 'loan_disbursement' | 'loan_repayment' | 'loan_interest' | 'fee_charge' | 'fee_reversal' | 'interest_credit' | 'reversal' | 'adjustment'
          amount: number
          balance_before: number | null
          balance_after: number | null
          currency_code: string
          related_transaction_id: string | null
          related_account_id: string | null
          description: string | null
          narration: string | null
          channel: 'web' | 'mobile' | 'atm' | 'pos' | 'branch' | 'api' | 'ussd' | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed'
          status_reason: string | null
          metadata: Json
          created_at: string
          updated_at: string
          processed_at: string | null
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'transaction_ref' | 'status' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      loans: {
        Row: {
          id: string
          tenant_id: string
          loan_number: string
          customer_id: string
          account_id: string
          product_id: string
          principal_amount: number
          disbursed_amount: number
          interest_rate: number
          interest_type: 'flat' | 'reducing' | 'fixed'
          tenure_months: number
          tenure_days: number | null
          total_interest: number
          total_amount: number
          processing_fee: number
          principal_paid: number
          interest_paid: number
          fees_paid: number
          total_paid: number
          outstanding_principal: number
          outstanding_interest: number
          outstanding_total: number
          overdue_amount: number
          days_overdue: number
          application_date: string
          approval_date: string | null
          disbursement_date: string | null
          first_payment_date: string | null
          last_payment_date: string | null
          maturity_date: string | null
          closed_date: string | null
          status: 'pending' | 'under_review' | 'approved' | 'disbursed' | 'active' | 'overdue' | 'defaulted' | 'closed' | 'written_off' | 'rejected'
          status_reason: string | null
          approved_by: string | null
          approved_at: string | null
          disbursed_by: string | null
          purpose: string | null
          collateral_details: Json
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['loans']['Row'], 'id' | 'loan_number' | 'disbursed_amount' | 'total_interest' | 'total_amount' | 'principal_paid' | 'interest_paid' | 'fees_paid' | 'total_paid' | 'outstanding_principal' | 'outstanding_interest' | 'outstanding_total' | 'overdue_amount' | 'days_overdue' | 'application_date' | 'status' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['loans']['Insert']>
      }
      loan_products: {
        Row: {
          id: string
          tenant_id: string
          name: string
          code: string
          description: string | null
          min_amount: number
          max_amount: number
          min_tenure_months: number
          max_tenure_months: number
          interest_rate: number
          interest_type: 'flat' | 'reducing' | 'fixed'
          interest_calculation_method: string
          processing_fee_percentage: number
          processing_fee_fixed: number
          late_fee_percentage: number
          late_fee_fixed: number
          early_repayment_fee: number
          min_credit_score: number
          min_monthly_income: number | null
          eligibility_criteria: Json
          status: 'active' | 'inactive' | 'archived'
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['loan_products']['Row'], 'id' | 'status' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['loan_products']['Insert']>
      }
      loan_repayment_schedules: {
        Row: {
          id: string
          tenant_id: string
          loan_id: string
          installment_number: number
          principal_due: number
          interest_due: number
          total_due: number
          principal_paid: number
          interest_paid: number
          total_paid: number
          outstanding_balance: number
          due_date: string
          paid_date: string | null
          status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived'
          days_overdue: number
          late_fee: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['loan_repayment_schedules']['Row'], 'id' | 'principal_paid' | 'interest_paid' | 'total_paid' | 'status' | 'days_overdue' | 'late_fee' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['loan_repayment_schedules']['Insert']>
      }
      savings_products: {
        Row: {
          id: string
          tenant_id: string
          name: string
          code: string
          description: string | null
          min_balance: number
          max_balance: number | null
          min_opening_balance: number
          interest_rate: number
          interest_calculation_method: string
          interest_payment_frequency: 'daily' | 'monthly' | 'quarterly' | 'annually' | 'at_maturity'
          maintenance_fee: number
          maintenance_fee_frequency: string
          withdrawal_fee: number
          minimum_withdrawal: number
          maximum_withdrawal_per_day: number | null
          maximum_withdrawals_per_month: number | null
          withdrawal_allowed: boolean
          withdrawal_notice_days: number
          status: 'active' | 'inactive' | 'archived'
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['savings_products']['Row'], 'id' | 'status' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['savings_products']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          customer_id: string | null
          type: 'transaction' | 'loan_disbursement' | 'loan_repayment_due' | 'loan_overdue' | 'account_balance' | 'kyc_approved' | 'kyc_rejected' | 'password_reset' | 'account_opened' | 'payment_received' | 'payment_failed' | 'statement_ready'
          channel: 'email' | 'sms' | 'push' | 'in_app'
          subject: string | null
          message: string
          status: 'pending' | 'sent' | 'delivered' | 'failed'
          sent_at: string | null
          delivered_at: string | null
          read_at: string | null
          error_message: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'status' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          request_method: string | null
          request_path: string | null
          status: 'success' | 'failure' | 'error'
          error_message: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

