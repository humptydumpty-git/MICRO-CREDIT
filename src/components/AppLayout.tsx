import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import {
  mockCustomers,
  mockAccounts,
  loansWithCustomers,
  mockTransactions,
  mockLoanProducts,
  mockNotifications,
  mockDashboardStats,
} from '../data/mockData';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import CustomerManagement from './CustomerManagement';
import LoanManagement from './LoanManagement';
import AccountManagement from './AccountManagement';
import TransactionHistory from './TransactionHistory';
import LoanCalculator from './LoanCalculator';
import SavingsManagement from './SavingsManagement';
import Reports from './Reports';
import AuditLogs from './AuditLogs';
import Settings from './Settings';
import Modals from './Modals';
import LoginModal from './auth/LoginModal';
import SignupModal from './auth/SignupModal';
import ForgotPasswordModal from './auth/ForgotPasswordModal';
import { ShieldIcon, UserIcon, CreditCardIcon } from './ui/Icons';

// Protected Route Component
const ProtectedContent: React.FC<{
  permission?: string;
  children: React.ReactNode;
}> = ({ permission, children }) => {
  const { isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) {
    return <AccessDenied type="login" />;
  }

  if (permission && !hasPermission(permission)) {
    return <AccessDenied type="permission" />;
  }

  return <>{children}</>;
};

// Access Denied Component
const AccessDenied: React.FC<{ type: 'login' | 'permission' }> = ({ type }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  if (type === 'login') {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <UserIcon className="text-emerald-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Please sign in to access the micro credit banking platform and manage your financial operations.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowSignupModal(true)}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Create Account
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl max-w-md">
            <p className="text-sm font-medium text-gray-700 mb-3">Demo Credentials:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg">
                <p className="font-medium text-gray-900">Admin</p>
                <p className="text-gray-500">admin@microfinance.com</p>
                <p className="text-gray-400">admin123</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <p className="font-medium text-gray-900">Manager</p>
                <p className="text-gray-500">manager@microfinance.com</p>
                <p className="text-gray-400">manager123</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <p className="font-medium text-gray-900">Staff</p>
                <p className="text-gray-500">staff@microfinance.com</p>
                <p className="text-gray-400">staff123</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <p className="font-medium text-gray-900">Agent</p>
                <p className="text-gray-500">agent@microfinance.com</p>
                <p className="text-gray-400">agent123</p>
              </div>
            </div>
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
          onForgotPassword={() => {
            setShowLoginModal(false);
            setShowForgotPasswordModal(true);
          }}
        />
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
          onBackToLogin={() => {
            setShowForgotPasswordModal(false);
            setShowLoginModal(true);
          }}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <ShieldIcon className="text-red-600" size={40} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-500 mb-6 max-w-md">
        You don't have permission to access this section. Please contact your administrator if you believe this is an error.
      </p>
      <button
        onClick={() => useAppStore.getState().setActiveView('dashboard')}
        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const {
    activeView,
    sidebarOpen,
    setCustomers,
    setAccounts,
    setLoans,
    setTransactions,
    setLoanProducts,
    setNotifications,
    setDashboardStats,
  } = useAppStore();

  const { isAuthenticated, user } = useAuthStore();

  // Initialize data on mount
  useEffect(() => {
    setCustomers(mockCustomers);
    setAccounts(mockAccounts);
    setLoans(loansWithCustomers);
    setTransactions(mockTransactions);
    setLoanProducts(mockLoanProducts);
    setNotifications(mockNotifications);
    setDashboardStats(mockDashboardStats);
  }, []);

  const renderContent = () => {
    // Dashboard is accessible to everyone (but shows login prompt if not authenticated)
    if (activeView === 'dashboard') {
      if (!isAuthenticated) {
        return <AccessDenied type="login" />;
      }
      return <Dashboard />;
    }

    // Loan Calculator is public
    if (activeView === 'calculator') {
      return <LoanCalculator />;
    }

    // Protected views with specific permissions
    const viewPermissions: Record<string, string | undefined> = {
      customers: 'view_customers',
      loans: 'view_loans',
      accounts: 'view_accounts',
      savings: 'view_accounts',
      transactions: 'view_transactions',
      reports: 'view_reports',
      audit: 'view_audit_logs',
      settings: 'manage_settings',
    };

    const permission = viewPermissions[activeView];

    const viewComponents: Record<string, React.ReactNode> = {
      customers: <CustomerManagement />,
      loans: <LoanManagement />,
      accounts: <AccountManagement />,
      savings: <SavingsManagement />,
      transactions: <TransactionHistory />,
      reports: <Reports />,
      audit: <AuditLogs />,
      settings: <Settings />,
    };

    const component = viewComponents[activeView];

    if (component) {
      return (
        <ProtectedContent permission={permission}>
          {component}
        </ProtectedContent>
      );
    }

    // Default to dashboard
    if (!isAuthenticated) {
      return <AccessDenied type="login" />;
    }
    return <Dashboard />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="pt-16 min-h-screen">
          <div className="p-4 lg:p-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <Modals />
    </div>
  );
};

export default AppLayout;
