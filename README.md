# 🏦 HUMPBANK - Micro Credit & Savings Banking System

A comprehensive, production-ready multi-tenant banking system for micro credit and savings operations, built with Supabase backend.

## 🎯 Overview

HUMPBANK is a full-featured banking system designed for microfinance institutions and banks. It supports multiple banks as tenants, each with their own isolated data. The system provides comprehensive features for both micro credit and micro savings operations.

## ✨ Key Features

### Core Banking Features
- ✅ **Multi-Tenant Architecture** - Each bank operates independently with isolated data
- ✅ **Customer Management** - Complete KYC and customer lifecycle management
- ✅ **Account Management** - Savings, Current, and Loan accounts
- ✅ **Micro Credit System** - Loan origination, disbursement, repayment tracking
- ✅ **Micro Savings System** - Savings accounts with interest calculation
- ✅ **Transaction Processing** - Real-time transaction handling
- ✅ **Payment Gateway Integration** - Secure payment processing

### Advanced Features
- ✅ **Credit Scoring** - Automated credit assessment
- ✅ **Interest Calculation** - Flexible interest rate management
- ✅ **Loan Repayment Schedules** - Automated schedule generation
- ✅ **SMS Notifications** - Real-time SMS alerts via Twilio
- ✅ **Email Notifications** - Transaction and account alerts
- ✅ **Account Balance Checking** - Remote account access
- ✅ **Audit Logging** - Complete audit trail
- ✅ **Reports & Analytics** - Comprehensive reporting system

### Security Features
- ✅ **Row-Level Security (RLS)** - Database-level security
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-Based Access Control** - Granular permissions
- ✅ **Data Encryption** - Encrypted sensitive data
- ✅ **Rate Limiting** - API protection
- ✅ **CORS Protection** - Cross-origin security

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Authentication**: Supabase Auth (JWT)
- **Database**: PostgreSQL 15+ (via Supabase)
- **Real-time**: Supabase Realtime
- **Notifications**: Twilio (SMS), Nodemailer (Email)
- **Payment Gateway**: Stripe Integration Ready
- **Deployment**: Vercel/Netlify (Frontend), Supabase (Backend)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier sufficient for development)
- Twilio account (for SMS notifications)
- SMTP server (for email notifications)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HUMPBANK/humpbank
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Copy `.env.example` to `.env` and fill in your credentials

### 4. Run Database Migrations

1. Go to Supabase Dashboard > SQL Editor
2. Copy and run all SQL files from `supabase/migrations/` in order

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 📁 Project Structure

```
humpbank/
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── accounts/     # Account management
│   │   ├── loans/        # Loan management
│   │   ├── savings/      # Savings management
│   │   ├── transactions/ # Transaction components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── notifications/# Notification components
│   │   ├── settings/     # Settings components
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utilities and configurations
│   ├── services/         # API services
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions
│   └── pages/            # Page components
├── supabase/
│   └── migrations/       # Database migration files
├── docs/                 # Documentation
├── public/               # Static assets
└── package.json
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio (SMS)
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email (SMTP)
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASSWORD=your_app_password

# Application
VITE_APP_URL=http://localhost:5173
VITE_API_VERSION=v1
```

## 🗄️ Database Schema

HUMPBANK uses a multi-tenant architecture where each bank (tenant) has isolated data. Key tables:

- `tenants` - Bank/tenant information
- `users` - System users (admins, officers, customers)
- `customers` - Customer information
- `accounts` - Bank accounts (Savings, Current, Loan)
- `transactions` - All financial transactions
- `loans` - Loan records
- `loan_products` - Loan product definitions
- `loan_repayment_schedules` - Repayment schedules
- `savings_products` - Savings product definitions
- `notifications` - Notification records
- `audit_logs` - System audit trail

See `docs/DATABASE_SCHEMA.md` for detailed schema documentation.

## 🔒 Security

- All tables have Row-Level Security (RLS) enabled
- JWT tokens for authentication
- Role-based access control (Admin, Officer, Customer)
- Data encryption at rest and in transit
- Rate limiting on API endpoints
- CORS protection

## 📱 Multi-Tenant Architecture

Each bank operates as an independent tenant with:
- Isolated database records (via tenant_id)
- Independent configuration
- Separate user management
- Own branding and settings

## 📚 Documentation

- [Setup Guide](./docs/SETUP.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Guide](./docs/SECURITY.md)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🚢 Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. **Frontend**: Deploy to Vercel/Netlify
2. **Database**: Already hosted on Supabase
3. **Environment Variables**: Set in hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@humpbank.com or open an issue on GitHub.

## ⭐ Show Your Support

Give a ⭐ if this project helped you!

---

**Built with ❤️ for Microfinance Institutions**

