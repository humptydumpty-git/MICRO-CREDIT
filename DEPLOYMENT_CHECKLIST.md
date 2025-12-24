# Production Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment

### 1. Code Quality ✅
- [x] All critical bugs fixed
- [x] TypeScript errors resolved (minor warnings acceptable)
- [x] Code reviewed
- [x] No console.log statements in production code
- [x] Error handling implemented
- [x] Input validation added

### 2. Environment Setup
- [ ] Create production Supabase project
- [ ] Set up production database
- [ ] Run all migrations in production database
- [ ] Create production environment variables
- [ ] Verify all environment variables are set:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Test database connection

### 3. Database Configuration
- [ ] Run migration: `supabase/migrations/001_initial_schema.sql`
- [ ] Create default tenant (if needed)
- [ ] Set up database backups
- [ ] Verify Row Level Security (RLS) policies are active
- [ ] Test RLS policies with different user roles
- [ ] Create initial admin user
- [ ] Verify user can log in

### 4. Authentication Setup
- [ ] Configure Supabase Auth settings:
  - [ ] Enable email provider
  - [ ] Set Site URL to production domain
  - [ ] Configure email templates (if custom)
  - [ ] Set up email confirmation (recommended for production)
  - [ ] Configure password reset settings
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test password reset flow

### 5. Security Checklist
- [ ] Environment variables are NOT committed to git
- [ ] `.env` file is in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] RLS policies are enabled on all tables
- [ ] API keys are restricted (if possible)
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting considered (Supabase handles this)

### 6. Testing
- [ ] Manual testing of all features:
  - [ ] User registration
  - [ ] User login/logout
  - [ ] Create customer
  - [ ] Update customer
  - [ ] Create loan application
  - [ ] Approve loan
  - [ ] Disburse loan
  - [ ] View dashboard
  - [ ] View reports
  - [ ] All CRUD operations
- [ ] Test error scenarios:
  - [ ] Invalid login credentials
  - [ ] Network errors
  - [ ] Form validation errors
  - [ ] Permission errors
- [ ] Test on different browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Test on mobile devices (if applicable)

### 7. Performance
- [ ] Build production bundle: `npm run build`
- [ ] Check bundle size (should be reasonable)
- [ ] Test page load times
- [ ] Verify images are optimized
- [ ] Check for unnecessary dependencies
- [ ] Enable production optimizations

### 8. Documentation
- [ ] README.md is up to date
- [ ] SETUP.md is accurate
- [ ] API documentation (if applicable)
- [ ] Deployment guide created
- [ ] Troubleshooting guide available

## Deployment Steps

### Step 1: Build Application
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build output
ls -la dist/
```

### Step 2: Deploy to Hosting Platform

#### Option A: Vercel
1. [ ] Install Vercel CLI: `npm i -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Set environment variables in Vercel dashboard
4. [ ] Deploy: `vercel --prod`
5. [ ] Verify deployment URL

#### Option B: Netlify
1. [ ] Install Netlify CLI: `npm i -g netlify-cli`
2. [ ] Login: `netlify login`
3. [ ] Set environment variables in Netlify dashboard
4. [ ] Deploy: `netlify deploy --prod`
5. [ ] Verify deployment URL

#### Option C: Other Platform
- [ ] Follow platform-specific deployment instructions
- [ ] Set environment variables
- [ ] Configure build settings:
  - Build command: `npm run build`
  - Output directory: `dist`
  - Node version: 18+

### Step 3: Configure Domain (Optional)
- [ ] Add custom domain in hosting platform
- [ ] Update DNS records
- [ ] Update Supabase Auth Site URL
- [ ] Wait for DNS propagation
- [ ] Test with custom domain

### Step 4: Post-Deployment Verification

#### Immediate Checks
- [ ] Application loads correctly
- [ ] No console errors
- [ ] Login works
- [ ] Database connection works
- [ ] API calls succeed
- [ ] Forms submit correctly

#### Functional Testing
- [ ] Create a test customer
- [ ] Create a test loan
- [ ] Verify data persists
- [ ] Test all major features
- [ ] Verify error handling works

#### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response times acceptable
- [ ] No memory leaks
- [ ] Smooth user interactions

## Post-Deployment

### 1. Monitoring Setup
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Set up analytics (Google Analytics, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure alerts for critical errors
- [ ] Set up performance monitoring

### 2. Backup Strategy
- [ ] Configure Supabase database backups
- [ ] Test backup restoration
- [ ] Document backup schedule
- [ ] Set up automated backups

### 3. Documentation
- [ ] Document production URLs
- [ ] Document admin credentials (securely)
- [ ] Document support contacts
- [ ] Create runbook for common issues

### 4. Team Communication
- [ ] Notify team of deployment
- [ ] Share production URLs
- [ ] Document any known issues
- [ ] Set up communication channels for issues

### 5. Rollback Plan
- [ ] Document rollback procedure
- [ ] Keep previous deployment accessible
- [ ] Test rollback process
- [ ] Have rollback decision criteria

## Environment Variables Template

Create a `.env.production` file (DO NOT COMMIT):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Deployment Commands Reference

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint

# Type check (if using tsc)
npx tsc --noEmit
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Working
- Check variable names start with `VITE_`
- Restart dev server after changing `.env`
- Verify variables are set in hosting platform
- Check for typos in variable names

#### 2. Database Connection Errors
- Verify Supabase URL and key are correct
- Check Supabase project is active (not paused)
- Verify RLS policies allow access
- Check network connectivity

#### 3. Authentication Issues
- Verify Site URL in Supabase Auth settings
- Check email confirmation settings
- Verify redirect URLs are configured
- Check user exists in both auth.users and public.users

#### 4. Build Errors
- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify all dependencies are installed
- Check for TypeScript errors

#### 5. CORS Errors
- Verify Supabase CORS settings
- Check API endpoint URLs
- Verify request headers

## Rollback Procedure

If deployment fails:

1. **Immediate Rollback**:
   ```bash
   # Revert to previous deployment
   vercel rollback  # or platform-specific command
   ```

2. **Database Rollback** (if needed):
   - Restore from backup
   - Or manually revert data changes

3. **Investigate**:
   - Check error logs
   - Review recent changes
   - Test locally with production config

## Success Criteria

Deployment is successful when:
- ✅ Application loads without errors
- ✅ All features work as expected
- ✅ Data persists correctly
- ✅ No console errors
- ✅ Performance is acceptable
- ✅ Security measures are in place

## Support Contacts

- **Technical Issues**: [Your contact]
- **Database Issues**: Supabase Support
- **Hosting Issues**: [Hosting platform support]

## Notes

- Keep this checklist updated as you deploy
- Document any platform-specific steps
- Save deployment logs for reference
- Update checklist based on lessons learned

---

**Last Updated**: [Date]
**Deployed By**: [Name]
**Deployment Version**: [Version]

