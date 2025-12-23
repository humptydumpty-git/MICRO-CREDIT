# Micro Credit Banking Platform

A comprehensive multi-tenant micro credit and banking platform built with React, TypeScript, and Supabase.

## Features

- **Customer Management**: Complete customer lifecycle management with KYC tracking
- **Loan Management**: Loan applications, approvals, disbursements, and tracking
- **Account Management**: Savings and current accounts with transaction history
- **Transaction Processing**: Multi-channel transaction processing (web, mobile, agent, bank)
- **Loan Products**: Configurable loan products with flexible interest rates
- **Reports & Analytics**: Comprehensive dashboard with real-time statistics
- **Audit Logs**: Complete audit trail for all system activities
- **Multi-tenant**: Support for multiple organizations with data isolation
- **Role-based Access Control**: Granular permissions for different user roles

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Routing**: React Router
- **Form Handling**: React Hook Form, Zod

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account (free tier works fine)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MICRO-CREDIT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Go to Project Settings > API and copy your:
      - Project URL
      - `anon` `public` API key
   
   c. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up the database**
   
   a. In Supabase Dashboard, go to SQL Editor
   
   b. Run the migration file `supabase/migrations/001_initial_schema.sql`
      - This creates all necessary tables, indexes, and RLS policies
   
   c. (Optional) Create a default tenant:
      ```sql
      INSERT INTO tenants (id, name, subdomain, status) 
      VALUES ('00000000-0000-0000-0000-000000000001', 'MicroFinance Pro', 'mfpro', 'active');
      ```

5. **Set up authentication**
   
   a. In Supabase Dashboard, go to Authentication > Settings
   
   b. Enable Email provider (should be enabled by default)
   
   c. Configure email templates if needed
   
   d. (For development) You can disable email confirmation:
      - Go to Authentication > Settings > Email Auth
      - Toggle "Enable email confirmations" OFF

6. **Create your first admin user**
   
   You'll need to create a user manually in Supabase:
   
   a. Go to Authentication > Users in Supabase Dashboard
   
   b. Click "Add User" and create a user with email/password
   
   c. Copy the user ID (UUID)
   
   d. In SQL Editor, insert the user profile:
      ```sql
      INSERT INTO users (id, tenant_id, email, first_name, last_name, role)
      VALUES (
        'your-user-id-here',
        '00000000-0000-0000-0000-000000000001',
        'admin@example.com',
        'Admin',
        'User',
        'admin'
      );
      ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Project Structure

```
MICRO-CREDIT/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── ui/            # Reusable UI components
│   │   └── ...            # Feature components
│   ├── contexts/          # React contexts
│   ├── data/              # Mock data (for development)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configurations
│   │   ├── supabase.ts   # Supabase client
│   │   └── utils.ts      # Helper functions
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   │   └── api.ts        # All API calls
│   ├── store/             # Zustand stores
│   │   ├── authStore.ts  # Authentication state
│   │   └── appStore.ts   # Application state
│   ├── types/             # TypeScript type definitions
│   └── ...
├── supabase/
│   └── migrations/        # Database migrations
├── .env.example           # Environment variables template
└── package.json
```

## Database Schema

The application uses the following main tables:

- `tenants` - Multi-tenant organization data
- `users` - User profiles (extends Supabase auth.users)
- `customers` - Customer records
- `accounts` - Bank accounts (savings, current, etc.)
- `loans` - Loan records
- `loan_products` - Loan product configurations
- `transactions` - Transaction history
- `loan_repayments` - Loan repayment tracking
- `savings_goals` - Savings goal tracking
- `notifications` - System notifications
- `audit_logs` - Audit trail

All tables use Row Level Security (RLS) to ensure data isolation between tenants.

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

Never commit your `.env` file to version control!

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **Database Changes**: Add migration files in `supabase/migrations/`
2. **API Integration**: Add methods to `src/services/api.ts`
3. **State Management**: Update stores in `src/store/`
4. **Components**: Create components in `src/components/`

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to Vercel/Netlify

1. Connect your GitHub repository
2. Set environment variables in the deployment platform
3. Build command: `npm run build`
4. Output directory: `dist`

## Security Considerations

- All API keys should be in environment variables
- Row Level Security (RLS) is enabled on all tables
- Never expose service role keys in client code
- Always validate user permissions on the backend
- Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.
