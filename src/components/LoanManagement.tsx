import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { Loan } from '../types';
import { formatCurrency, formatDate, getStatusColor } from '../lib/utils';
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  EyeIcon,
  CheckIcon,
  CloseIcon,
  ChevronDownIcon,
  CreditCardIcon,
  DollarIcon,
  ClockIcon,
  AlertIcon,
} from './ui/Icons';

const LoanManagement: React.FC = () => {
  const {
    loans,
    customers,
    loanProducts,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    openModal,
    setSelectedLoan,
    updateLoan,
  } = useAppStore();

  const [sortField, setSortField] = useState<keyof Loan>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredLoans = useMemo(() => {
    let result = [...loans];

    // Tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'pending') {
        result = result.filter((l) => l.status === 'pending' || l.status === 'applied');
      } else {
        result = result.filter((l) => l.status === activeTab);
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((l) => {
        const customer = customers.find((c) => c.id === l.customer_id);
        return (
          l.loan_number.toLowerCase().includes(query) ||
          customer?.first_name.toLowerCase().includes(query) ||
          customer?.last_name.toLowerCase().includes(query)
        );
      });
    }

    // Loan product filter
    if (filters.loanProduct) {
      result = result.filter((l) => l.loan_product_id === filters.loanProduct);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === undefined || bVal === undefined) return 0;
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [loans, customers, searchQuery, filters, sortField, sortOrder, activeTab]);

  const handleSort = (field: keyof Loan) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleApproveLoan = (loan: Loan) => {
    updateLoan(loan.id, {
      status: 'approved',
      approved_at: new Date().toISOString(),
    });
  };

  const handleRejectLoan = (loan: Loan) => {
    updateLoan(loan.id, { status: 'rejected' });
  };

  const tabs = [
    { id: 'all', label: 'All Loans', count: loans.length },
    {
      id: 'pending',
      label: 'Pending',
      count: loans.filter((l) => l.status === 'pending' || l.status === 'applied').length,
    },
    { id: 'active', label: 'Active', count: loans.filter((l) => l.status === 'active').length },
    {
      id: 'disbursed',
      label: 'Disbursed',
      count: loans.filter((l) => l.status === 'disbursed').length,
    },
    { id: 'closed', label: 'Closed', count: loans.filter((l) => l.status === 'closed').length },
    {
      id: 'overdue',
      label: 'Overdue',
      count: loans.filter((l) => l.status === 'overdue').length,
    },
  ];

  const stats = [
    {
      label: 'Total Loans',
      value: loans.length,
      icon: CreditCardIcon,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total Disbursed',
      value: formatCurrency(
        loans.reduce((sum, l) => sum + (l.disbursed_amount || 0), 0)
      ),
      icon: DollarIcon,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(loans.reduce((sum, l) => sum + l.outstanding_balance, 0)),
      icon: ClockIcon,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Overdue Amount',
      value: formatCurrency(
        loans
          .filter((l) => l.status === 'overdue')
          .reduce((sum, l) => sum + l.outstanding_balance, 0)
      ),
      icon: AlertIcon,
      color: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

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
                  placeholder="Search loans..."
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
            <button
              onClick={() => openModal('newLoan')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md"
            >
              <PlusIcon size={18} />
              New Loan Application
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Product
                </label>
                <select
                  value={filters.loanProduct}
                  onChange={(e) => setFilter('loanProduct', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Products</option>
                  {loanProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilter('loanProduct', '');
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

        {/* Loan Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('loan_number')}
                >
                  <div className="flex items-center gap-1">
                    Loan Details
                    <ChevronDownIcon size={14} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('principal_amount')}
                >
                  <div className="flex items-center gap-1">
                    Amount
                    <ChevronDownIcon size={14} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMI / Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <ChevronDownIcon size={14} />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLoans.map((loan) => {
                const customer = customers.find((c) => c.id === loan.customer_id);
                const product = loanProducts.find((p) => p.id === loan.loan_product_id);
                return (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{loan.loan_number}</p>
                        <p className="text-xs text-gray-500">{product?.name || 'N/A'}</p>
                      </div>
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
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(loan.principal_amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {loan.interest_rate}% / {loan.tenure_months}mo
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(loan.emi_amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Bal: {formatCurrency(loan.outstanding_balance)}
                      </p>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{formatDate(loan.created_at)}</p>
                      {loan.next_payment_date && (
                        <p className="text-xs text-gray-500">
                          Next: {formatDate(loan.next_payment_date)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedLoan(loan);
                            openModal('loanDetails');
                          }}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <EyeIcon size={18} />
                        </button>
                        {(loan.status === 'pending' || loan.status === 'applied') && (
                          <>
                            <button
                              onClick={() => handleApproveLoan(loan)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckIcon size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectLoan(loan)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <CloseIcon size={18} />
                            </button>
                          </>
                        )}
                      </div>
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
            Showing <span className="font-medium">{filteredLoans.length}</span> of{' '}
            <span className="font-medium">{loans.length}</span> loans
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

export default LoanManagement;
