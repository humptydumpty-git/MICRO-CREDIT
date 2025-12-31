import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format Nigerian phone numbers
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')
  }
  
  if (cleaned.length === 13 && cleaned.startsWith('234')) {
    return '+' + cleaned.replace(/(\d{3})(\d{4})(\d{3})(\d{4})/, '$1 $2 $3 $4')
  }
  
  return phone
}

export function generateAccountMask(accountNumber: string): string {
  if (accountNumber.length < 8) return accountNumber
  const first3 = accountNumber.substring(0, 3)
  const last4 = accountNumber.substring(accountNumber.length - 4)
  return `${first3}****${last4}`
}

export function calculateDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function calculateLoanInterest(
  principal: number,
  rate: number,
  months: number,
  type: 'flat' | 'reducing' | 'fixed'
): number {
  if (type === 'flat') {
    return (principal * rate * months) / 100
  } else if (type === 'reducing') {
    // Simplified reducing balance calculation
    const monthlyRate = rate / 100 / 12
    const total = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    return total * months - principal
  } else {
    // Fixed interest
    return (principal * rate * months) / 100
  }
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  // Nigerian phone: 11 digits starting with 0 or 13 digits starting with 234
  return cleaned.length === 11 && cleaned.startsWith('0') || 
         cleaned.length === 13 && cleaned.startsWith('234')
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

