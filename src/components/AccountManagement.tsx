import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { formatCurrency, formatDate, getStatusColor } from '../lib/utils';
import {
  SearchIcon,
  FilterIcon,
  BankIcon,
  DollarIcon,
  PiggyBankIcon,
  EyeIcon,
  ChevronDownIcon,
} from './ui/Icons';

const AccountManagement: React.FC = () => {
  const { accounts, customers, searchQuery, setSearchQuery } = useAppStore();
  const [filterType, setFilterType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAccounts = useMemo(() => {
    let result = [...accounts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((a) => {
        const customer = customers.find((c) => c.id === a.customer_id);
        return (
          a.account_number.toLowerCase().includes(query) ||
          customer?.first_name.toLowerCase().includes(query) ||
          customer?.last_name.toLowerCase().includes(query)
        );
      });
    }

    if (filterType) {
      result = result.filter((a) => a.account_type === filterType);
    }

    return result;
  }, [accounts, customers, searchQuery, filterType]);

  const stats = useMemo(() => {
    const savingsAccounts = accounts.filter((a) => a.account_type === 'savings');
    const currentAccounts = accounts.filter((a) => a.account_type === 'current');

    return {
      totalAccounts: accounts.length,
      totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
      savingsCount: savingsAccounts.length,
      savingsBalance: savingsAccounts.reduce((sum, a) => sum + a.balance, 0),
      currentCount: currentAccounts.length,
      currentBalance: currentAccounts.reduce((sum, a) => sum + a.balance, 0),
    };
  }, [accounts]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <BankIcon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAccounts}</p>
              <p className="text-sm text-gray-500">Total Accounts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <DollarIcon size={22} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalBalance)}</p>
              <p className="text-sm text-gray-500">Total Balance</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <PiggyBankIcon size={22} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.savingsBalance)}</p>
              <p className="text-sm text-gray-500">Savings ({stats.savingsCount})</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <BankIcon size={22} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.currentBalance)}</p>
              <p className="text-sm text-gray-500">Current ({stats.currentCount})</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-1 gap-3 w-full lg:w-auto">
              <div className="relative flex-1 max-w-md">
                <SearchIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showFilters
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FilterIcon size={18} />
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Types</option>
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterType('');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opened
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAccounts.map((account) => {
                const customer = customers.find((c) => c.id === account.customer_id);
                return (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-mono font-medium text-gray-900">
                        {account.account_number}
                      </p>
                      <p className="text-xs text-gray-500">{account.currency}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {customer?.profile_image ? (
                          <img
                            src={customer.profile_image}
                            alt={customer.first_name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-xs">
                            {customer?.first_name?.charAt(0)}
                            {customer?.last_name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {customer?.first_name} {customer?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{customer?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                          account.account_type === 'savings'
                            ? 'bg-purple-100 text-purple-700'
                            : account.account_type === 'current'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {account.account_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(account.balance)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <p className="text-sm text-gray-600">
                        {formatCurrency(account.available_balance)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          account.status
                        )}`}
                      >
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(account.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <EyeIcon size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredAccounts.length}</span> of{' '}
            <span className="font-medium">{accounts.length}</span> accounts
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
