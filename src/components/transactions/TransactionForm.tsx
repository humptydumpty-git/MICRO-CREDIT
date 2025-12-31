import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { transactionService } from '@/services/transactionService'
import { accountService } from '@/services/accountService'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  type: 'deposit' | 'withdrawal' | 'transfer'
  onSuccess: () => void
}

export default function TransactionForm({ open, onClose, type, onSuccess }: TransactionFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    account_id: '',
    to_account_id: '',
    amount: '',
    narration: '',
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll({ status: 'active' }),
  })

  const selectedAccount = accounts?.find((a) => a.id === formData.account_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (type === 'deposit') {
        await transactionService.deposit(
          formData.account_id,
          parseFloat(formData.amount),
          formData.narration,
          user?.id
        )
        toast.success('Deposit successful')
      } else if (type === 'withdrawal') {
        await transactionService.withdraw(
          formData.account_id,
          parseFloat(formData.amount),
          formData.narration,
          user?.id
        )
        toast.success('Withdrawal successful')
      } else if (type === 'transfer') {
        await transactionService.transfer(
          formData.account_id,
          formData.to_account_id,
          parseFloat(formData.amount),
          formData.narration,
          user?.id
        )
        toast.success('Transfer successful')
      }

      onSuccess()
      onClose()
      setFormData({ account_id: '', to_account_id: '', amount: '', narration: '' })
    } catch (error: any) {
      toast.error(error.message || `Failed to process ${type}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="capitalize">{type} Transaction</DialogTitle>
          <DialogDescription>Enter the transaction details below</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="account_id">From Account *</Label>
            <Select
              id="account_id"
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              options={[
                { value: '', label: 'Select Account' },
                ...(accounts?.map((a) => ({
                  value: a.id,
                  label: `${a.account_number} (${a.account_type}) - ${formatCurrency(Number(a.balance))}`,
                })) || []),
              ]}
            />
            {selectedAccount && (
              <p className="text-xs text-gray-500 mt-1">
                Available Balance: {formatCurrency(Number(selectedAccount.available_balance))}
              </p>
            )}
          </div>

          {type === 'transfer' && (
            <div>
              <Label htmlFor="to_account_id">To Account *</Label>
              <Select
                id="to_account_id"
                value={formData.to_account_id}
                onChange={(e) => setFormData({ ...formData, to_account_id: e.target.value })}
                options={[
                  { value: '', label: 'Select Account' },
                  ...(accounts
                    ?.filter((a) => a.id !== formData.account_id)
                    .map((a) => ({
                      value: a.id,
                      label: `${a.account_number} (${a.account_type})`,
                    })) || []),
                ]}
              />
            </div>
          )}

          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              min="0.01"
            />
          </div>

          <div>
            <Label htmlFor="narration">Narration</Label>
            <Textarea
              id="narration"
              value={formData.narration}
              onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
              rows={3}
              placeholder="Enter transaction description..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : `Process ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

