# HUMPBANK API Documentation

API documentation for HUMPBANK services and data access patterns.

## Overview

HUMPBANK uses Supabase as the backend, which provides a RESTful API and real-time subscriptions. All API calls are made through the Supabase client library.

## Authentication

All API requests require authentication via Supabase Auth. Users must be authenticated and have appropriate permissions.

```typescript
import { supabase } from '@/lib/supabase'

// Authentication is handled automatically by Supabase client
const { data, error } = await supabase
  .from('customers')
  .select('*')
```

## Services

### Customer Service

Location: `src/services/customerService.ts`

#### Get All Customers

```typescript
import { customerService } from '@/services/customerService'

const customers = await customerService.getAll()
const activeCustomers = await customerService.getAll({ status: 'active' })
const pendingKYC = await customerService.getAll({ kyc_status: 'pending' })
```

#### Get Customer by ID

```typescript
const customer = await customerService.getById(customerId)
```

#### Create Customer

```typescript
const newCustomer = await customerService.create({
  tenant_id: tenantId,
  first_name: 'John',
  last_name: 'Doe',
  phone: '+2348012345678',
  email: 'john@example.com',
  // ... other fields
})
```

#### Update Customer

```typescript
const updated = await customerService.update(customerId, {
  kyc_status: 'verified',
  credit_score: 750,
})
```

### Account Service

Location: `src/services/accountService.ts`

#### Get All Accounts

```typescript
import { accountService } from '@/services/accountService'

const accounts = await accountService.getAll()
const savingsAccounts = await accountService.getAll({ account_type: 'savings' })
const customerAccounts = await accountService.getAll({ customer_id: customerId })
```

#### Create Account

```typescript
const account = await accountService.create({
  tenant_id: tenantId,
  customer_id: customerId,
  account_type: 'savings',
  product_id: productId,
  currency_code: 'NGN',
})
```

#### Update Account Balance

```typescript
await accountService.updateBalance(accountId, 1000, 'credit') // Add 1000
await accountService.updateBalance(accountId, 500, 'debit')   // Subtract 500
```

### Transaction Service

Location: `src/services/transactionService.ts`

#### Get All Transactions

```typescript
import { transactionService } from '@/services/transactionService'

const transactions = await transactionService.getAll()
const accountTransactions = await transactionService.getAll({ account_id: accountId })
const recentTransactions = await transactionService.getAll({
  start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
})
```

#### Create Deposit

```typescript
const transaction = await transactionService.deposit(
  accountId,
  1000,
  'Deposit description',
  userId
)
```

#### Create Withdrawal

```typescript
const transaction = await transactionService.withdraw(
  accountId,
  500,
  'Withdrawal description',
  userId
)
```

#### Transfer Between Accounts

```typescript
const { debit, credit } = await transactionService.transfer(
  fromAccountId,
  toAccountId,
  1000,
  'Transfer description',
  userId
)
```

### Loan Service

Location: `src/services/loanService.ts`

#### Get All Loans

```typescript
import { loanService } from '@/services/loanService'

const loans = await loanService.getAll()
const customerLoans = await loanService.getAll({ customer_id: customerId })
const activeLoans = await loanService.getAll({ status: 'active' })
```

#### Create Loan Application

```typescript
const loan = await loanService.createApplication({
  tenant_id: tenantId,
  customer_id: customerId,
  account_id: accountId,
  product_id: productId,
  principal_amount: 100000,
  interest_rate: 15,
  interest_type: 'reducing',
  tenure_months: 12,
  purpose: 'Business expansion',
})
```

#### Approve Loan

```typescript
const approvedLoan = await loanService.approve(loanId, userId)
```

#### Disburse Loan

```typescript
const disbursedLoan = await loanService.disburse(loanId, userId)
```

#### Make Repayment

```typescript
const updatedLoan = await loanService.makeRepayment(
  loanId,
  10000, // amount
  accountId, // source account
  userId
)
```

### Notification Service

Location: `src/services/notificationService.ts`

#### Send SMS

```typescript
import { notificationService } from '@/services/notificationService'

await notificationService.sendSMS(
  phoneNumber,
  'Your account balance is N10,000',
  tenantId,
  userId,
  customerId
)
```

#### Send Email

```typescript
await notificationService.sendEmail(
  email,
  'Account Statement',
  'Your account statement is ready',
  tenantId,
  userId,
  customerId
)
```

#### Get Notifications

```typescript
const notifications = await notificationService.getNotifications(userId)
const unreadNotifications = await notificationService.getNotifications(userId, { read: false })
```

### Auth Service

Location: `src/services/authService.ts`

#### Sign Up

```typescript
import { authService } from '@/services/authService'

await authService.signUp(email, password, {
  first_name: 'John',
  last_name: 'Doe',
})
```

#### Sign In

```typescript
await authService.signIn(email, password)
```

#### Sign Out

```typescript
await authService.signOut()
```

#### Get Current User

```typescript
const user = await authService.getCurrentUser()
```

## Data Types

All TypeScript types are defined in `src/types/index.ts`:

- `Tenant` - Bank/tenant information
- `User` - System users
- `Customer` - Customer information
- `Account` - Bank accounts
- `Transaction` - Financial transactions
- `Loan` - Loan records
- `LoanProduct` - Loan product definitions
- `LoanRepaymentSchedule` - Repayment schedules
- `SavingsProduct` - Savings product definitions
- `Notification` - Notification records
- `AuthUser` - Authenticated user

## Error Handling

All services throw errors that should be caught:

```typescript
try {
  const customer = await customerService.create(customerData)
} catch (error) {
  console.error('Error creating customer:', error)
  // Handle error
}
```

## Real-time Subscriptions

Supabase provides real-time subscriptions:

```typescript
const subscription = supabase
  .channel('transactions')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'transactions' },
    (payload) => {
      console.log('New transaction:', payload.new)
    }
  )
  .subscribe()
```

## Row-Level Security

All tables have Row-Level Security (RLS) enabled. Users can only access data from their own tenant. Policies are automatically enforced by Supabase.

## Rate Limiting

Supabase provides built-in rate limiting. For production, consider implementing additional rate limiting in your application.

## Best Practices

1. Always use the service functions instead of direct Supabase queries
2. Handle errors appropriately
3. Use TypeScript types for type safety
4. Implement proper loading states
5. Cache frequently accessed data
6. Use real-time subscriptions for live updates
7. Follow the multi-tenant data isolation patterns
8. Implement proper error logging

## Examples

### Complete Customer Creation Flow

```typescript
// 1. Create customer
const customer = await customerService.create({
  tenant_id: tenantId,
  first_name: 'John',
  last_name: 'Doe',
  phone: '+2348012345678',
  email: 'john@example.com',
  country: 'Nigeria',
})

// 2. Create account
const account = await accountService.create({
  tenant_id: tenantId,
  customer_id: customer.id,
  account_type: 'savings',
  currency_code: 'NGN',
})

// 3. Make initial deposit
await transactionService.deposit(
  account.id,
  10000,
  'Initial deposit',
  userId
)

// 4. Send welcome notification
await notificationService.sendEmail(
  customer.email,
  'Welcome to HUMPBANK',
  'Your account has been created successfully',
  tenantId,
  undefined,
  customer.id
)
```

---

For more details, refer to the [Supabase Documentation](https://supabase.com/docs).

