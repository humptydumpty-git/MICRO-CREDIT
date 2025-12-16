import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  ChartIcon,
  DownloadIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  CreditCardIcon,
  DollarIcon,
  PiggyBankIcon,
} from './ui/Icons';

const Reports: React.FC = () => {
  const { loans, customers, accounts, transactions, dashboardStats } = useAppStore();
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: ChartIcon },
    { id: 'loans', label: 'Loan Portfolio', icon: CreditCardIcon },
    { id: 'customers', label: 'Customer Analysis', icon: UsersIcon },
    { id: 'transactions', label: 'Transaction Report', icon: DollarIcon },
    { id: 'savings', label: 'Savings Report', icon: PiggyBankIcon },
  ];

  // Calculate loan portfolio metrics
  const loanMetrics = {
    totalDisbursed: loans.reduce((sum, l) => sum + (l.disbursed_amount || 0), 0),
    totalOutstanding: loans.reduce((sum, l) => sum + l.outstanding_balance, 0),
    totalCollected: loans.reduce((sum, l) => sum + l.total_paid, 0),
    activeLoans: loans.filter((l) => l.status === 'active' || l.status === 'disbursed').length,
    overdueLoans: loans.filter((l) => l.status === 'overdue').length,
    closedLoans: loans.filter((l) => l.status === 'closed').length,
    avgLoanSize: loans.length > 0 ? loans.reduce((sum, l) => sum + l.principal_amount, 0) / loans.length : 0,
    parRate: loans.length > 0 ? (loans.filter((l) => l.status === 'overdue').length / loans.length) * 100 : 0,
  };

  // Customer metrics
  const customerMetrics = {
    total: customers.length,
    verified: customers.filter((c) => c.kyc_status === 'verified').length,
    pending: customers.filter((c) => c.kyc_status === 'pending').length,
    avgCreditScore: customers.length > 0 ? customers.reduce((sum, c) => sum + c.credit_score, 0) / customers.length : 0,
    byTier: {
      bronze: customers.filter((c) => c.tier === 'bronze').length,
      silver: customers.filter((c) => c.tier === 'silver').length,
      gold: customers.filter((c) => c.tier === 'gold').length,
      platinum: customers.filter((c) => c.tier === 'platinum').length,
    },
  };

  // Account metrics
  const accountMetrics = {
    totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
    savingsBalance: accounts.filter((a) => a.account_type === 'savings').reduce((sum, a) => sum + a.balance, 0),
    currentBalance: accounts.filter((a) => a.account_type === 'current').reduce((sum, a) => sum + a.balance, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <ChartIcon size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Reports & Analytics</h2>
              <p className="text-indigo-100">Comprehensive financial insights and performance metrics</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
            <DownloadIcon size={18} />
            Export All
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedReport === report.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                {report.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors">
            Apply
          </button>
        </div>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-100">
                  <TrendingUpIcon className="text-emerald-600" size={22} />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  +12.5%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-4">{formatCurrency(loanMetrics.totalDisbursed)}</p>
              <p className="text-sm text-gray-500">Total Disbursed</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-blue-100">
                  <DollarIcon className="text-blue-600" size={22} />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  +8.3%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-4">{formatCurrency(loanMetrics.totalCollected)}</p>
              <p className="text-sm text-gray-500">Total Collected</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-orange-100">
                  <CreditCardIcon className="text-orange-600" size={22} />
                </div>
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  {loanMetrics.activeLoans}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-4">{formatCurrency(loanMetrics.totalOutstanding)}</p>
              <p className="text-sm text-gray-500">Outstanding Balance</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-purple-100">
                  <PiggyBankIcon className="text-purple-600" size={22} />
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  +15.2%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-4">{formatCurrency(accountMetrics.totalBalance)}</p>
              <p className="text-sm text-gray-500">Total Deposits</p>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Loan Disbursement Trend</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <ChartIcon size={48} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Chart visualization</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Collection Performance</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <ChartIcon size={48} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Chart visualization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loan Portfolio Report */}
      {selectedReport === 'loans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Active Loans</p>
              <p className="text-3xl font-bold text-gray-900">{loanMetrics.activeLoans}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Overdue Loans</p>
              <p className="text-3xl font-bold text-red-600">{loanMetrics.overdueLoans}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">PAR Rate</p>
              <p className="text-3xl font-bold text-orange-600">{loanMetrics.parRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Avg Loan Size</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(loanMetrics.avgLoanSize)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Loan Portfolio Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Principal</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% of Portfolio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {['active', 'disbursed', 'overdue', 'closed', 'pending'].map((status) => {
                    const statusLoans = loans.filter((l) => l.status === status);
                    const principal = statusLoans.reduce((sum, l) => sum + l.principal_amount, 0);
                    const outstanding = statusLoans.reduce((sum, l) => sum + l.outstanding_balance, 0);
                    const percentage = loans.length > 0 ? (statusLoans.length / loans.length) * 100 : 0;
                    return (
                      <tr key={status} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="capitalize font-medium text-gray-900">{status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{statusLoans.length}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{formatCurrency(principal)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{formatCurrency(outstanding)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{percentage.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customer Analysis Report */}
      {selectedReport === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{customerMetrics.total}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">KYC Verified</p>
              <p className="text-3xl font-bold text-emerald-600">{customerMetrics.verified}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Pending KYC</p>
              <p className="text-3xl font-bold text-orange-600">{customerMetrics.pending}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Avg Credit Score</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(customerMetrics.avgCreditScore)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Customer Tier Distribution</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(customerMetrics.byTier).map(([tier, count]) => (
                <div key={tier} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500 capitalize">{tier}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Report */}
      {selectedReport === 'transactions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-emerald-600">
                {transactions.filter((t) => t.status === 'completed').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-orange-600">
                {transactions.filter((t) => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Savings Report */}
      {selectedReport === 'savings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Deposits</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(accountMetrics.totalBalance)}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Savings Accounts</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(accountMetrics.savingsBalance)}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Current Accounts</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(accountMetrics.currentBalance)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
