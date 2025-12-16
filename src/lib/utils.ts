// Utility functions for the micro credit banking system

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'full' = 'short'): string {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: 'short', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
  }[format];
  return d.toLocaleDateString('en-NG', options);
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateAccountNumber(): string {
  const prefix = '10';
  const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + random;
}

export function generateLoanNumber(): string {
  const prefix = 'LN';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return prefix + timestamp + random;
}

export function generateCustomerNumber(): string {
  const prefix = 'CUS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return prefix + timestamp + random;
}

export function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
}

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi * 100) / 100;
}

export function calculateTotalInterest(principal: number, emi: number, tenureMonths: number): number {
  return Math.round((emi * tenureMonths - principal) * 100) / 100;
}

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  startDate: Date = new Date()
): Array<{
  installment: number;
  dueDate: string;
  emiAmount: number;
  principal: number;
  interest: number;
  balance: number;
}> {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const monthlyRate = annualRate / 12 / 100;
  let balance = principal;
  const schedule = [];

  for (let i = 1; i <= tenureMonths; i++) {
    const interest = Math.round(balance * monthlyRate * 100) / 100;
    const principalPaid = Math.round((emi - interest) * 100) / 100;
    balance = Math.max(0, Math.round((balance - principalPaid) * 100) / 100);

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      installment: i,
      dueDate: dueDate.toISOString().split('T')[0],
      emiAmount: emi,
      principal: principalPaid,
      interest: interest,
      balance: balance,
    });
  }

  return schedule;
}

export function calculateCreditScore(customer: {
  monthly_income?: number;
  occupation?: string;
  kyc_status?: string;
  existingLoans?: number;
  repaymentHistory?: number;
}): number {
  let score = 300; // Base score

  // Income factor (max 200 points)
  if (customer.monthly_income) {
    if (customer.monthly_income >= 500000) score += 200;
    else if (customer.monthly_income >= 200000) score += 150;
    else if (customer.monthly_income >= 100000) score += 100;
    else if (customer.monthly_income >= 50000) score += 50;
  }

  // KYC verification (max 100 points)
  if (customer.kyc_status === 'verified') score += 100;
  else if (customer.kyc_status === 'pending') score += 30;

  // Employment (max 100 points)
  if (customer.occupation) score += 50;

  // Repayment history (max 150 points)
  if (customer.repaymentHistory !== undefined) {
    score += Math.min(150, customer.repaymentHistory * 15);
  }

  // Existing loans penalty
  if (customer.existingLoans && customer.existingLoans > 2) {
    score -= (customer.existingLoans - 2) * 30;
  }

  return Math.min(850, Math.max(300, score));
}

export function getCreditScoreGrade(score: number): {
  grade: string;
  color: string;
  description: string;
} {
  if (score >= 750) return { grade: 'Excellent', color: 'text-emerald-600', description: 'Very low risk' };
  if (score >= 700) return { grade: 'Good', color: 'text-green-600', description: 'Low risk' };
  if (score >= 650) return { grade: 'Fair', color: 'text-yellow-600', description: 'Moderate risk' };
  if (score >= 550) return { grade: 'Poor', color: 'text-orange-600', description: 'High risk' };
  return { grade: 'Very Poor', color: 'text-red-600', description: 'Very high risk' };
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    applied: 'bg-blue-100 text-blue-800',
    disbursed: 'bg-indigo-100 text-indigo-800',
    closed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
    defaulted: 'bg-red-100 text-red-800',
    overdue: 'bg-orange-100 text-orange-800',
    verified: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    frozen: 'bg-blue-100 text-blue-800',
    suspended: 'bg-orange-100 text-orange-800',
    inactive: 'bg-gray-100 text-gray-800',
  };
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

export function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    bronze: 'bg-amber-100 text-amber-800',
    silver: 'bg-slate-100 text-slate-800',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-purple-100 text-purple-800',
  };
  return colors[tier.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone: string): boolean {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
}

export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
}

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, 3) + '*'.repeat(phone.length - 6) + phone.slice(-3);
}
