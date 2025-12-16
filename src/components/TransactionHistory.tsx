import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { formatCurrency, formatDateTime, getStatusColor } from '../lib/utils';
import {
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  WalletIcon,
  DollarIcon,
  RefreshIcon,
} from './ui/Icons';

const TransactionHistory: React.FC = () => {
  const { transactions, accounts, searchQuery, setSearchQuery } = useAppStore();
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.reference_number.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    if (filterType) {
      result = result.filter((t) => t.transaction_type === filterType);
    }

    if (filterStatus) {
      result = result.filter((t) => t.status === filterStatus);
    }

    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [transactions, searchQuery, filterType, filterStatus]);

  const stats = useMemo(() => {
    const credits = transactions.filter(
      (t) =>
        t.transaction_type === 'credit' ||
        t.transaction_type === 'deposit' ||
        t.transaction_type === 'loan_disbursement' ||
        t.transaction_type === 'interest'
    );
    const debits = transactions.filter(
      (t) =>
        t.transaction_type === 'debit' ||
        t.transaction_type === 'withdrawal' ||
        t.transaction_type === 'loan_repayment' ||
        t.transaction_type === 'fee'
    );

    return {
      totalTransactions: transactions.length,
      totalCredits: credits.reduce((sum, t) => sum + t.amount, 0),
      totalDebits: debits.reduce((sum, t) => sum + t.amount, 0),
      pendingCount: transactions.filter((t) => t.status === 'pending').length,
    };
  }, [transactions]);

  const getTransactionIcon = (type: string) => {
    const isCredit =
      type === 'credit' ||
      type === 'deposit' ||
      type === 'loan_disbursement' ||
      type === 'interest';
    return isCredit ? (
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
        <ArrowDownIcon className="text-emerald-600" size={18} />
      </div>
    ) : (
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <ArrowUpIcon className="text-red-600" size={18} />
      </div>
    );
  };

  const getTransactionColor = (type: string) => {
    const isCredit =
      type === 'credit' ||
      type === 'deposit' ||
      type === 'loan_disbursement' ||
      type === 'interest';
    return isCredit ? 'text-emerald-600' : 'text-red-600';
  };

  const transactionTypes = [
    { value: '', label: 'All Types' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'loan_disbursement', label: 'Loan Disbursement' },
    { value: 'loan_repayment', label: 'Loan Repayment' },
    { value: 'interest', label: 'Interest' },
    { value: 'fee', label: 'Fee' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <WalletIcon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              <p className="text-sm text-gray-500">Total Transactions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <ArrowDownIcon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.totalCredits)}
              </p>
              <p className="text-sm text-gray-500">Total Credits</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100 text-red-600">
              <ArrowUpIcon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalDebits)}
              </p>
              <p className="text-sm text-gray-500">Total Debits</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <RefreshIcon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
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
                  placeholder="Search by reference or description..."
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
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <DownloadIcon size={18} />
              Export
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {transactionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="reversed">Reversed</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterType('');
                    setFilterStatus('');
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

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
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
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(txn.transaction_type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {txn.description || 'Transaction'}
                        </p>
                        <p className="text-xs text-gray-500">{txn.channel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-mono text-gray-600">{txn.reference_number}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                      {txn.transaction_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-semibold ${getTransactionColor(txn.transaction_type)}`}>
                      {txn.transaction_type === 'credit' ||
                      txn.transaction_type === 'deposit' ||
                      txn.transaction_type === 'loan_disbursement' ||
                      txn.transaction_type === 'interest'
                        ? '+'
                        : '-'}
                      {formatCurrency(txn.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="text-sm text-gray-900">{formatCurrency(txn.balance_after)}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        txn.status
                      )}`}
                    >
                      {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(txn.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredTransactions.length}</span> of{' '}
            <span className="font-medium">{transactions.length}</span> transactions
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
