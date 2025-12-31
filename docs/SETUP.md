# HUMPBANK Setup Guide

Complete setup instructions for the HUMPBANK Micro Credit & Savings Banking System.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier is sufficient for development)
- Git (optional)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/sign up
2. Click "New Project"
3. Fill in the project details:
   - **Organization**: Select or create one
   - **Name**: e.g., "humpbank"
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
4. Click "Create new project"
5. Wait for project to be created (2-3 minutes)

## Step 3: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. (Optional) Configure SMS and Email services:
   ```env
   VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
   VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
   VITE_TWILIO_PHONE_NUMBER=+1234567890
   
   VITE_SMTP_HOST=smtp.gmail.com
   VITE_SMTP_PORT=587
   VITE_SMTP_USER=your_email@gmail.com
   VITE_SMTP_PASSWORD=your_app_password
   ```

## Step 5: Set Up Database Schema

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/migrations/001_initial_schema.sql`
4. Copy its entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Wait for "Success. No rows returned" message

## Step 6: Configure Authentication

1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Email Auth**:
   - **Enable email confirmations**: Toggle OFF (for development) or ON (for production)
   - **Site URL**: Set to `http://localhost:5173` (or your dev URL)
3. Under **Auth Providers**, ensure **Email** is enabled

## Step 7: Create First Tenant

Run this SQL in the SQL Editor:

```sql
INSERT INTO tenants (id, name, code, subdomain, status) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'HUMPBANK Default',
  'HUMP001',
  'default',
  'active'
)
ON CONFLICT DO NOTHING;
```

## Step 8: Create First Admin User

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Fill in:
   - **Email**: e.g., `admin@humpbank.com`
   - **Password**: Choose a strong password
   - **Auto Confirm User**: Check this box (for development)
4. Click **Create user**
5. Copy the **UUID** of the created user

### Option B: Using SQL (After creating auth user)

```sql
-- Replace USER_UUID_HERE with the UUID from step above
INSERT INTO users (id, tenant_id, email, first_name, last_name, role)
VALUES (
  'USER_UUID_HERE',
  '00000000-0000-0000-0000-000000000001',
  'admin@humpbank.com',
  'Admin',
  'User',
  'admin'
);
```

## Step 9: Start Development Server

```bash
npm run dev
```

The app should open at `http://localhost:5173`

## Step 10: Log In

1. Use the credentials you created in Step 8
2. You should now see the dashboard!

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

- Review the [API Documentation](./API_DOCUMENTATION.md)
- Check the [Database Schema](./DATABASE_SCHEMA.md)
- Review the [Deployment Guide](./DEPLOYMENT.md)
- Customize the default tenant and user data for your needs

## Production Deployment

When deploying to production:

1. Create a new Supabase project (or use existing)
2. Run all migrations
3. Set production environment variables in your hosting platform
4. Enable email confirmations in Supabase Auth settings
5. Update Site URL in Supabase Auth settings to your production URL
6. Configure custom domain (optional)
7. Set up backups and monitoring

