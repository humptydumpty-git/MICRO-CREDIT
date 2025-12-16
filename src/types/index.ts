// Multi-Tenant Micro Credit Banking System Types

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  logo_url?: string;
  primary_color: string;
  status: 'active' | 'suspended' | 'inactive';
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff' | 'agent';
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  date_of_birth?: string;
  gender?: string;
  national_id?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  occupation?: string;
  employer?: string;
  monthly_income?: number;
  kyc_status: 'pending' | 'verified' | 'rejected' | 'expired';
  kyc_documents: any[];
  credit_score: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  profile_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  tenant_id: string;
  customer_id: string;
  account_number: string;
  account_type: 'savings' | 'current' | 'loan' | 'fixed_deposit';
  balance: number;
  available_balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  interest_rate: number;
  last_interest_date?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface LoanProduct {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  description?: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  interest_type: 'flat' | 'reducing' | 'compound';
  min_tenure_months: number;
  max_tenure_months: number;
  processing_fee: number;
  late_fee: number;
  requires_collateral: boolean;
  requires_guarantor: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  tenant_id: string;
  customer_id: string;
  account_id?: string;
  loan_product_id?: string;
  loan_number: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  disbursed_amount?: number;
  outstanding_balance: number;
  total_interest: number;
  total_paid: number;
  status: 'applied' | 'pending' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'closed' | 'defaulted';
  purpose?: string;
  disbursement_date?: string;
  maturity_date?: string;
  next_payment_date?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  loan_product?: LoanProduct;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  account_id: string;
  loan_id?: string;
  transaction_type: 'credit' | 'debit' | 'deposit' | 'withdrawal' | 'transfer' | 'loan_disbursement' | 'loan_repayment' | 'interest' | 'fee';
  amount: number;
  balance_before: number;
  balance_after: number;
  description?: string;
  reference_number: string;
  channel: 'web' | 'mobile' | 'ussd' | 'agent' | 'bank';
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  metadata: Record<string, any>;
  created_at: string;
  account?: Account;
}

export interface LoanRepayment {
  id: string;
  tenant_id: string;
  loan_id: string;
  transaction_id?: string;
  amount: number;
  principal_paid: number;
  interest_paid: number;
  penalty_paid: number;
  payment_date: string;
  due_date?: string;
  status: 'paid' | 'partial' | 'overdue';
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  tenant_id: string;
  customer_id: string;
  account_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  auto_debit_amount?: number;
  auto_debit_frequency?: 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  tenant_id: string;
  customer_id?: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  channel: 'in_app' | 'email' | 'sms' | 'push';
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeLoans: number;
  totalDisbursed: number;
  totalCollected: number;
  pendingApplications: number;
  overdueLoans: number;
  savingsBalance: number;
  monthlyGrowth: number;
}

export interface EMISchedule {
  installment: number;
  dueDate: string;
  emiAmount: number;
  principal: number;
  interest: number;
  balance: number;
  status: 'pending' | 'paid' | 'overdue';
}
