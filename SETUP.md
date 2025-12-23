# Setup Guide

This guide will walk you through setting up the Micro Credit Banking Platform with Supabase.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- Basic knowledge of SQL

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/sign up
2. Click "New Project"
3. Fill in:
   - **Organization**: Select or create one
   - **Name**: e.g., "micro-credit-platform"
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
4. Click "Create new project"
5. Wait for project to be created (2-3 minutes)

### 3. Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 4. Configure Environment Variables

1. In the project root, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save the file

### 5. Set Up Database Schema

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Copy its entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Wait for "Success. No rows returned" message

### 6. Create Default Tenant

Run this SQL in the SQL Editor:

```sql
INSERT INTO tenants (id, name, subdomain, status) 
VALUES ('00000000-0000-0000-0000-000000000001', 'MicroFinance Pro', 'mfpro', 'active')
ON CONFLICT (id) DO NOTHING;
```

### 7. Configure Authentication

1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Email Auth**:
   - **Enable email confirmations**: Toggle OFF (for development) or ON (for production)
   - **Site URL**: Set to `http://localhost:5173` (or your dev URL)
3. Under **Auth Providers**, ensure **Email** is enabled

### 8. Create First Admin User

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Fill in:
   - **Email**: e.g., `admin@example.com`
   - **Password**: Choose a strong password
   - **Auto Confirm User**: Check this box (for development)
4. Click **Create user**
5. Copy the **UUID** of the created user

#### Option B: Using SQL

```sql
-- First, create auth user (requires Supabase Admin API or dashboard)
-- Then run this to create profile:
INSERT INTO users (id, tenant_id, email, first_name, last_name, role)
VALUES (
  'USER_UUID_HERE',  -- Replace with UUID from step above
  '00000000-0000-0000-0000-000000000001',  -- Default tenant ID
  'admin@example.com',
  'Admin',
  'User',
  'admin'
);
```

**Note**: You'll need the user's UUID from the Authentication > Users page.

### 9. Seed Initial Data (Optional)

For development/testing, you can seed some initial data. Create a new SQL query:

```sql
-- Insert a sample customer
INSERT INTO customers (
  tenant_id, customer_number, first_name, last_name, 
  email, phone, country, kyc_status, credit_score, tier
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'CUS20240001',
  'John',
  'Doe',
  'john.doe@example.com',
  '+1234567890',
  'Nigeria',
  'verified',
  750,
  'gold'
) RETURNING *;

-- Insert a loan product
INSERT INTO loan_products (
  tenant_id, name, code, description,
  min_amount, max_amount, interest_rate, interest_type,
  min_tenure_months, max_tenure_months, processing_fee, late_fee
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Personal Loan',
  'PL001',
  'Quick personal loans for immediate needs',
  10000,
  500000,
  15,
  'reducing',
  1,
  24,
  2,
  5
) RETURNING *;
```

### 10. Start Development Server

```bash
npm run dev
```

The app should open at `http://localhost:5173` (or the port shown).

### 11. Log In

1. Click "Sign In" or navigate to the login modal
2. Use the credentials you created in Step 8
3. You should now see the dashboard!

## Troubleshooting

### "Missing Supabase environment variables"

- Make sure `.env` file exists in the project root
- Check that variable names start with `VITE_`
- Restart the dev server after changing `.env`

### "Invalid login credentials"

- Verify the user exists in Supabase Authentication > Users
- Check that the user profile exists in the `users` table
- Ensure `is_active` is `true` in the users table

### "Row Level Security policy violation"

- Check that RLS policies are enabled (they should be from the migration)
- Verify the user has a `tenant_id` matching the tenant in the data
- Check the browser console for specific error messages

### Database connection errors

- Verify your Supabase project is active (not paused)
- Check that the URL and key in `.env` are correct
- Ensure you're using the `anon` key, not the `service_role` key

### Tables not found

- Run the migration SQL again in SQL Editor
- Check that all tables were created (go to Table Editor to verify)
- Look for any error messages in the SQL Editor

## Next Steps

- Review the [README.md](README.md) for more information
- Check the code structure to understand how components work
- Customize the default tenant and user data for your needs
- Set up production environment variables when deploying

## Production Deployment

When deploying to production:

1. Create a new Supabase project (or use existing)
2. Run all migrations
3. Set production environment variables in your hosting platform
4. Enable email confirmations in Supabase Auth settings
5. Update Site URL in Supabase Auth settings to your production URL
6. Configure custom domain (optional)
7. Set up backups and monitoring

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check Supabase logs (Logs > API or Logs > Postgres)
3. Verify all steps were completed correctly
4. Review the error messages carefully

For more help, open an issue on GitHub.

