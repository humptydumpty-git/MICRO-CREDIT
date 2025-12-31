# HUMPBANK Quick Start Guide

Get HUMPBANK up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Supabase account (free tier works)

## Quick Setup (5 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Fill in details and create project
5. Wait 2-3 minutes for project to be ready

### Step 3: Get Supabase Credentials

1. In Supabase dashboard → Settings → API
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

### Step 4: Configure Environment

1. Create `.env` file in project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Step 5: Set Up Database & Run

1. In Supabase dashboard → SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and Run (Ctrl/Cmd + Enter)
4. Create default tenant:
   ```sql
   INSERT INTO tenants (id, name, code, subdomain, status) 
   VALUES ('00000000-0000-0000-0000-000000000001', 'HUMPBANK Default', 'HUMP001', 'default', 'active');
   ```
5. Start the app:
   ```bash
   npm run dev
   ```

6. Create admin user:
   - Go to Supabase → Authentication → Users
   - Add user with email/password
   - Copy the UUID
   - In SQL Editor, run:
     ```sql
     INSERT INTO users (id, tenant_id, email, first_name, last_name, role)
     VALUES ('USER_UUID_HERE', '00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Admin', 'User', 'admin');
     ```

7. Open `http://localhost:5173` and login!

## That's It! 🎉

You now have HUMPBANK running locally.

## Next Steps

- Read [SETUP.md](./docs/SETUP.md) for detailed setup
- Read [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) to understand the database
- Read [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for API usage
- Read [DEPLOYMENT.md](./docs/DEPLOYMENT.md) to deploy to production

## Troubleshooting

**"Missing Supabase environment variables"**
- Check `.env` file exists and has correct variable names (must start with `VITE_`)
- Restart dev server after changing `.env`

**"Invalid login credentials"**
- Make sure user exists in Supabase Authentication → Users
- Make sure user profile exists in `users` table
- Check `is_active` is `true` in users table

**"Row Level Security policy violation"**
- Check that you ran the migration SQL
- Verify user has correct `tenant_id`

**Still having issues?**
- Check browser console for errors
- Check Supabase logs (Dashboard → Logs)
- Review [SETUP.md](./docs/SETUP.md) for detailed troubleshooting

---

Happy Banking! 🏦

