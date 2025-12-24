import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { customersApi, loansApi, accountsApi } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { Customer, Loan } from '../types';
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getTierColor,
  getCreditScoreGrade,
  validateEmail,
  validatePhone,
} from '../lib/utils';
import { CloseIcon, CheckIcon, UserIcon, CreditCardIcon, ShieldIcon } from './ui/Icons';

// Modal Wrapper
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div
          className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-xl transform transition-all`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CloseIcon size={20} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

// New Customer Modal
export const NewCustomerModal: React.FC = () => {
  const { modals, closeModal, addCustomer, setCustomers, customers } = useAppStore();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    national_id: '',
    address: '',
    city: '',
    state: '',
    occupation: '',
    employer: '',
    monthly_income: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.monthly_income && parseFloat(formData.monthly_income) < 0) {
      newErrors.monthly_income = 'Monthly income cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a customer',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const customerData: Partial<Customer> = {
        tenant_id: user.tenant_id,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        date_of_birth: formData.date_of_birth || undefined,
        gender: formData.gender || undefined,
        national_id: formData.national_id.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        country: 'Nigeria',
        occupation: formData.occupation.trim() || undefined,
        employer: formData.employer.trim() || undefined,
        monthly_income: parseFloat(formData.monthly_income) || undefined,
        kyc_status: 'pending',
        kyc_documents: [],
        credit_score: 500,
        tier: 'bronze',
        is_active: true,
      };

      const createdCustomer = await customersApi.create(customerData);
      
      // Update store with new customer
      addCustomer(createdCustomer);
      setCustomers([createdCustomer, ...customers]);

      toast({
        title: 'Success',
        description: 'Customer created successfully',
      });

      // Reset form and close modal
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        national_id: '',
        address: '',
        city: '',
        state: '',
        occupation: '',
        employer: '',
        monthly_income: '',
      });
      closeModal('newCustomer');
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create customer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={modals.newCustomer}
      onClose={() => closeModal('newCustomer')}
      title="Add New Customer"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">Please fix the errors below</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => {
                setFormData({ ...formData, first_name: e.target.value });
                if (errors.first_name) setErrors({ ...errors, first_name: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.first_name
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-emerald-500'
              }`}
            />
            {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => {
                setFormData({ ...formData, last_name: e.target.value });
                if (errors.last_name) setErrors({ ...errors, last_name: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.last_name
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-emerald-500'
              }`}
            />
            {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-emerald-500'
              }`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.phone
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-emerald-500'
              }`}
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">National ID (NIN)</label>
          <input
            type="text"
            value={formData.national_id}
            onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.monthly_income}
              onChange={(e) => {
                setFormData({ ...formData, monthly_income: e.target.value });
                if (errors.monthly_income) setErrors({ ...errors, monthly_income: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.monthly_income
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-emerald-500'
              }`}
            />
            {errors.monthly_income && <p className="text-xs text-red-600 mt-1">{errors.monthly_income}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => closeModal('newCustomer')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// New Loan Modal
export const NewLoanModal: React.FC = () => {
  const { modals, closeModal, customers, loanProducts, addLoan, setLoans, loans } = useAppStore();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    customer_id: '',
    loan_product_id: '',
    principal_amount: '',
    tenure_months: '',
    purpose: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = loanProducts.find((p) => p.id === formData.loan_product_id);
  const selectedCustomer = customers.find((c) => c.id === formData.customer_id);

  // Calculate EMI using the utility function
  const calculateEMI = (principal: number, rate: number, tenure: number): number => {
    if (principal <= 0 || tenure <= 0) return 0;
    const monthlyRate = rate / 100 / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return isNaN(emi) ? 0 : emi;
  };

  const calculateTotalInterest = (principal: number, emi: number, tenure: number): number => {
    return Math.max(0, emi * tenure - principal);
  };

  const emi = selectedProduct
    ? calculateEMI(
        parseFloat(formData.principal_amount) || 0,
        selectedProduct.interest_rate,
        parseInt(formData.tenure_months) || 1
      )
    : 0;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) {
      newErrors.customer_id = 'Please select a customer';
    }
    if (!formData.loan_product_id) {
      newErrors.loan_product_id = 'Please select a loan product';
    }
    if (!formData.principal_amount || parseFloat(formData.principal_amount) <= 0) {
      newErrors.principal_amount = 'Please enter a valid loan amount';
    } else if (selectedProduct) {
      const amount = parseFloat(formData.principal_amount);
      if (amount < selectedProduct.min_amount) {
        newErrors.principal_amount = `Minimum amount is ${formatCurrency(selectedProduct.min_amount)}`;
      } else if (amount > selectedProduct.max_amount) {
        newErrors.principal_amount = `Maximum amount is ${formatCurrency(selectedProduct.max_amount)}`;
      }
    }
    if (!formData.tenure_months || parseInt(formData.tenure_months) <= 0) {
      newErrors.tenure_months = 'Please enter a valid tenure';
    } else if (selectedProduct) {
      const tenure = parseInt(formData.tenure_months);
      if (tenure < selectedProduct.min_tenure_months) {
        newErrors.tenure_months = `Minimum tenure is ${selectedProduct.min_tenure_months} months`;
      } else if (tenure > selectedProduct.max_tenure_months) {
        newErrors.tenure_months = `Maximum tenure is ${selectedProduct.max_tenure_months} months`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedProduct) {
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a loan',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const principal = parseFloat(formData.principal_amount);
      const tenure = parseInt(formData.tenure_months);
      const calculatedEMI = calculateEMI(principal, selectedProduct.interest_rate, tenure);
      const totalInterest = calculateTotalInterest(principal, calculatedEMI, tenure);

      // Get customer's account for the loan
      const customerAccounts = await accountsApi.getByCustomerId(formData.customer_id);
      const accountId = customerAccounts.length > 0 ? customerAccounts[0].id : undefined;

      const loanData: Partial<Loan> = {
        tenant_id: user.tenant_id,
        customer_id: formData.customer_id,
        account_id: accountId,
        loan_product_id: formData.loan_product_id,
        principal_amount: principal,
        interest_rate: selectedProduct.interest_rate,
        tenure_months: tenure,
        emi_amount: calculatedEMI,
        outstanding_balance: principal,
        total_interest: totalInterest,
        total_paid: 0,
        status: 'applied',
        purpose: formData.purpose.trim() || undefined,
      };

      const createdLoan = await loansApi.create(loanData);
      
      // Update store with new loan
      addLoan(createdLoan);
      setLoans([createdLoan, ...loans]);

      toast({
        title: 'Success',
        description: 'Loan application submitted successfully',
      });

      // Reset form and close modal
      setFormData({
        customer_id: '',
        loan_product_id: '',
        principal_amount: '',
        tenure_months: '',
        purpose: '',
      });
      closeModal('newLoan');
    } catch (error: any) {
      console.error('Error creating loan:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create loan application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={modals.newLoan}
      onClose={() => closeModal('newLoan')}
      title="New Loan Application"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">Please fix the errors below</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
          <select
            required
            value={formData.customer_id}
            onChange={(e) => {
              setFormData({ ...formData, customer_id: e.target.value });
              if (errors.customer_id) setErrors({ ...errors, customer_id: '' });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
              errors.customer_id
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-emerald-500'
            }`}
          >
            <option value="">Select Customer</option>
            {customers
              .filter((c) => c.kyc_status === 'verified')
              .map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name} ({customer.customer_number})
                </option>
              ))}
          </select>
          {errors.customer_id && <p className="text-xs text-red-600 mt-1">{errors.customer_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loan Product *</label>
          <select
            required
            value={formData.loan_product_id}
            onChange={(e) => {
              setFormData({ ...formData, loan_product_id: e.target.value });
              if (errors.loan_product_id) setErrors({ ...errors, loan_product_id: '' });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
              errors.loan_product_id
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-emerald-500'
            }`}
          >
            <option value="">Select Product</option>
            {loanProducts
              .filter((p) => p.is_active)
              .map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.interest_rate}% p.a.)
                </option>
              ))}
          </select>
          {errors.loan_product_id && <p className="text-xs text-red-600 mt-1">{errors.loan_product_id}</p>}
        </div>

        {selectedProduct && (
          <div className="p-4 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-900 mb-2">{selectedProduct.name}</p>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <p>Min: {formatCurrency(selectedProduct.min_amount)}</p>
              <p>Max: {formatCurrency(selectedProduct.max_amount)}</p>
              <p>Tenure: {selectedProduct.min_tenure_months}-{selectedProduct.max_tenure_months} months</p>
              <p>Processing Fee: {selectedProduct.processing_fee}%</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount *</label>
            <input
              type="number"
              required
              min={selectedProduct?.min_amount || 0}
              max={selectedProduct?.max_amount || 10000000}
              step="0.01"
              value={formData.principal_amount}
              onChange={(e) => {
                setFormData({ ...formData, principal_amount: e.target.value });
                if (errors.principal_amount) setErrors({ ...errors, principal_amount: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.principal_amount
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-emerald-500'
              }`}
            />
            {errors.principal_amount && <p className="text-xs text-red-600 mt-1">{errors.principal_amount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (Months) *</label>
            <input
              type="number"
              required
              min={selectedProduct?.min_tenure_months || 1}
              max={selectedProduct?.max_tenure_months || 60}
              value={formData.tenure_months}
              onChange={(e) => {
                setFormData({ ...formData, tenure_months: e.target.value });
                if (errors.tenure_months) setErrors({ ...errors, tenure_months: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.tenure_months
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-emerald-500'
              }`}
            />
            {errors.tenure_months && <p className="text-xs text-red-600 mt-1">{errors.tenure_months}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {emi > 0 && selectedProduct && (
          <div className="p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-800">
              Estimated Monthly EMI: <span className="font-bold text-lg">{formatCurrency(emi)}</span>
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              Total Interest: {formatCurrency(calculateTotalInterest(parseFloat(formData.principal_amount) || 0, emi, parseInt(formData.tenure_months) || 1))}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => closeModal('newLoan')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Customer Details Modal
export const CustomerDetailsModal: React.FC = () => {
  const { modals, closeModal, selectedCustomer, loans, accounts } = useAppStore();

  if (!selectedCustomer) return null;

  const customerLoans = loans.filter((l) => l.customer_id === selectedCustomer.id);
  const customerAccounts = accounts.filter((a) => a.customer_id === selectedCustomer.id);
  const scoreGrade = getCreditScoreGrade(selectedCustomer.credit_score);

  return (
    <Modal
      isOpen={modals.customerDetails}
      onClose={() => closeModal('customerDetails')}
      title="Customer Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          {selectedCustomer.profile_image ? (
            <img
              src={selectedCustomer.profile_image}
              alt={selectedCustomer.first_name}
              className="w-20 h-20 rounded-xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
              {selectedCustomer.first_name.charAt(0)}
              {selectedCustomer.last_name.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedCustomer.first_name} {selectedCustomer.last_name}
            </h3>
            <p className="text-gray-500">{selectedCustomer.customer_number}</p>
            <div className="flex gap-2 mt-2">
              <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedCustomer.kyc_status)}`}>
                KYC: {selectedCustomer.kyc_status}
              </span>
              <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getTierColor(selectedCustomer.tier)}`}>
                {selectedCustomer.tier}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Credit Score</p>
            <p className={`text-3xl font-bold ${scoreGrade.color}`}>
              {selectedCustomer.credit_score}
            </p>
            <p className={`text-sm ${scoreGrade.color}`}>{scoreGrade.grade}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Phone</p>
            <p className="font-medium text-gray-900">{selectedCustomer.phone}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Email</p>
            <p className="font-medium text-gray-900">{selectedCustomer.email || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Occupation</p>
            <p className="font-medium text-gray-900">{selectedCustomer.occupation || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Monthly Income</p>
            <p className="font-medium text-gray-900">
              {selectedCustomer.monthly_income ? formatCurrency(selectedCustomer.monthly_income) : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Location</p>
            <p className="font-medium text-gray-900">
              {selectedCustomer.city}, {selectedCustomer.state}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Member Since</p>
            <p className="font-medium text-gray-900">{formatDate(selectedCustomer.created_at)}</p>
          </div>
        </div>

        {/* Loans */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Loan History ({customerLoans.length})</h4>
          {customerLoans.length > 0 ? (
            <div className="space-y-2">
              {customerLoans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{loan.loan_number}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(loan.principal_amount)}</p>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No loans found</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Loan Details Modal
export const LoanDetailsModal: React.FC = () => {
  const { modals, closeModal, selectedLoan, customers, loanProducts, updateLoan } = useAppStore();

  if (!selectedLoan) return null;

  const customer = customers.find((c) => c.id === selectedLoan.customer_id);
  const product = loanProducts.find((p) => p.id === selectedLoan.loan_product_id);

  const handleApprove = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to approve loans',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedLoan = await loansApi.approve(selectedLoan.id, user.id);
      updateLoan(selectedLoan.id, updatedLoan);
      toast({
        title: 'Success',
        description: 'Loan approved successfully',
      });
    } catch (error: any) {
      console.error('Error approving loan:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to approve loan',
        variant: 'destructive',
      });
    }
  };

  const handleDisburse = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to disburse loans',
        variant: 'destructive',
      });
      return;
    }

    try {
      const disbursementDate = new Date().toISOString().split('T')[0];
      const updatedLoan = await loansApi.disburse(selectedLoan.id, disbursementDate);
      updateLoan(selectedLoan.id, updatedLoan);
      toast({
        title: 'Success',
        description: 'Loan disbursed successfully',
      });
    } catch (error: any) {
      console.error('Error disbursing loan:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to disburse loan',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to reject loans',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedLoan = await loansApi.update(selectedLoan.id, {
        status: 'rejected',
      });
      updateLoan(selectedLoan.id, updatedLoan);
      toast({
        title: 'Success',
        description: 'Loan rejected',
      });
    } catch (error: any) {
      console.error('Error rejecting loan:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to reject loan',
        variant: 'destructive',
      });
    }
  };

  return (
    <Modal
      isOpen={modals.loanDetails}
      onClose={() => closeModal('loanDetails')}
      title="Loan Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{selectedLoan.loan_number}</h3>
            <p className="text-gray-500">{product?.name || 'Loan'}</p>
          </div>
          <span className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full ${getStatusColor(selectedLoan.status)}`}>
            {selectedLoan.status.charAt(0).toUpperCase() + selectedLoan.status.slice(1)}
          </span>
        </div>

        {/* Customer Info */}
        {customer && (
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            {customer.profile_image ? (
              <img src={customer.profile_image} alt={customer.first_name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{customer.first_name} {customer.last_name}</p>
              <p className="text-sm text-gray-500">{customer.phone}</p>
            </div>
          </div>
        )}

        {/* Loan Details Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg">
            <p className="text-xs text-emerald-600 uppercase">Principal</p>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedLoan.principal_amount)}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 uppercase">Monthly EMI</p>
            <p className="text-xl font-bold text-blue-700">{formatCurrency(selectedLoan.emi_amount)}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-600 uppercase">Outstanding</p>
            <p className="text-xl font-bold text-orange-700">{formatCurrency(selectedLoan.outstanding_balance)}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 uppercase">Total Paid</p>
            <p className="text-xl font-bold text-purple-700">{formatCurrency(selectedLoan.total_paid)}</p>
          </div>
        </div>

        {/* More Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Interest Rate</p>
            <p className="font-medium text-gray-900">{selectedLoan.interest_rate}% p.a.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Tenure</p>
            <p className="font-medium text-gray-900">{selectedLoan.tenure_months} months</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Disbursement Date</p>
            <p className="font-medium text-gray-900">{selectedLoan.disbursement_date ? formatDate(selectedLoan.disbursement_date) : 'Pending'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Maturity Date</p>
            <p className="font-medium text-gray-900">{selectedLoan.maturity_date ? formatDate(selectedLoan.maturity_date) : 'N/A'}</p>
          </div>
        </div>

        {selectedLoan.purpose && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase mb-1">Purpose</p>
            <p className="text-gray-900">{selectedLoan.purpose}</p>
          </div>
        )}

        {/* Actions */}
        {(selectedLoan.status === 'applied' || selectedLoan.status === 'pending') && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              Approve Loan
            </button>
          </div>
        )}

        {selectedLoan.status === 'approved' && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleDisburse}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
            >
              Disburse Loan
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Export all modals
const Modals: React.FC = () => {
  return (
    <>
      <NewCustomerModal />
      <NewLoanModal />
      <CustomerDetailsModal />
      <LoanDetailsModal />
    </>
  );
};

export default Modals;
