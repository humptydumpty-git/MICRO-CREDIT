import { supabase } from '@/lib/supabase';
import type { 
  Customer, 
  Loan, 
  Account, 
  Transaction, 
  LoanProduct, 
  Notification,
  DashboardStats,
  User
} from '@/types';

// ============================================
// AUTHENTICATION API
// ============================================
export const authApi = {
  async signUp(email: string, password: string, userData: {
    first_name: string;
    last_name: string;
    phone?: string;
    tenant_id?: string;
  }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Create user profile in users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        tenant_id: userData.tenant_id || '00000000-0000-0000-0000-000000000001', // Default tenant
        email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        role: 'staff', // Default role
      })
      .select()
      .single();

    if (userError) throw userError;
    return { user: authData.user, profile: user };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    // Update last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);

    return { user: data.user, session: data.session, profile };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile as User | null;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  },
};

// ============================================
// CUSTOMERS API
// ============================================
export const customersApi = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Customer[];
  },

  async getById(id: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async create(customer: Partial<Customer>): Promise<Customer> {
    // Generate customer number if not provided
    if (!customer.customer_number) {
      const { data: count } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true });
      
      const year = new Date().getFullYear();
      const number = ((count?.length || 0) + 1).toString().padStart(4, '0');
      customer.customer_number = `CUS${year}${number}`;
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// ACCOUNTS API
// ============================================
export const accountsApi = {
  async getAll(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, customer:customers(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Account[];
  },

  async getById(id: string): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, customer:customers(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Account;
  },

  async getByCustomerId(customerId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Account[];
  },

  async create(account: Partial<Account>): Promise<Account> {
    // Generate account number if not provided
    if (!account.account_number) {
      const { data: count } = await supabase
        .from('accounts')
        .select('id', { count: 'exact', head: true });
      
      const number = ((count?.length || 0) + 1).toString().padStart(10, '0');
      account.account_number = `10${number}`;
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single();

    if (error) throw error;
    return data as Account;
  },

  async update(id: string, updates: Partial<Account>): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Account;
  },
};

// ============================================
// LOANS API
// ============================================
export const loansApi = {
  async getAll(): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*, customer:customers(*), loan_product:loan_products(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Loan[];
  },

  async getById(id: string): Promise<Loan> {
    const { data, error } = await supabase
      .from('loans')
      .select('*, customer:customers(*), loan_product:loan_products(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Loan;
  },

  async getByCustomerId(customerId: string): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*, loan_product:loan_products(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Loan[];
  },

  async create(loan: Partial<Loan>): Promise<Loan> {
    // Generate loan number if not provided
    if (!loan.loan_number) {
      const { data: count } = await supabase
        .from('loans')
        .select('id', { count: 'exact', head: true });
      
      const year = new Date().getFullYear();
      const number = ((count?.length || 0) + 1).toString().padStart(4, '0');
      loan.loan_number = `LN${year}${number}`;
    }

    const { data, error } = await supabase
      .from('loans')
      .insert(loan)
      .select('*, customer:customers(*), loan_product:loan_products(*)')
      .single();

    if (error) throw error;
    return data as Loan;
  },

  async update(id: string, updates: Partial<Loan>): Promise<Loan> {
    const { data, error } = await supabase
      .from('loans')
      .update(updates)
      .eq('id', id)
      .select('*, customer:customers(*), loan_product:loan_products(*)')
      .single();

    if (error) throw error;
    return data as Loan;
  },

  async approve(id: string, approvedBy: string): Promise<Loan> {
    return this.update(id, {
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    });
  },

  async disburse(id: string, disbursementDate: string): Promise<Loan> {
    const loan = await this.getById(id);
    
    return this.update(id, {
      status: 'disbursed',
      disbursement_date: disbursementDate,
    });
  },
};

// ============================================
// LOAN PRODUCTS API
// ============================================
export const loanProductsApi = {
  async getAll(): Promise<LoanProduct[]> {
    const { data, error } = await supabase
      .from('loan_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LoanProduct[];
  },

  async getById(id: string): Promise<LoanProduct> {
    const { data, error } = await supabase
      .from('loan_products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as LoanProduct;
  },

  async create(product: Partial<LoanProduct>): Promise<LoanProduct> {
    const { data, error } = await supabase
      .from('loan_products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data as LoanProduct;
  },

  async update(id: string, updates: Partial<LoanProduct>): Promise<LoanProduct> {
    const { data, error } = await supabase
      .from('loan_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as LoanProduct;
  },
};

// ============================================
// TRANSACTIONS API
// ============================================
export const transactionsApi = {
  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, account:accounts(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Transaction[];
  },

  async getById(id: string): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, account:accounts(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async getByAccountId(accountId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Transaction[];
  },

  async create(transaction: Partial<Transaction>): Promise<Transaction> {
    // Generate reference number if not provided
    if (!transaction.reference_number) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      transaction.reference_number = `TXN${timestamp}${random}`;
    }

    // Update account balance
    if (transaction.account_id && transaction.balance_after !== undefined) {
      await supabase
        .from('accounts')
        .update({
          balance: transaction.balance_after,
          available_balance: transaction.balance_after,
        })
        .eq('id', transaction.account_id);
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select('*, account:accounts(*)')
      .single();

    if (error) throw error;
    return data as Transaction;
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsApi = {
  async getAll(userId?: string): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Notification[];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async create(notification: Partial<Notification>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },
};

// ============================================
// DASHBOARD STATS API
// ============================================
export const dashboardApi = {
  async getStats(tenantId: string): Promise<DashboardStats> {
    // Get customers count
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    // Get active loans
    const { count: activeLoans } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('status', ['active', 'disbursed']);

    // Get total disbursed
    const { data: disbursedData } = await supabase
      .from('loans')
      .select('disbursed_amount')
      .eq('tenant_id', tenantId)
      .not('disbursed_amount', 'is', null);

    const totalDisbursed = disbursedData?.reduce((sum, loan) => sum + (loan.disbursed_amount || 0), 0) || 0;

    // Get total collected (from loan repayments)
    const { data: repaymentData } = await supabase
      .from('loan_repayments')
      .select('amount')
      .eq('tenant_id', tenantId);

    const totalCollected = repaymentData?.reduce((sum, r) => sum + r.amount, 0) || 0;

    // Get pending applications
    const { count: pendingApplications } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('status', ['pending', 'applied']);

    // Get overdue loans (simplified - check next_payment_date < today)
    const today = new Date().toISOString().split('T')[0];
    const { count: overdueLoans } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .lt('next_payment_date', today)
      .in('status', ['active', 'disbursed']);

    // Get savings balance
    const { data: savingsData } = await supabase
      .from('accounts')
      .select('balance')
      .eq('tenant_id', tenantId)
      .eq('account_type', 'savings')
      .eq('status', 'active');

    const savingsBalance = savingsData?.reduce((sum, acc) => sum + acc.balance, 0) || 0;

    // Calculate monthly growth (simplified - compare current month vs last month)
    const monthlyGrowth = 12.5; // Placeholder - implement actual calculation

    return {
      totalCustomers: totalCustomers || 0,
      activeLoans: activeLoans || 0,
      totalDisbursed,
      totalCollected,
      pendingApplications: pendingApplications || 0,
      overdueLoans: overdueLoans || 0,
      savingsBalance,
      monthlyGrowth,
    };
  },
};

