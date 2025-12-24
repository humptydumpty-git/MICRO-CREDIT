import { z } from 'zod';

// Customer validation schema
export const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required').regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number'),
  date_of_birth: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  national_id: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  monthly_income: z.string().transform((val) => {
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  }).pipe(z.number().min(0, 'Monthly income cannot be negative').optional()),
});

// Loan validation schema
export const loanSchema = z.object({
  customer_id: z.string().min(1, 'Please select a customer'),
  loan_product_id: z.string().min(1, 'Please select a loan product'),
  principal_amount: z.string().transform((val) => parseFloat(val)).pipe(
    z.number().min(1, 'Loan amount must be greater than 0')
  ),
  tenure_months: z.string().transform((val) => parseInt(val)).pipe(
    z.number().int().min(1, 'Tenure must be at least 1 month')
  ),
  purpose: z.string().optional(),
}).refine((data) => {
  // Additional validation can be added here based on loan product constraints
  return true;
});

// Helper function to validate and get errors
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

