import React from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import {
  DashboardIcon,
  UsersIcon,
  CreditCardIcon,
  WalletIcon,
  BankIcon,
  ChartIcon,
  SettingsIcon,
  PiggyBankIcon,
  CalculatorIcon,
  FileTextIcon,
  ChevronRightIcon,
  LogOutIcon,
  ShieldIcon,
} from './ui/Icons';

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string; size?: number }>;
  badge?: number;
  permission?: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'customers', label: 'Customers', icon: UsersIcon, permission: 'view_customers' },
  { id: 'loans', label: 'Loan Management', icon: CreditCardIcon, permission: 'view_loans' },
  { id: 'accounts', label: 'Accounts', icon: BankIcon, permission: 'view_accounts' },
  { id: 'savings', label: 'Savings', icon: PiggyBankIcon, permission: 'view_accounts' },
  { id: 'transactions', label: 'Transactions', icon: WalletIcon, permission: 'view_transactions' },
  { id: 'calculator', label: 'Loan Calculator', icon: CalculatorIcon },
  { id: 'reports', label: 'Reports', icon: ChartIcon, permission: 'view_reports' },
  { id: 'audit', label: 'Audit Logs', icon: FileTextIcon, permission: 'view_audit_logs' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, permission: 'manage_settings' },
];

const Sidebar: React.FC = () => {
  const { activeView, setActiveView, sidebarOpen, currentTenant, dashboardStats } = useAppStore();
  const { user, isAuthenticated, logout, hasPermission, hasRole } = useAuthStore();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    if (!isAuthenticated) return false;
    return hasPermission(item.permission);
  });

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-500',
      admin: 'bg-red-500',
      manager: 'bg-blue-500',
      staff: 'bg-green-500',
      agent: 'bg-orange-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-lg">
            MC
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg leading-tight truncate">
                {currentTenant?.name || 'MicroCredit'}
              </h1>
              <p className="text-xs text-slate-400">Banking Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* User Role Badge (when authenticated) */}
      {isAuthenticated && user && sidebarOpen && (
        <div className="px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <ShieldIcon size={16} className="text-slate-400" />
            <span className="text-xs text-slate-400">Role:</span>
            <span
              className={`px-2 py-0.5 text-xs font-medium text-white rounded-full ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {user.role.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto h-[calc(100vh-180px)]">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            const badge =
              item.id === 'loans' ? dashboardStats.pendingApplications : undefined;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-l-4 border-emerald-400'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`}
                    size={20}
                  />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium truncate">
                        {item.label}
                      </span>
                      {badge !== undefined && badge > 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-orange-500 text-white rounded-full">
                          {badge}
                        </span>
                      )}
                      {isActive && <ChevronRightIcon size={16} className="text-emerald-400" />}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900/50">
        {isAuthenticated && user ? (
          sidebarOpen ? (
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.first_name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                  {user.first_name.charAt(0)}
                  {user.last_name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOutIcon size={18} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.first_name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                  {user.first_name.charAt(0)}
                  {user.last_name.charAt(0)}
                </div>
              )}
            </div>
          )
        ) : (
          sidebarOpen && (
            <div className="text-center">
              <p className="text-sm text-slate-400">Not signed in</p>
            </div>
          )
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
