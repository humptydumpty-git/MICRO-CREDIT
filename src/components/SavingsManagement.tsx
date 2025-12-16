import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  PiggyBankIcon,
  TargetIcon,
  TrendingUpIcon,
  PlusIcon,
  CalendarIcon,
} from './ui/Icons';

const SavingsManagement: React.FC = () => {
  const { accounts, customers } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  const savingsAccounts = accounts.filter((a) => a.account_type === 'savings');
  const totalSavings = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);
  const avgSavings = savingsAccounts.length > 0 ? totalSavings / savingsAccounts.length : 0;

  // Mock savings goals
  const savingsGoals = [
    { id: 1, name: 'Emergency Fund', target: 500000, current: 320000, customer: 'Adebayo Okonkwo' },
    { id: 2, name: 'Education', target: 250000, current: 180000, customer: 'Chioma Eze' },
    { id: 3, name: 'Business Capital', target: 1000000, current: 450000, customer: 'Emeka Nwosu' },
    { id: 4, name: 'Home Purchase', target: 2000000, current: 800000, customer: 'Oluwaseun Adeleke' },
  ];

  // Mock fixed deposits
  const fixedDeposits = [
    { id: 1, customer: 'Blessing Okoro', amount: 500000, rate: 8, tenure: 12, maturity: '2025-06-15' },
    { id: 2, customer: 'Ibrahim Suleiman', amount: 1000000, rate: 10, tenure: 24, maturity: '2026-03-20' },
    { id: 3, customer: 'Grace Afolabi', amount: 300000, rate: 7, tenure: 6, maturity: '2025-03-01' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <PiggyBankIcon size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Savings & Deposits</h2>
              <p className="text-purple-100">Manage savings accounts, fixed deposits, and savings goals</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
            <PlusIcon size={18} />
            New Savings Goal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <PiggyBankIcon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSavings)}</p>
              <p className="text-sm text-gray-500">Total Savings</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <TargetIcon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{savingsAccounts.length}</p>
              <p className="text-sm text-gray-500">Savings Accounts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <TrendingUpIcon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgSavings)}</p>
              <p className="text-sm text-gray-500">Average Balance</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <CalendarIcon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{fixedDeposits.length}</p>
              <p className="text-sm text-gray-500">Fixed Deposits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-4">
          <div className="flex gap-1">
            {['overview', 'goals', 'fixed-deposits'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Savings Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Interest Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {savingsAccounts.slice(0, 8).map((account) => {
                    const customer = customers.find((c) => c.id === account.customer_id);
                    return (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {customer?.profile_image ? (
                              <img src={customer.profile_image} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-semibold">
                                {customer?.first_name?.charAt(0)}{customer?.last_name?.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {customer?.first_name} {customer?.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{account.account_number}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                          {formatCurrency(account.balance)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{account.interest_rate}%</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(account.updated_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Savings Goals */}
        {activeTab === 'goals' && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Savings Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savingsGoals.map((goal) => {
                const progress = (goal.current / goal.target) * 100;
                return (
                  <div key={goal.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{goal.name}</h4>
                        <p className="text-sm text-gray-500">{goal.customer}</p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TargetIcon size={18} className="text-purple-600" />
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Saved: {formatCurrency(goal.current)}</span>
                      <span className="text-gray-500">Target: {formatCurrency(goal.target)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fixed Deposits */}
        {activeTab === 'fixed-deposits' && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Fixed Deposits</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Principal</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Interest Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tenure</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maturity Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Maturity Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fixedDeposits.map((fd) => {
                    const maturityAmount = fd.amount * (1 + (fd.rate / 100) * (fd.tenure / 12));
                    return (
                      <tr key={fd.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{fd.customer}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(fd.amount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{fd.rate}%</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{fd.tenure} months</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(fd.maturity)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600 text-right">
                          {formatCurrency(maturityAmount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsManagement;
