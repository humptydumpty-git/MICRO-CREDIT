import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { loanService } from '@/services/loanService'
import { customerService } from '@/services/customerService'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

interface LoanApplicationFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function LoanApplicationForm({ open, onClose, onSuccess }: LoanApplicationFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    principal_amount: '',
    tenure_months: '',
    purpose: '',
  })

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll({ status: 'active' }),
  })

  const { data: products } = useQuery({
    queryKey: ['loan-products'],
    queryFn: () => loanService.getAllProducts({ status: 'active' }),
  })

  const selectedProduct = products?.find((p) => p.id === formData.product_id)

  const calculateLoanDetails = () => {
    if (!selectedProduct || !formData.principal_amount || !formData.tenure_months) return null

    const principal = parseFloat(formData.principal_amount)
    const months = parseInt(formData.tenure_months)
    const rate = selectedProduct.interest_rate

    const totalInterest = loanService.calculateInterest(principal, rate, months, selectedProduct.interest_type)
    const totalAmount = principal + totalInterest
    const monthlyPayment = totalAmount / months

    return { totalInterest, totalAmount, monthlyPayment }
  }

  const loanDetails = calculateLoanDetails()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get customer's account for loan
      const customer = customers?.find((c) => c.id === formData.customer_id)
      if (!customer) {
        toast.error('Customer not found')
        return
      }

      // For now, we'll create the loan application
      // In a full implementation, you'd need to create/get a loan account first
      await loanService.createApplication({
        tenant_id: user!.tenant_id,
        customer_id: formData.customer_id,
        account_id: '', // Would need to get/create loan account
        product_id: formData.product_id,
        principal_amount: parseFloat(formData.principal_amount),
        interest_rate: selectedProduct!.interest_rate,
        interest_type: selectedProduct!.interest_type,
        tenure_months: parseInt(formData.tenure_months),
        purpose: formData.purpose || null,
      })

      toast.success('Loan application submitted successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit loan application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Loan Application</DialogTitle>
          <DialogDescription>Fill in the loan application details below</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer_id">Customer *</Label>
            <Select
              id="customer_id"
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              options={[
                { value: '', label: 'Select Customer' },
                ...(customers?.map((c) => ({
                  value: c.id,
                  label: `${c.first_name} ${c.last_name} (${c.customer_number})`,
                })) || []),
              ]}
            />
          </div>

          <div>
            <Label htmlFor="product_id">Loan Product *</Label>
            <Select
              id="product_id"
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              options={[
                { value: '', label: 'Select Loan Product' },
                ...(products?.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${formatCurrency(Number(p.min_amount))} - ${formatCurrency(Number(p.max_amount))})`,
                })) || []),
              ]}
            />
          </div>

          {selectedProduct && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm text-gray-600">Product Details:</p>
              <p className="text-sm">
                <span className="font-medium">Interest Rate:</span> {selectedProduct.interest_rate}% ({selectedProduct.interest_type})
              </p>
              <p className="text-sm">
                <span className="font-medium">Tenure Range:</span> {selectedProduct.min_tenure_months} - {selectedProduct.max_tenure_months} months
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="principal_amount">Loan Amount *</Label>
            <Input
              id="principal_amount"
              type="number"
              step="0.01"
              value={formData.principal_amount}
              onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
              required
              min={selectedProduct?.min_amount || 0}
              max={selectedProduct?.max_amount || 999999999}
            />
            {selectedProduct && (
              <p className="text-xs text-gray-500 mt-1">
                Range: {formatCurrency(Number(selectedProduct.min_amount))} -{' '}
                {formatCurrency(Number(selectedProduct.max_amount))}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="tenure_months">Tenure (Months) *</Label>
            <Input
              id="tenure_months"
              type="number"
              value={formData.tenure_months}
              onChange={(e) => setFormData({ ...formData, tenure_months: e.target.value })}
              required
              min={selectedProduct?.min_tenure_months || 1}
              max={selectedProduct?.max_tenure_months || 120}
            />
            {selectedProduct && (
              <p className="text-xs text-gray-500 mt-1">
                Range: {selectedProduct.min_tenure_months} - {selectedProduct.max_tenure_months} months
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="purpose">Loan Purpose</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              rows={3}
            />
          </div>

          {loanDetails && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <p className="font-semibold text-blue-900">Loan Summary:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Principal:</span>
                  <p className="font-semibold">{formatCurrency(parseFloat(formData.principal_amount))}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Interest:</span>
                  <p className="font-semibold">{formatCurrency(loanDetails.totalInterest)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <p className="font-semibold">{formatCurrency(loanDetails.totalAmount)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Monthly Payment:</span>
                  <p className="font-semibold">{formatCurrency(loanDetails.monthlyPayment)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !loanDetails}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

