import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { accountService } from '@/services/accountService'
import { customerService } from '@/services/customerService'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'

interface AccountFormProps {
  open: boolean
  onClose: () => void
  accountId?: string
  customerId?: string
  onSuccess: () => void
}

export default function AccountForm({ open, onClose, accountId, customerId, onSuccess }: AccountFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: customerId || '',
    account_type: 'savings' as 'savings' | 'current' | 'loan' | 'fixed_deposit',
    account_name: '',
    product_id: '',
    currency_code: 'NGN',
    interest_rate: '',
  })

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll({ status: 'active' }),
  })

  const { data: account } = useQuery({
    queryKey: ['account', accountId],
    queryFn: () => accountService.getById(accountId!),
    enabled: !!accountId && open,
  })

  useEffect(() => {
    if (account && open) {
      setFormData({
        customer_id: account.customer_id,
        account_type: account.account_type,
        account_name: account.account_name || '',
        product_id: account.product_id || '',
        currency_code: account.currency_code,
        interest_rate: account.interest_rate?.toString() || '',
      })
    } else if (!accountId && open) {
      setFormData({
        customer_id: customerId || '',
        account_type: 'savings',
        account_name: '',
        product_id: '',
        currency_code: 'NGN',
        interest_rate: '',
      })
    }
  }, [account, accountId, customerId, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (accountId) {
        await accountService.update(accountId, {
          account_name: formData.account_name || null,
          interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : 0,
        })
        toast.success('Account updated successfully')
      } else {
        await accountService.create({
          tenant_id: user!.tenant_id,
          customer_id: formData.customer_id,
          account_type: formData.account_type,
          account_name: formData.account_name || null,
          product_id: formData.product_id || null,
          currency_code: formData.currency_code,
        })
        toast.success('Account created successfully')
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{accountId ? 'Edit Account' : 'Create New Account'}</DialogTitle>
          <DialogDescription>
            {accountId ? 'Update account information' : 'Fill in the account details below'}
          </DialogDescription>
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
              disabled={!!accountId || !!customerId}
            />
          </div>

          <div>
            <Label htmlFor="account_type">Account Type *</Label>
            <Select
              id="account_type"
              value={formData.account_type}
              onChange={(e) =>
                setFormData({ ...formData, account_type: e.target.value as any })
              }
              options={[
                { value: 'savings', label: 'Savings' },
                { value: 'current', label: 'Current' },
                { value: 'loan', label: 'Loan' },
                { value: 'fixed_deposit', label: 'Fixed Deposit' },
              ]}
              disabled={!!accountId}
            />
          </div>

          <div>
            <Label htmlFor="account_name">Account Name</Label>
            <Input
              id="account_name"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="currency_code">Currency Code</Label>
            <Input
              id="currency_code"
              value={formData.currency_code}
              onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
              maxLength={3}
              disabled={!!accountId}
            />
          </div>

          <div>
            <Label htmlFor="interest_rate">Interest Rate (%)</Label>
            <Input
              id="interest_rate"
              type="number"
              step="0.01"
              value={formData.interest_rate}
              onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : accountId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

