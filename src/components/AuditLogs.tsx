import React, { useState } from 'react';
import { formatDateTime } from '../lib/utils';
import {
  SearchIcon,
  FilterIcon,
  FileTextIcon,
  UserIcon,
  DownloadIcon,
} from './ui/Icons';

const AuditLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');

  // Mock audit logs
  const auditLogs = [
    { id: 1, user: 'Sarah Johnson', action: 'LOAN_APPROVED', entity: 'Loan', entityId: 'LN20240008', details: 'Approved loan application for Fatima Ibrahim', ip: '192.168.1.100', timestamp: '2024-12-15T14:30:00Z' },
    { id: 2, user: 'Sarah Johnson', action: 'CUSTOMER_CREATED', entity: 'Customer', entityId: 'CUS20240012', details: 'Created new customer: Grace Afolabi', ip: '192.168.1.100', timestamp: '2024-12-15T11:20:00Z' },
    { id: 3, user: 'John Doe', action: 'LOAN_DISBURSED', entity: 'Loan', entityId: 'LN20240007', details: 'Disbursed loan of ₦1,000,000 to Blessing Okoro', ip: '192.168.1.105', timestamp: '2024-12-14T16:45:00Z' },
    { id: 4, user: 'Sarah Johnson', action: 'KYC_VERIFIED', entity: 'Customer', entityId: 'CUS20240011', details: 'Verified KYC documents for Ibrahim Suleiman', ip: '192.168.1.100', timestamp: '2024-12-14T10:15:00Z' },
    { id: 5, user: 'Jane Smith', action: 'TRANSACTION_REVERSED', entity: 'Transaction', entityId: 'TXN2024120501', details: 'Reversed failed transaction', ip: '192.168.1.110', timestamp: '2024-12-13T09:30:00Z' },
    { id: 6, user: 'Sarah Johnson', action: 'SETTINGS_UPDATED', entity: 'Settings', entityId: 'SYS001', details: 'Updated loan interest rate settings', ip: '192.168.1.100', timestamp: '2024-12-12T15:00:00Z' },
    { id: 7, user: 'John Doe', action: 'REPAYMENT_RECORDED', entity: 'Loan', entityId: 'LN20240001', details: 'Recorded repayment of ₦44,424 for Adebayo Okonkwo', ip: '192.168.1.105', timestamp: '2024-12-11T14:20:00Z' },
    { id: 8, user: 'Sarah Johnson', action: 'USER_LOGIN', entity: 'Auth', entityId: 'USR001', details: 'User logged in successfully', ip: '192.168.1.100', timestamp: '2024-12-11T08:00:00Z' },
    { id: 9, user: 'Jane Smith', action: 'ACCOUNT_CREATED', entity: 'Account', entityId: 'ACC20240012', details: 'Created savings account for Grace Afolabi', ip: '192.168.1.110', timestamp: '2024-12-10T11:45:00Z' },
    { id: 10, user: 'Sarah Johnson', action: 'LOAN_REJECTED', entity: 'Loan', entityId: 'LN20240011', details: 'Rejected loan application due to low credit score', ip: '192.168.1.100', timestamp: '2024-12-09T16:30:00Z' },
  ];

  const actionColors: Record<string, string> = {
    LOAN_APPROVED: 'bg-emerald-100 text-emerald-700',
    LOAN_DISBURSED: 'bg-blue-100 text-blue-700',
    LOAN_REJECTED: 'bg-red-100 text-red-700',
    CUSTOMER_CREATED: 'bg-purple-100 text-purple-700',
    KYC_VERIFIED: 'bg-green-100 text-green-700',
    TRANSACTION_REVERSED: 'bg-orange-100 text-orange-700',
    SETTINGS_UPDATED: 'bg-gray-100 text-gray-700',
    REPAYMENT_RECORDED: 'bg-teal-100 text-teal-700',
    USER_LOGIN: 'bg-indigo-100 text-indigo-700',
    ACCOUNT_CREATED: 'bg-cyan-100 text-cyan-700',
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = !filterAction || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = [...new Set(auditLogs.map((log) => log.action))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <FileTextIcon size={28} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
              <p className="text-gray-500">Track all system activities and changes</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <DownloadIcon size={18} />
            Export Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserIcon size={16} className="text-gray-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {log.entityId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredLogs.length}</span> of{' '}
            <span className="font-medium">{auditLogs.length}</span> logs
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

export default AuditLogs;
