# HUMPBANK Deployment Guide

Complete deployment guide for the HUMPBANK system to production.

## Prerequisites

- Node.js 18+ installed locally
- Supabase account with a production project
- A hosting platform (Vercel, Netlify, or similar)
- Domain name (optional but recommended)
- Twilio account (for SMS notifications)
- SMTP server credentials (for email notifications)

## Step 1: Prepare Production Supabase Project

1. Create a new Supabase project for production (or use existing)
2. Go to **Settings** > **API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret - only for server-side operations)

## Step 2: Set Up Production Database

1. Go to **SQL Editor** in Supabase dashboard
2. Run all migration files from `supabase/migrations/` in order:
   - `001_initial_schema.sql`
3. Create your production tenant:
   ```sql
   INSERT INTO tenants (id, name, code, subdomain, status) 
   VALUES (
     '00000000-0000-0000-0000-000000000001',
     'Your Bank Name',
     'BANK001',
     'your-bank',
     'active'
   );
   ```
4. Verify all tables are created in **Table Editor**

## Step 3: Configure Authentication

1. Go to **Authentication** > **Settings**
2. Configure:
   - **Site URL**: Your production URL (e.g., `https://yourdomain.com`)
   - **Redirect URLs**: Add your production URL
   - **Enable email confirmations**: Toggle ON (recommended for production)
   - **Email Templates**: Customize as needed

## Step 4: Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with optimized production files.

## Step 5: Deploy to Vercel (Recommended)

### Option A: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
   VITE_TWILIO_AUTH_TOKEN=your_twilio_token
   VITE_TWILIO_PHONE_NUMBER=+1234567890
   VITE_SMTP_HOST=smtp.gmail.com
   VITE_SMTP_PORT=587
   VITE_SMTP_USER=your_email@gmail.com
   VITE_SMTP_PASSWORD=your_app_password
   VITE_APP_URL=https://yourdomain.com
   ```
6. Click **Deploy**

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Step 6: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **Add new site** > **Import an existing project**
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add Environment Variables in **Site settings** > **Environment variables**
6. Deploy

## Step 7: Configure Custom Domain (Optional)

1. In your hosting platform, go to Domain settings
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase Site URL to match your custom domain

## Step 8: Set Up Environment Variables

Set all environment variables in your hosting platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_PHONE_NUMBER=+1234567890
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASSWORD=your_app_password
VITE_SMTP_FROM=noreply@yourdomain.com
VITE_APP_URL=https://yourdomain.com
VITE_API_VERSION=v1
```

## Step 9: Create Admin User

1. Go to Supabase Dashboard > **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Fill in admin credentials
4. Create user profile in SQL Editor:
   ```sql
   INSERT INTO users (id, tenant_id, email, first_name, last_name, role)
   VALUES (
     'USER_UUID_HERE',  -- Replace with UUID from step above
     '00000000-0000-0000-0000-000000000001',  -- Your tenant ID
     'admin@yourdomain.com',
     'Admin',
     'User',
     'admin'
   );
   ```

## Step 10: Configure Email Service

### Gmail SMTP Setup

1. Enable 2-Step Verification on your Google account
2. Generate an App Password:
   - Go to Google Account > Security
   - Under "Signing in to Google", select App passwords
   - Generate password for "Mail"
3. Use the app password in `VITE_SMTP_PASSWORD`

### Other SMTP Providers

Update the SMTP settings in environment variables according to your provider's documentation.

## Step 11: Configure SMS Service (Twilio)

1. Sign up at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Add credentials to environment variables

## Step 12: Set Up Database Backups

1. In Supabase Dashboard, go to **Database** > **Backups**
2. Enable automated daily backups
3. Configure retention policy

## Step 13: Set Up Monitoring

1. Enable Supabase logging and monitoring
2. Set up error tracking (Sentry, LogRocket, etc.)
3. Monitor API usage and limits
4. Set up alerts for critical issues

## Step 14: Security Checklist

- [ ] Enable Row-Level Security (RLS) on all tables
- [ ] Use `anon` key for client-side (never expose `service_role` key)
- [ ] Enable email confirmations
- [ ] Use HTTPS (automatic with Vercel/Netlify)
- [ ] Set up CORS properly in Supabase
- [ ] Enable rate limiting in Supabase
- [ ] Use strong passwords for admin accounts
- [ ] Enable 2FA on Supabase account
- [ ] Review and test RLS policies
- [ ] Set up audit logging
- [ ] Configure proper error handling

## Step 15: Testing

1. Test authentication flow
2. Test all major features
3. Test on different browsers
4. Test mobile responsiveness
5. Test with different user roles
6. Verify notifications (SMS/Email)
7. Test transaction processing
8. Verify data isolation (multi-tenant)

## Step 16: Go Live

1. Update DNS records if using custom domain
2. Verify SSL certificate is active
3. Create initial admin user
4. Test production deployment
5. Monitor logs for errors
6. Announce launch!

## Post-Deployment

### Regular Maintenance

- Monitor error logs
- Review audit logs
- Update dependencies regularly
- Backup database regularly
- Monitor performance metrics
- Review security alerts

### Scaling Considerations

- Monitor Supabase usage limits
- Consider upgrading Supabase plan if needed
- Optimize database queries
- Use caching where appropriate
- Consider CDN for static assets

## Troubleshooting

### Build Errors

- Check Node.js version (should be 18+)
- Clear node_modules and reinstall
- Check for TypeScript errors
- Verify all environment variables are set

### Runtime Errors

- Check browser console for errors
- Check Supabase logs
- Verify environment variables
- Check RLS policies
- Verify user permissions

### Database Connection Issues

- Verify Supabase project is active
- Check API keys are correct
- Verify network connectivity
- Check Supabase status page

## Support

For issues and questions:
- Check documentation
- Review Supabase logs
- Check GitHub issues
- Contact support team

---

**Congratulations! Your HUMPBANK system is now deployed to production!** 🎉

