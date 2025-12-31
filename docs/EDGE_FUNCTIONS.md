# Edge Functions Setup Guide

This guide explains how to set up and deploy Supabase Edge Functions for HUMPBANK.

## Prerequisites

1. Supabase CLI installed
2. Supabase project created
3. Edge Functions enabled in your Supabase project

## Setup

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

## Available Edge Functions

### 1. Send SMS (send-sms)

Sends SMS notifications via Twilio.

**Environment Variables:**
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number

**Usage:**
```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: '+1234567890',
    message: 'Your account balance is N10,000',
    tenant_id: 'tenant-uuid',
  }),
})
```

### 2. Send Email (send-email)

Sends email notifications via SMTP.

**Environment Variables:**
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `SMTP_FROM` - From email address

**Usage:**
```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'customer@example.com',
    subject: 'Account Statement',
    message: '<h1>Your statement is ready</h1>',
    tenant_id: 'tenant-uuid',
  }),
})
```

### 3. Process Payment (process-payment)

Processes payments via Stripe.

**Environment Variables:**
- `STRIPE_SECRET_KEY` - Your Stripe secret key

**Usage:**
```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/process-payment`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 10000,
    currency: 'NGN',
    account_id: 'account-uuid',
    tenant_id: 'tenant-uuid',
    payment_method_id: 'pm_xxxxx',
  }),
})
```

## Deployment

1. Deploy a function:
```bash
supabase functions deploy send-sms
supabase functions deploy send-email
supabase functions deploy process-payment
```

2. Set environment variables:
```bash
supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_USER=your_email@gmail.com
supabase secrets set SMTP_PASSWORD=your_password
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
```

## Testing Locally

1. Start Supabase locally:
```bash
supabase start
```

2. Serve functions locally:
```bash
supabase functions serve
```

3. Test the function:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-sms' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"phone":"+1234567890","message":"Test message","tenant_id":"uuid"}'
```

## Production Considerations

- Always use environment variables for sensitive data
- Enable rate limiting on Edge Functions
- Monitor function execution and errors
- Set up alerts for failed function executions
- Use proper error handling and logging

