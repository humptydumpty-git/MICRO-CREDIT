-- =====================================================
-- HUMPBANK Database Schema
-- Multi-Tenant Micro Credit & Savings Banking System
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TENANTS TABLE (Banks)
-- =====================================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    country VARCHAR(100),
    currency_code VARCHAR(3) DEFAULT 'NGN',
    timezone VARCHAR(50) DEFAULT 'Africa/Lagos',
    logo_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USERS TABLE (System Users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'officer', 'customer', 'manager')),
    employee_id VARCHAR(50),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_number VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    nationality VARCHAR(100),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    occupation VARCHAR(100),
    employer_name VARCHAR(255),
    employer_address TEXT,
    monthly_income DECIMAL(15, 2),
    
    -- KYC Information
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_review', 'verified', 'rejected')),
    kyc_verified_at TIMESTAMPTZ,
    kyc_verified_by UUID REFERENCES users(id),
    
    -- Identification
    id_type VARCHAR(50),
    id_number VARCHAR(100),
    id_issue_date DATE,
    id_expiry_date DATE,
    id_front_url TEXT,
    id_back_url TEXT,
    photo_url TEXT,
    
    -- Financial Information
    credit_score INTEGER DEFAULT 0 CHECK (credit_score >= 0 AND credit_score <= 850),
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    
    -- Banking
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'closed')),
    status_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(tenant_id, customer_number),
    UNIQUE(tenant_id, phone)
);

-- =====================================================
-- ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    account_number VARCHAR(50) NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('savings', 'current', 'loan', 'fixed_deposit')),
    account_name VARCHAR(255),
    product_id UUID, -- References loan_products or savings_products
    
    -- Balance Information
    balance DECIMAL(15, 2) DEFAULT 0,
    available_balance DECIMAL(15, 2) DEFAULT 0,
    ledger_balance DECIMAL(15, 2) DEFAULT 0,
    currency_code VARCHAR(3) DEFAULT 'NGN',
    
    -- Interest
    interest_rate DECIMAL(5, 2) DEFAULT 0,
    interest_balance DECIMAL(15, 2) DEFAULT 0,
    last_interest_calculated_at TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'dormant', 'frozen', 'closed')),
    opened_date DATE DEFAULT CURRENT_DATE,
    closed_date DATE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(tenant_id, account_number)
);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transaction_ref VARCHAR(100) UNIQUE NOT NULL,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
        'deposit', 'withdrawal', 'transfer_out', 'transfer_in',
        'loan_disbursement', 'loan_repayment', 'loan_interest',
        'fee_charge', 'fee_reversal', 'interest_credit',
        'reversal', 'adjustment'
    )),
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2),
    balance_after DECIMAL(15, 2),
    currency_code VARCHAR(3) DEFAULT 'NGN',
    
    -- Related Transaction (for reversals, transfers)
    related_transaction_id UUID REFERENCES transactions(id),
    related_account_id UUID REFERENCES accounts(id),
    
    -- Description
    description TEXT,
    narration TEXT,
    channel VARCHAR(50) CHECK (channel IN ('web', 'mobile', 'atm', 'pos', 'branch', 'api', 'ussd')),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'reversed')),
    status_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    
    UNIQUE(tenant_id, transaction_ref)
);

-- =====================================================
-- LOAN PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS loan_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Loan Terms
    min_amount DECIMAL(15, 2) NOT NULL,
    max_amount DECIMAL(15, 2) NOT NULL,
    min_tenure_months INTEGER NOT NULL,
    max_tenure_months INTEGER NOT NULL,
    
    -- Interest
    interest_rate DECIMAL(5, 2) NOT NULL,
    interest_type VARCHAR(20) NOT NULL CHECK (interest_type IN ('flat', 'reducing', 'fixed')),
    interest_calculation_method VARCHAR(50) DEFAULT 'daily',
    
    -- Fees
    processing_fee_percentage DECIMAL(5, 2) DEFAULT 0,
    processing_fee_fixed DECIMAL(15, 2) DEFAULT 0,
    late_fee_percentage DECIMAL(5, 2) DEFAULT 0,
    late_fee_fixed DECIMAL(15, 2) DEFAULT 0,
    early_repayment_fee DECIMAL(5, 2) DEFAULT 0,
    
    -- Eligibility
    min_credit_score INTEGER DEFAULT 0,
    min_monthly_income DECIMAL(15, 2),
    eligibility_criteria JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(tenant_id, code)
);

-- =====================================================
-- LOANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    loan_number VARCHAR(50) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES loan_products(id) ON DELETE RESTRICT,
    
    -- Loan Details
    principal_amount DECIMAL(15, 2) NOT NULL,
    disbursed_amount DECIMAL(15, 2) DEFAULT 0,
    interest_rate DECIMAL(5, 2) NOT NULL,
    interest_type VARCHAR(20) NOT NULL CHECK (interest_type IN ('flat', 'reducing', 'fixed')),
    tenure_months INTEGER NOT NULL,
    tenure_days INTEGER,
    
    -- Financials
    total_interest DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    processing_fee DECIMAL(15, 2) DEFAULT 0,
    principal_paid DECIMAL(15, 2) DEFAULT 0,
    interest_paid DECIMAL(15, 2) DEFAULT 0,
    fees_paid DECIMAL(15, 2) DEFAULT 0,
    total_paid DECIMAL(15, 2) DEFAULT 0,
    outstanding_principal DECIMAL(15, 2) DEFAULT 0,
    outstanding_interest DECIMAL(15, 2) DEFAULT 0,
    outstanding_total DECIMAL(15, 2) DEFAULT 0,
    overdue_amount DECIMAL(15, 2) DEFAULT 0,
    days_overdue INTEGER DEFAULT 0,
    
    -- Dates
    application_date DATE DEFAULT CURRENT_DATE,
    approval_date DATE,
    disbursement_date DATE,
    first_payment_date DATE,
    last_payment_date DATE,
    maturity_date DATE,
    closed_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'approved', 'disbursed',
        'active', 'overdue', 'defaulted', 'closed', 'written_off', 'rejected'
    )),
    status_reason TEXT,
    
    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    disbursed_by UUID REFERENCES users(id),
    
    -- Purpose
    purpose TEXT,
    collateral_details JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(tenant_id, loan_number)
);

-- =====================================================
-- LOAN REPAYMENT SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS loan_repayment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    
    -- Amounts
    principal_due DECIMAL(15, 2) NOT NULL,
    interest_due DECIMAL(15, 2) NOT NULL,
    total_due DECIMAL(15, 2) NOT NULL,
    principal_paid DECIMAL(15, 2) DEFAULT 0,
    interest_paid DECIMAL(15, 2) DEFAULT 0,
    total_paid DECIMAL(15, 2) DEFAULT 0,
    outstanding_balance DECIMAL(15, 2) NOT NULL,
    
    -- Dates
    due_date DATE NOT NULL,
    paid_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'waived')),
    days_overdue INTEGER DEFAULT 0,
    late_fee DECIMAL(15, 2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, loan_id, installment_number)
);

-- =====================================================
-- SAVINGS PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS savings_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Terms
    min_balance DECIMAL(15, 2) DEFAULT 0,
    max_balance DECIMAL(15, 2),
    min_opening_balance DECIMAL(15, 2) DEFAULT 0,
    
    -- Interest
    interest_rate DECIMAL(5, 2) DEFAULT 0,
    interest_calculation_method VARCHAR(50) DEFAULT 'daily',
    interest_payment_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (interest_payment_frequency IN ('daily', 'monthly', 'quarterly', 'annually', 'at_maturity')),
    
    -- Fees
    maintenance_fee DECIMAL(15, 2) DEFAULT 0,
    maintenance_fee_frequency VARCHAR(20) DEFAULT 'monthly',
    withdrawal_fee DECIMAL(15, 2) DEFAULT 0,
    minimum_withdrawal DECIMAL(15, 2) DEFAULT 0,
    maximum_withdrawal_per_day DECIMAL(15, 2),
    maximum_withdrawals_per_month INTEGER,
    
    -- Restrictions
    withdrawal_allowed BOOLEAN DEFAULT true,
    withdrawal_notice_days INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(tenant_id, code)
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Notification Details
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'transaction', 'loan_disbursement', 'loan_repayment_due',
        'loan_overdue', 'account_balance', 'kyc_approved',
        'kyc_rejected', 'password_reset', 'account_opened',
        'payment_received', 'payment_failed', 'statement_ready'
    )),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action Details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    
    -- Request Info
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'error')),
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Tenants
CREATE INDEX idx_tenants_code ON tenants(code);
CREATE INDEX idx_tenants_status ON tenants(status);

-- Users
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);

-- Customers
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_customer_number ON customers(customer_number);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_kyc_status ON customers(kyc_status);

-- Accounts
CREATE INDEX idx_accounts_tenant_id ON accounts(tenant_id);
CREATE INDEX idx_accounts_customer_id ON accounts(customer_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_account_type ON accounts(account_type);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_product_id ON accounts(product_id);

-- Transactions
CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_transaction_ref ON transactions(transaction_ref);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_account_created ON transactions(account_id, created_at DESC);

-- Loans
CREATE INDEX idx_loans_tenant_id ON loans(tenant_id);
CREATE INDEX idx_loans_customer_id ON loans(customer_id);
CREATE INDEX idx_loans_account_id ON loans(account_id);
CREATE INDEX idx_loans_product_id ON loans(product_id);
CREATE INDEX idx_loans_loan_number ON loans(loan_number);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_due_date ON loans(maturity_date);

-- Loan Repayment Schedules
CREATE INDEX idx_loan_schedules_tenant_id ON loan_repayment_schedules(tenant_id);
CREATE INDEX idx_loan_schedules_loan_id ON loan_repayment_schedules(loan_id);
CREATE INDEX idx_loan_schedules_status ON loan_repayment_schedules(status);
CREATE INDEX idx_loan_schedules_due_date ON loan_repayment_schedules(due_date);
CREATE INDEX idx_loan_schedules_overdue ON loan_repayment_schedules(tenant_id, status, due_date) WHERE status = 'overdue';

-- Loan Products
CREATE INDEX idx_loan_products_tenant_id ON loan_products(tenant_id);
CREATE INDEX idx_loan_products_code ON loan_products(code);
CREATE INDEX idx_loan_products_status ON loan_products(status);

-- Savings Products
CREATE INDEX idx_savings_products_tenant_id ON savings_products(tenant_id);
CREATE INDEX idx_savings_products_code ON savings_products(code);
CREATE INDEX idx_savings_products_status ON savings_products(status);

-- Notifications
CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Audit Logs
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Function to get user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT tenant_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin or officer
CREATE OR REPLACE FUNCTION is_admin_or_officer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'officer', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenants Policies (Only admins can view all tenants, users can only see their tenant)
CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT
  USING (id = get_user_tenant_id() OR is_admin_or_officer());

-- Users Policies
CREATE POLICY "Users can view users in their tenant"
  ON users FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can insert users in their tenant"
  ON users FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id() AND is_admin_or_officer());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid() OR (tenant_id = get_user_tenant_id() AND is_admin_or_officer()));

-- Customers Policies
CREATE POLICY "Users can view customers in their tenant"
  ON customers FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Customers can view their own data"
  ON customers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Officers can manage customers in their tenant"
  ON customers FOR ALL
  USING (tenant_id = get_user_tenant_id() AND is_admin_or_officer());

-- Accounts Policies
CREATE POLICY "Users can view accounts in their tenant"
  ON accounts FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Customers can view their own accounts"
  ON accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = accounts.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Officers can manage accounts in their tenant"
  ON accounts FOR ALL
  USING (tenant_id = get_user_tenant_id() AND is_admin_or_officer());

-- Transactions Policies
CREATE POLICY "Users can view transactions in their tenant"
  ON transactions FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Customers can view their own transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = transactions.account_id
      AND EXISTS (
        SELECT 1 FROM customers
        WHERE customers.id = accounts.customer_id
        AND customers.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Officers can manage transactions in their tenant"
  ON transactions FOR ALL
  USING (tenant_id = get_user_tenant_id() AND is_admin_or_officer());

-- Loans Policies
CREATE POLICY "Users can view loans in their tenant"
  ON loans FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Customers can view their own loans"
  ON loans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = loans.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Officers can manage loans in their tenant"
  ON loans FOR ALL
  USING (tenant_id = get_user_tenant_id() AND is_admin_or_officer());

-- Loan Products Policies
CREATE POLICY "Users can view loan products in their tenant"
  ON loan_products FOR SELECT
  USING (tenant_id = get_user_tenant_id() OR status = 'active');

CREATE POLICY "Officers can manage loan products in their tenant"
  ON loan_products FOR ALL
  USING (tenant_id = get_user_tenant_id() AND is_admin_or_officer());

-- Loan Repayment Schedules Policies
CREATE POLICY "Users can view schedules in their tenant"
  ON loan_repayment_schedules FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Customers can view their own loan schedules"
  ON loan_repayment_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = loan_repayment_schedules.loan_id
      AND EXISTS (
        SELECT 1 FROM customers
        WHERE customers.id = loans.customer_id
        AND customers.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Officers can manage schedules in their tenant"
  ON loan_repayment_schedules FOR ALL
  USING (tenant_id = get_user_tenant_id() AND is_admin_or_officer());

-- Savings Products Policies
CREATE POLICY "Users can view savings products in their tenant"
  ON savings_products FOR SELECT
  USING (tenant_id = get_user_tenant_id() OR status = 'active');

CREATE POLICY "Officers can manage savings products in their tenant"
  ON savings_products FOR ALL
  USING (tenant_id = get_user_tenant_id() AND is_admin_or_officer());

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid() OR customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  ) OR tenant_id = get_user_tenant_id() AND is_admin_or_officer());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Audit Logs Policies (Read-only for admins/officers)
CREATE POLICY "Officers can view audit logs in their tenant"
  ON audit_logs FOR SELECT
  USING (tenant_id = get_user_tenant_id() AND is_admin_or_officer());

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_products_updated_at BEFORE UPDATE ON loan_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_schedules_updated_at BEFORE UPDATE ON loan_repayment_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_products_updated_at BEFORE UPDATE ON savings_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to generate unique account number
CREATE OR REPLACE FUNCTION generate_account_number(p_tenant_id UUID, p_account_type VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    v_prefix VARCHAR;
    v_next_num INTEGER;
    v_account_number VARCHAR;
BEGIN
    -- Set prefix based on account type
    CASE p_account_type
        WHEN 'savings' THEN v_prefix := 'SAV';
        WHEN 'current' THEN v_prefix := 'CUR';
        WHEN 'loan' THEN v_prefix := 'LOAN';
        WHEN 'fixed_deposit' THEN v_prefix := 'FXD';
        ELSE v_prefix := 'ACC';
    END CASE;
    
    -- Get next sequence number for tenant
    SELECT COALESCE(MAX(CAST(SUBSTRING(account_number FROM 4) AS INTEGER)), 0) + 1
    INTO v_next_num
    FROM accounts
    WHERE tenant_id = p_tenant_id
    AND account_number LIKE v_prefix || '%';
    
    -- Format: PREFIX + 8 digit number
    v_account_number := v_prefix || LPAD(v_next_num::TEXT, 8, '0');
    
    RETURN v_account_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique customer number
CREATE OR REPLACE FUNCTION generate_customer_number(p_tenant_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_next_num INTEGER;
    v_customer_number VARCHAR;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(customer_number FROM 4) AS INTEGER)), 0) + 1
    INTO v_next_num
    FROM customers
    WHERE tenant_id = p_tenant_id
    AND customer_number LIKE 'CUS%';
    
    v_customer_number := 'CUS' || LPAD(v_next_num::TEXT, 8, '0');
    
    RETURN v_customer_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique transaction reference
CREATE OR REPLACE FUNCTION generate_transaction_ref(p_tenant_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_ref VARCHAR;
BEGIN
    v_ref := 'TXN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(
        (SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_ref FROM 12) AS INTEGER)), 0) + 1
         FROM transactions
         WHERE tenant_id = p_tenant_id
         AND transaction_ref LIKE 'TXN' || TO_CHAR(NOW(), 'YYYYMMDD') || '%'), 8, '0');
    RETURN v_ref;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA (Optional - for development)
-- =====================================================

-- Insert default tenant (optional - remove in production)
-- INSERT INTO tenants (id, name, code, subdomain, status)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'HUMPBANK Default',
--   'HUMP001',
--   'default',
--   'active'
-- )
-- ON CONFLICT DO NOTHING;

