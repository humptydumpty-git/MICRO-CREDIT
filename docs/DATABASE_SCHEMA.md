# HUMPBANK Database Schema Documentation

Complete database schema documentation for the HUMPBANK system.

## Overview

HUMPBANK uses a multi-tenant architecture where each bank (tenant) has isolated data. All tables include a `tenant_id` column for data isolation.

## Tables

### tenants

Stores bank/tenant information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Bank name |
| code | VARCHAR(50) | Unique bank code |
| subdomain | VARCHAR(100) | Subdomain (optional) |
| email | VARCHAR(255) | Contact email |
| phone | VARCHAR(50) | Contact phone |
| address | TEXT | Physical address |
| country | VARCHAR(100) | Country |
| currency_code | VARCHAR(3) | Default currency (default: NGN) |
| timezone | VARCHAR(50) | Timezone (default: Africa/Lagos) |
| logo_url | TEXT | Logo URL |
| status | VARCHAR(20) | Status: active, inactive, suspended |
| settings | JSONB | Additional settings |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### users

System users (admins, officers, customers).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (references auth.users) |
| tenant_id | UUID | Tenant ID (FK) |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(50) | Phone number |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| role | VARCHAR(20) | Role: admin, officer, customer, manager |
| employee_id | VARCHAR(50) | Employee ID (for staff) |
| department | VARCHAR(100) | Department |
| is_active | BOOLEAN | Active status |
| last_login_at | TIMESTAMPTZ | Last login timestamp |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### customers

Customer information and KYC data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant ID (FK) |
| customer_number | VARCHAR(50) | Unique customer number |
| user_id | UUID | User ID (FK, nullable) |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| middle_name | VARCHAR(100) | Middle name |
| email | VARCHAR(255) | Email |
| phone | VARCHAR(50) | Phone number |
| date_of_birth | DATE | Date of birth |
| gender | VARCHAR(10) | Gender: male, female, other |
| nationality | VARCHAR(100) | Nationality |
| country | VARCHAR(100) | Country |
| state | VARCHAR(100) | State |
| city | VARCHAR(100) | City |
| address | TEXT | Address |
| postal_code | VARCHAR(20) | Postal code |
| occupation | VARCHAR(100) | Occupation |
| employer_name | VARCHAR(255) | Employer name |
| employer_address | TEXT | Employer address |
| monthly_income | DECIMAL(15,2) | Monthly income |
| kyc_status | VARCHAR(20) | KYC status: pending, in_review, verified, rejected |
| kyc_verified_at | TIMESTAMPTZ | KYC verification timestamp |
| kyc_verified_by | UUID | User who verified (FK) |
| id_type | VARCHAR(50) | ID type |
| id_number | VARCHAR(100) | ID number |
| id_issue_date | DATE | ID issue date |
| id_expiry_date | DATE | ID expiry date |
| id_front_url | TEXT | ID front image URL |
| id_back_url | TEXT | ID back image URL |
| photo_url | TEXT | Photo URL |
| credit_score | INTEGER | Credit score (0-850) |
| credit_limit | DECIMAL(15,2) | Credit limit |
| tier | VARCHAR(20) | Tier: bronze, silver, gold, platinum |
| bank_name | VARCHAR(255) | Bank name |
| bank_account_number | VARCHAR(50) | Bank account number |
| bank_account_name | VARCHAR(255) | Bank account name |
| status | VARCHAR(20) | Status: active, inactive, suspended, closed |
| status_reason | TEXT | Status reason |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| created_by | UUID | Created by (FK) |

### accounts

Bank accounts (Savings, Current, Loan, Fixed Deposit).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant ID (FK) |
| customer_id | UUID | Customer ID (FK) |
| account_number | VARCHAR(50) | Unique account number |
| account_type | VARCHAR(20) | Type: savings, current, loan, fixed_deposit |
| account_name | VARCHAR(255) | Account name |
| product_id | UUID | Product ID (FK, nullable) |
| balance | DECIMAL(15,2) | Current balance |
| available_balance | DECIMAL(15,2) | Available balance |
| ledger_balance | DECIMAL(15,2) | Ledger balance |
| currency_code | VARCHAR(3) | Currency code (default: NGN) |
| interest_rate | DECIMAL(5,2) | Interest rate |
| interest_balance | DECIMAL(15,2) | Interest balance |
| last_interest_calculated_at | TIMESTAMPTZ | Last interest calculation |
| status | VARCHAR(20) | Status: active, dormant, frozen, closed |
| opened_date | DATE | Opening date |
| closed_date | DATE | Closing date (nullable) |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| created_by | UUID | Created by (FK) |

### transactions

All financial transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant ID (FK) |
| transaction_ref | VARCHAR(100) | Unique transaction reference |
| account_id | UUID | Account ID (FK) |
| customer_id | UUID | Customer ID (FK) |
| transaction_type | VARCHAR(50) | Type: deposit, withdrawal, transfer_out, transfer_in, loan_disbursement, loan_repayment, loan_interest, fee_charge, fee_reversal, interest_credit, reversal, adjustment |
| amount | DECIMAL(15,2) | Transaction amount |
| balance_before | DECIMAL(15,2) | Balance before transaction |
| balance_after | DECIMAL(15,2) | Balance after transaction |
| currency_code | VARCHAR(3) | Currency code |
| related_transaction_id | UUID | Related transaction (FK, nullable) |
| related_account_id | UUID | Related account (FK, nullable) |
| description | TEXT | Description |
| narration | TEXT | Narration |
| channel | VARCHAR(50) | Channel: web, mobile, atm, pos, branch, api, ussd |
| status | VARCHAR(20) | Status: pending, processing, completed, failed, reversed |
| status_reason | TEXT | Status reason |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| processed_at | TIMESTAMPTZ | Processed timestamp |
| created_by | UUID | Created by (FK) |

### loans

Loan records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant ID (FK) |
| loan_number | VARCHAR(50) | Unique loan number |
| customer_id | UUID | Customer ID (FK) |
| account_id | UUID | Account ID (FK) |
| product_id | UUID | Loan product ID (FK) |
| principal_amount | DECIMAL(15,2) | Principal amount |
| disbursed_amount | DECIMAL(15,2) | Disbursed amount |
| interest_rate | DECIMAL(5,2) | Interest rate |
| interest_type | VARCHAR(20) | Type: flat, reducing, fixed |
| tenure_months | INTEGER | Tenure in months |
| tenure_days | INTEGER | Tenure in days (nullable) |
| total_interest | DECIMAL(15,2) | Total interest |
| total_amount | DECIMAL(15,2) | Total amount |
| processing_fee | DECIMAL(15,2) | Processing fee |
| principal_paid | DECIMAL(15,2) | Principal paid |
| interest_paid | DECIMAL(15,2) | Interest paid |
| fees_paid | DECIMAL(15,2) | Fees paid |
| total_paid | DECIMAL(15,2) | Total paid |
| outstanding_principal | DECIMAL(15,2) | Outstanding principal |
| outstanding_interest | DECIMAL(15,2) | Outstanding interest |
| outstanding_total | DECIMAL(15,2) | Outstanding total |
| overdue_amount | DECIMAL(15,2) | Overdue amount |
| days_overdue | INTEGER | Days overdue |
| application_date | DATE | Application date |
| approval_date | DATE | Approval date (nullable) |
| disbursement_date | DATE | Disbursement date (nullable) |
| first_payment_date | DATE | First payment date (nullable) |
| last_payment_date | DATE | Last payment date (nullable) |
| maturity_date | DATE | Maturity date (nullable) |
| closed_date | DATE | Closed date (nullable) |
| status | VARCHAR(20) | Status: pending, under_review, approved, disbursed, active, overdue, defaulted, closed, written_off, rejected |
| status_reason | TEXT | Status reason |
| approved_by | UUID | Approved by (FK, nullable) |
| approved_at | TIMESTAMPTZ | Approved timestamp (nullable) |
| disbursed_by | UUID | Disbursed by (FK, nullable) |
| purpose | TEXT | Loan purpose |
| collateral_details | JSONB | Collateral details |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| created_by | UUID | Created by (FK) |

### loan_products

Loan product definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant ID (FK) |
| name | VARCHAR(255) | Product name |
| code | VARCHAR(50) | Product code |
| description | TEXT | Description |
| min_amount | DECIMAL(15,2) | Minimum amount |
| max_amount | DECIMAL(15,2) | Maximum amount |
| min_tenure_months | INTEGER | Minimum tenure (months) |
| max_tenure_months | INTEGER | Maximum tenure (months) |
| interest_rate | DECIMAL(5,2) | Interest rate |
| interest_type | VARCHAR(20) | Type: flat, reducing, fixed |
| interest_calculation_method | VARCHAR(50) | Calculation method |
| processing_fee_percentage | DECIMAL(5,2) | Processing fee percentage |
| processing_fee_fixed | DECIMAL(15,2) | Fixed processing fee |
| late_fee_percentage | DECIMAL(5,2) | Late fee percentage |
| late_fee_fixed | DECIMAL(15,2) | Fixed late fee |
| early_repayment_fee | DECIMAL(5,2) | Early repayment fee |
| min_credit_score | INTEGER | Minimum credit score |
| min_monthly_income | DECIMAL(15,2) | Minimum monthly income |
| eligibility_criteria | JSONB | Eligibility criteria |
| status | VARCHAR(20) | Status: active, inactive, archived |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| created_by | UUID | Created by (FK) |

### loan_repayment_schedules

Loan repayment schedules.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant ID (FK) |
| loan_id | UUID | Loan ID (FK) |
| installment_number | INTEGER | Installment number |
| principal_due | DECIMAL(15,2) | Principal due |
| interest_due | DECIMAL(15,2) | Interest due |
| total_due | DECIMAL(15,2) | Total due |
| principal_paid | DECIMAL(15,2) | Principal paid |
| interest_paid | DECIMAL(15,2) | Interest paid |
| total_paid | DECIMAL(15,2) | Total paid |
| outstanding_balance | DECIMAL(15,2) | Outstanding balance |
| due_date | DATE | Due date |
| paid_date | DATE | Paid date (nullable) |
| status | VARCHAR(20) | Status: pending, paid, partial, overdue, waived |
| days_overdue | INTEGER | Days overdue |
| late_fee | DECIMAL(15,2) | Late fee |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### savings_products

Savings product definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant ID (FK) |
| name | VARCHAR(255) | Product name |
| code | VARCHAR(50) | Product code |
| description | TEXT | Description |
| min_balance | DECIMAL(15,2) | Minimum balance |
| max_balance | DECIMAL(15,2) | Maximum balance (nullable) |
| min_opening_balance | DECIMAL(15,2) | Minimum opening balance |
| interest_rate | DECIMAL(5,2) | Interest rate |
| interest_calculation_method | VARCHAR(50) | Calculation method |
| interest_payment_frequency | VARCHAR(20) | Frequency: daily, monthly, quarterly, annually, at_maturity |
| maintenance_fee | DECIMAL(15,2) | Maintenance fee |
| maintenance_fee_frequency | VARCHAR(20) | Maintenance fee frequency |
| withdrawal_fee | DECIMAL(15,2) | Withdrawal fee |
| minimum_withdrawal | DECIMAL(15,2) | Minimum withdrawal |
| maximum_withdrawal_per_day | DECIMAL(15,2) | Maximum withdrawal per day (nullable) |
| maximum_withdrawals_per_month | INTEGER | Maximum withdrawals per month (nullable) |
| withdrawal_allowed | BOOLEAN | Withdrawal allowed |
| withdrawal_notice_days | INTEGER | Withdrawal notice days |
| status | VARCHAR(20) | Status: active, inactive, archived |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| created_by | UUID | Created by (FK) |

### notifications

Notification records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant ID (FK) |
| user_id | UUID | User ID (FK, nullable) |
| customer_id | UUID | Customer ID (FK, nullable) |
| type | VARCHAR(50) | Type: transaction, loan_disbursement, loan_repayment_due, loan_overdue, account_balance, kyc_approved, kyc_rejected, password_reset, account_opened, payment_received, payment_failed, statement_ready |
| channel | VARCHAR(20) | Channel: email, sms, push, in_app |
| subject | VARCHAR(255) | Subject (nullable) |
| message | TEXT | Message |
| status | VARCHAR(20) | Status: pending, sent, delivered, failed |
| sent_at | TIMESTAMPTZ | Sent timestamp (nullable) |
| delivered_at | TIMESTAMPTZ | Delivered timestamp (nullable) |
| read_at | TIMESTAMPTZ | Read timestamp (nullable) |
| error_message | TEXT | Error message (nullable) |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### audit_logs

System audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant ID (FK) |
| user_id | UUID | User ID (FK, nullable) |
| action | VARCHAR(100) | Action performed |
| entity_type | VARCHAR(50) | Entity type |
| entity_id | UUID | Entity ID (nullable) |
| old_values | JSONB | Old values (nullable) |
| new_values | JSONB | New values (nullable) |
| ip_address | INET | IP address (nullable) |
| user_agent | TEXT | User agent (nullable) |
| request_method | VARCHAR(10) | Request method (nullable) |
| request_path | TEXT | Request path (nullable) |
| status | VARCHAR(20) | Status: success, failure, error |
| error_message | TEXT | Error message (nullable) |
| created_at | TIMESTAMPTZ | Creation timestamp |

## Row-Level Security (RLS)

All tables have Row-Level Security enabled to ensure data isolation between tenants. Users can only access data from their own tenant.

## Indexes

Comprehensive indexes are created on foreign keys and frequently queried columns for optimal performance.

## Functions

- `generate_account_number()` - Generates unique account numbers
- `generate_customer_number()` - Generates unique customer numbers
- `generate_transaction_ref()` - Generates unique transaction references
- `get_user_tenant_id()` - Gets current user's tenant ID
- `is_admin_or_officer()` - Checks if user is admin or officer
- `update_updated_at_column()` - Updates updated_at timestamp

