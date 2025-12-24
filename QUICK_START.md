# Quick Start Guide

Get the application running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)

## Steps

### 1. Install Dependencies (1 min)
```bash
npm install
```

### 2. Set Up Supabase (2 min)
1. Go to [supabase.com](https://supabase.com) and create a project
2. Copy your Project URL and anon key from Settings > API
3. Create `.env` file in project root:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Set Up Database (1 min)
1. In Supabase Dashboard, go to SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run in SQL Editor
4. Create default tenant:
   ```sql
   INSERT INTO tenants (id, name, subdomain, status) 
   VALUES ('00000000-0000-0000-0000-000000000001', 'MicroFinance Pro', 'mfpro', 'active');
   ```

### 4. Create First User (1 min)
1. In Supabase Dashboard, go to Authentication > Users
2. Click "Add user" > "Create new user"
3. Enter email and password, check "Auto Confirm User"
4. Copy the user's UUID
5. In SQL Editor, run:
   ```sql
   INSERT INTO users (id, tenant_id, email, first_name, last_name, role)
   VALUES ('USER_UUID_HERE', '00000000-0000-0000-0000-000000000001', 'your-email@example.com', 'Admin', 'User', 'admin');
   ```
   (Replace USER_UUID_HERE with the UUID from step 3)

### 5. Start Development Server
```bash
npm run dev
```

### 6. Log In
- Open http://localhost:5173 (or the port shown)
- Log in with the email/password you created
- You're ready to go! 🎉

## Troubleshooting

**Can't log in?**
- Check user exists in both Authentication > Users AND the users table
- Verify `is_active` is `true` in users table
- Check browser console for errors

**Database errors?**
- Verify migration SQL ran successfully
- Check RLS policies are enabled
- Verify tenant_id matches in all tables

**Environment variables not working?**
- Make sure variable names start with `VITE_`
- Restart dev server after changing `.env`
- Check for typos

## Next Steps

- See [SETUP.md](SETUP.md) for detailed setup
- See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for production deployment
- See [README.md](README.md) for full documentation

