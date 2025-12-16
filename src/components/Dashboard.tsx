import React from 'react';
import { useAppStore } from '../store/appStore';
import { formatCurrency, formatDate, getStatusColor, getTierColor } from '../lib/utils';
import {
  UsersIcon,
  CreditCardIcon,
  DollarIcon,
  TrendingUpIcon,
  AlertIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRightIcon,
  PiggyBankIcon,
} from './ui/Icons';

const Dashboard: React.FC = () => {
  const { dashboardStats, loans, customers, transactions, setActiveView, setSelectedLoan, openModal } = useAppStore();

  const recentLoans = loans.slice(0, 5);
  const recentTransactions = transactions.slice(0, 6);
  const pendingLoans = loans.filter((l) => l.status === 'pending' || l.status === 'applied');
  const overdueLoans = loans.filter((l) => l.status === 'overdue');

  const stats = [
    {
      label: 'Total Customers',
      value: dashboardStats.totalCustomers.toLocaleString(),
      icon: UsersIcon,
      change: '+12%',
      positive: true,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Loans',
      value: dashboardStats.activeLoans.toLocaleString(),
      icon: CreditCardIcon,
      change: '+8%',
      positive: true,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Total Disbursed',
      value: formatCurrency(dashboardStats.totalDisbursed),
      icon: DollarIcon,
      change: '+15%',
      positive: true,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Collected',
      value: formatCurrency(dashboardStats.totalCollected),
      icon: TrendingUpIcon,
      change: '+22%',
      positive: true,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Pending Applications',
      value: dashboardStats.pendingApplications.toLocaleString(),
      icon: ClockIcon,
      change: '-3%',
      positive: false,
      color: 'from-yellow-500 to-orange-400',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Overdue Loans',
      value: dashboardStats.overdueLoans.toLocaleString(),
      icon: AlertIcon,
      change: '-5%',
      positive: true,
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Savings Balance',
      value: formatCurrency(dashboardStats.savingsBalance),
      icon: PiggyBankIcon,
      change: '+18%',
      positive: true,
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
    },
    {
      label: 'Monthly Growth',
      value: `${dashboardStats.monthlyGrowth}%`,
      icon: TrendingUpIcon,
      change: '+2.5%',
      positive: true,
      color: 'from-indigo-500 to-violet-500',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div
        className="relative rounded-2xl overflow-hidden bg-cover bg-center h-48"
        style={{
          backgroundImage:
            'url(https://d64gsuwffb70l.cloudfront.net/69409a65531b674cdffc8cad_1765841648067_163bf96c.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
        <div className="relative h-full flex items-center px-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back, Sarah!
            </h2>
            <p className="text-slate-300 text-lg">
              Here's what's happening with your micro credit platform today.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => openModal('newLoan')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                New Loan Application
              </button>
              <button
                onClick={() => setActiveView('reports')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm transition-colors"
              >
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`text-${stat.color.split('-')[1]}-600`} size={22} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.positive ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {stat.positive ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Loans */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Loan Applications</h3>
            <button
              onClick={() => setActiveView('loans')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View all <ChevronRightIcon size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLoans.map((loan) => {
                  const customer = customers.find((c) => c.id === loan.customer_id);
                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedLoan(loan);
                        openModal('loanDetails');
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {customer?.profile_image ? (
                            <img
                              src={customer.profile_image}
                              alt={customer.first_name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                              {customer?.first_name?.charAt(0)}
                              {customer?.last_name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {customer?.first_name} {customer?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{loan.loan_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(loan.principal_amount)}
                        </p>
                        <p className="text-xs text-gray-500">{loan.tenure_months} months</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            loan.status
                          )}`}
                        >
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(loan.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          {pendingLoans.length > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ClockIcon className="text-orange-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Pending Approvals</h4>
                  <p className="text-sm text-gray-600">
                    {pendingLoans.length} application(s) waiting
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {pendingLoans.slice(0, 3).map((loan) => {
                  const customer = customers.find((c) => c.id === loan.customer_id);
                  return (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {customer?.first_name} {customer?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(loan.principal_amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedLoan(loan);
                          openModal('loanDetails');
                        }}
                        className="text-xs font-medium text-orange-600 hover:text-orange-700"
                      >
                        Review
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Overdue Alerts */}
          {overdueLoans.length > 0 && (
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertIcon className="text-red-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Overdue Payments</h4>
                  <p className="text-sm text-gray-600">
                    {overdueLoans.length} loan(s) overdue
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {overdueLoans.slice(0, 3).map((loan) => {
                  const customer = customers.find((c) => c.id === loan.customer_id);
                  return (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {customer?.first_name} {customer?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          EMI: {formatCurrency(loan.emi_amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedLoan(loan);
                          openModal('loanDetails');
                        }}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Follow up
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h4 className="font-semibold text-gray-900">Recent Transactions</h4>
            </div>
            <div className="p-4 space-y-3">
              {recentTransactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      txn.transaction_type === 'credit' ||
                      txn.transaction_type === 'deposit' ||
                      txn.transaction_type === 'loan_disbursement'
                        ? 'bg-emerald-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {txn.transaction_type === 'credit' ||
                    txn.transaction_type === 'deposit' ||
                    txn.transaction_type === 'loan_disbursement' ? (
                      <ArrowDownIcon className="text-emerald-600" size={18} />
                    ) : (
                      <ArrowUpIcon className="text-red-600" size={18} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {txn.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(txn.created_at)}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      txn.transaction_type === 'credit' ||
                      txn.transaction_type === 'deposit' ||
                      txn.transaction_type === 'loan_disbursement'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {txn.transaction_type === 'credit' ||
                    txn.transaction_type === 'deposit' ||
                    txn.transaction_type === 'loan_disbursement'
                      ? '+'
                      : '-'}
                    {formatCurrency(txn.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Top Customers</h3>
          <button
            onClick={() => setActiveView('customers')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            View all <ChevronRightIcon size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          {customers.slice(0, 4).map((customer) => (
            <div
              key={customer.id}
              className="p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
              onClick={() => {
                useAppStore.getState().setSelectedCustomer(customer);
                openModal('customerDetails');
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                {customer.profile_image ? (
                  <img
                    src={customer.profile_image}
                    alt={customer.first_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                    {customer.first_name.charAt(0)}
                    {customer.last_name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getTierColor(
                      customer.tier
                    )}`}
                  >
                    {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Credit Score</p>
                  <p className="font-semibold text-gray-900">{customer.credit_score}</p>
                </div>
                <div>
                  <p className="text-gray-500">KYC</p>
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                      customer.kyc_status
                    )}`}
                  >
                    {customer.kyc_status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
