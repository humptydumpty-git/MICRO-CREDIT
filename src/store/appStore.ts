import { create } from 'zustand';
import { Customer, Loan, Account, Transaction, LoanProduct, DashboardStats, User, Notification } from '../types';

interface AppState {
  // Current tenant and user
  currentTenant: { id: string; name: string; subdomain: string } | null;
  currentUser: User | null;
  
  // Navigation
  activeView: string;
  sidebarOpen: boolean;
  
  // Data
  customers: Customer[];
  loans: Loan[];
  accounts: Account[];
  transactions: Transaction[];
  loanProducts: LoanProduct[];
  notifications: Notification[];
  
  // Dashboard stats
  dashboardStats: DashboardStats;
  
  // Loading states
  isLoading: boolean;
  
  // Modals
  modals: {
    newCustomer: boolean;
    newLoan: boolean;
    newTransaction: boolean;
    loanDetails: boolean;
    customerDetails: boolean;
    loanCalculator: boolean;
  };
  
  // Selected items
  selectedCustomer: Customer | null;
  selectedLoan: Loan | null;
  selectedAccount: Account | null;
  
  // Search and filters
  searchQuery: string;
  filters: {
    status: string;
    dateRange: { start: string; end: string } | null;
    loanProduct: string;
    tier: string;
  };
  
  // Actions
  setActiveView: (view: string) => void;
  toggleSidebar: () => void;
  setCurrentTenant: (tenant: { id: string; name: string; subdomain: string } | null) => void;
  setCurrentUser: (user: User | null) => void;
  
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  
  setLoans: (loans: Loan[]) => void;
  addLoan: (loan: Loan) => void;
  updateLoan: (id: string, data: Partial<Loan>) => void;
  
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  
  setLoanProducts: (products: LoanProduct[]) => void;
  
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  
  setDashboardStats: (stats: DashboardStats) => void;
  
  setIsLoading: (loading: boolean) => void;
  
  openModal: (modal: keyof AppState['modals']) => void;
  closeModal: (modal: keyof AppState['modals']) => void;
  
  setSelectedCustomer: (customer: Customer | null) => void;
  setSelectedLoan: (loan: Loan | null) => void;
  setSelectedAccount: (account: Account | null) => void;
  
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof AppState['filters'], value: any) => void;
  clearFilters: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  currentTenant: { id: '1', name: 'MicroFinance Pro', subdomain: 'mfpro' },
  currentUser: null,
  
  activeView: 'dashboard',
  sidebarOpen: true,
  
  customers: [],
  loans: [],
  accounts: [],
  transactions: [],
  loanProducts: [],
  notifications: [],
  
  dashboardStats: {
    totalCustomers: 0,
    activeLoans: 0,
    totalDisbursed: 0,
    totalCollected: 0,
    pendingApplications: 0,
    overdueLoans: 0,
    savingsBalance: 0,
    monthlyGrowth: 0,
  },
  
  isLoading: false,
  
  modals: {
    newCustomer: false,
    newLoan: false,
    newTransaction: false,
    loanDetails: false,
    customerDetails: false,
    loanCalculator: false,
  },
  
  selectedCustomer: null,
  selectedLoan: null,
  selectedAccount: null,
  
  searchQuery: '',
  filters: {
    status: '',
    dateRange: null,
    loanProduct: '',
    tier: '',
  },
  
  // Actions
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setCustomers: (customers) => set({ customers }),
  addCustomer: (customer) => set((state) => ({ customers: [customer, ...state.customers] })),
  updateCustomer: (id, data) => set((state) => ({
    customers: state.customers.map((c) => c.id === id ? { ...c, ...data } : c),
  })),
  
  setLoans: (loans) => set({ loans }),
  addLoan: (loan) => set((state) => ({ loans: [loan, ...state.loans] })),
  updateLoan: (id, data) => set((state) => ({
    loans: state.loans.map((l) => l.id === id ? { ...l, ...data } : l),
  })),
  
  setAccounts: (accounts) => set({ accounts }),
  addAccount: (account) => set((state) => ({ accounts: [account, ...state.accounts] })),
  updateAccount: (id, data) => set((state) => ({
    accounts: state.accounts.map((a) => a.id === id ? { ...a, ...data } : a),
  })),
  
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({ 
    transactions: [transaction, ...state.transactions] 
  })),
  
  setLoanProducts: (products) => set({ loanProducts: products }),
  
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({ 
    notifications: [notification, ...state.notifications] 
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => 
      n.id === id ? { ...n, is_read: true } : n
    ),
  })),
  
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  openModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: true },
  })),
  closeModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: false },
  })),
  
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setSelectedLoan: (loan) => set({ selectedLoan: loan }),
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value },
  })),
  clearFilters: () => set({
    filters: { status: '', dateRange: null, loanProduct: '', tier: '' },
    searchQuery: '',
  }),
}));
