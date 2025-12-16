import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore, UserRole } from '../store/authStore';
import {
  SearchIcon,
  BellIcon,
  MenuIcon,
  PlusIcon,
  ChevronDownIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  ShieldIcon,
} from './ui/Icons';
import LoginModal from './auth/LoginModal';
import SignupModal from './auth/SignupModal';
import ForgotPasswordModal from './auth/ForgotPasswordModal';

const Header: React.FC = () => {
  const {
    toggleSidebar,
    sidebarOpen,
    searchQuery,
    setSearchQuery,
    notifications,
    openModal,
    activeView,
  } = useAppStore();

  const { user, isAuthenticated, logout, hasPermission } = useAuthStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard Overview',
      customers: 'Customer Management',
      loans: 'Loan Management',
      accounts: 'Account Management',
      savings: 'Savings & Deposits',
      transactions: 'Transaction History',
      calculator: 'Loan Calculator',
      reports: 'Reports & Analytics',
      audit: 'Audit Logs',
      settings: 'System Settings',
    };
    return titles[activeView] || 'Dashboard';
  };

  const quickActions = [
    { label: 'New Customer', action: () => openModal('newCustomer'), permission: 'create_customers' },
    { label: 'New Loan Application', action: () => openModal('newLoan'), permission: 'create_loan_applications' },
    { label: 'Record Transaction', action: () => openModal('newTransaction'), permission: 'create_transactions' },
    { label: 'Loan Calculator', action: () => openModal('loanCalculator'), permission: null },
  ].filter(action => !action.permission || hasPermission(action.permission));

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      super_admin: 'bg-purple-100 text-purple-700',
      admin: 'bg-red-100 text-red-700',
      manager: 'bg-blue-100 text-blue-700',
      staff: 'bg-green-100 text-green-700',
      agent: 'bg-orange-100 text-orange-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowForgotPasswordModal(false);
    setShowLoginModal(true);
  };

  const switchToForgotPassword = () => {
    setShowLoginModal(false);
    setShowForgotPasswordModal(true);
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30 transition-all duration-300 ${
          sidebarOpen ? 'left-64' : 'left-20'
        }`}
      >
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MenuIcon size={20} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-NG', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search customers, loans, transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Quick Actions */}
                {quickActions.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
                    >
                      <PlusIcon size={18} />
                      <span className="hidden sm:inline text-sm font-medium">Quick Action</span>
                      <ChevronDownIcon size={16} />
                    </button>

                    {showQuickActions && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowQuickActions(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                          {quickActions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                action.action();
                                setShowQuickActions(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <BellIcon size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowNotifications(false)}
                      />
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.slice(0, 5).map((notif) => (
                              <div
                                key={notif.id}
                                className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                  !notif.is_read ? 'bg-emerald-50/50' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                                      notif.type === 'warning'
                                        ? 'bg-orange-500'
                                        : notif.type === 'success'
                                        ? 'bg-emerald-500'
                                        : 'bg-blue-500'
                                    }`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {notif.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                      {notif.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(notif.created_at).toLocaleString('en-NG', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                              No notifications
                            </div>
                          )}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                          <button className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                            View all notifications
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.first_name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                        {user.first_name.charAt(0)}
                        {user.last_name.charAt(0)}
                      </div>
                    )}
                    <ChevronDownIcon size={16} className="text-gray-400" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.first_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                                {user.first_name.charAt(0)}
                                {user.last_name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="py-2">
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <UserIcon size={18} className="text-gray-400" />
                            My Profile
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <SettingsIcon size={18} className="text-gray-400" />
                            Account Settings
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <ShieldIcon size={18} className="text-gray-400" />
                            Security
                          </button>
                        </div>
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOutIcon size={18} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={switchToSignup}
        onForgotPassword={switchToForgotPassword}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={switchToLogin}
      />
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onBackToLogin={switchToLogin}
      />
    </>
  );
};

export default Header;
