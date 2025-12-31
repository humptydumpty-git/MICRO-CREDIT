import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { customerService } from '@/services/customerService'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { Customer } from '@/types'

interface CustomerFormProps {
  open: boolean
  onClose: () => void
  customerId?: string
  onSuccess: () => void
}

export default function CustomerForm({ open, onClose, customerId, onSuccess }: CustomerFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postal_code: '',
    occupation: '',
    employer_name: '',
    employer_address: '',
    monthly_income: '',
    id_type: '',
    id_number: '',
    id_issue_date: '',
    id_expiry_date: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
  })

  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerService.getById(customerId!),
    enabled: !!customerId && open,
  })

  useEffect(() => {
    if (customer && open) {
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        middle_name: customer.middle_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        date_of_birth: customer.date_of_birth || '',
        gender: customer.gender || '',
        nationality: customer.nationality || '',
        country: customer.country || '',
        state: customer.state || '',
        city: customer.city || '',
        address: customer.address || '',
        postal_code: customer.postal_code || '',
        occupation: customer.occupation || '',
        employer_name: customer.employer_name || '',
        employer_address: customer.employer_address || '',
        monthly_income: customer.monthly_income?.toString() || '',
        id_type: customer.id_type || '',
        id_number: customer.id_number || '',
        id_issue_date: customer.id_issue_date || '',
        id_expiry_date: customer.id_expiry_date || '',
        bank_name: customer.bank_name || '',
        bank_account_number: customer.bank_account_number || '',
        bank_account_name: customer.bank_account_name || '',
      })
    } else if (!customerId && open) {
      setFormData({
        first_name: '',
        last_name: '',
        middle_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        nationality: '',
        country: '',
        state: '',
        city: '',
        address: '',
        postal_code: '',
        occupation: '',
        employer_name: '',
        employer_address: '',
        monthly_income: '',
        id_type: '',
        id_number: '',
        id_issue_date: '',
        id_expiry_date: '',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
      })
    }
  }, [customer, customerId, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (customerId) {
        await customerService.update(customerId, {
          ...formData,
          monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
        })
        toast.success('Customer updated successfully')
      } else {
        await customerService.create({
          tenant_id: user!.tenant_id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_name: formData.middle_name || null,
          email: formData.email || null,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth || null,
          gender: (formData.gender as any) || null,
          nationality: formData.nationality || null,
          country: formData.country || null,
          state: formData.state || null,
          city: formData.city || null,
          address: formData.address || null,
          postal_code: formData.postal_code || null,
          occupation: formData.occupation || null,
          employer_name: formData.employer_name || null,
          employer_address: formData.employer_address || null,
          monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
          id_type: formData.id_type || null,
          id_number: formData.id_number || null,
          id_issue_date: formData.id_issue_date || null,
          id_expiry_date: formData.id_expiry_date || null,
          bank_name: formData.bank_name || null,
          bank_account_number: formData.bank_account_number || null,
          bank_account_name: formData.bank_account_name || null,
        })
        toast.success('Customer created successfully')
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customerId ? 'Edit Customer' : 'Create New Customer'}</DialogTitle>
          <DialogDescription>
            {customerId ? 'Update customer information' : 'Fill in the customer details below'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={[
                  { value: '', label: 'Select Gender' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="monthly_income">Monthly Income</Label>
              <Input
                id="monthly_income"
                type="number"
                value={formData.monthly_income}
                onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="employer_name">Employer Name</Label>
              <Input
                id="employer_name"
                value={formData.employer_name}
                onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="employer_address">Employer Address</Label>
              <Textarea
                id="employer_address"
                value={formData.employer_address}
                onChange={(e) => setFormData({ ...formData, employer_address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="id_type">ID Type</Label>
              <Select
                id="id_type"
                value={formData.id_type}
                onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                options={[
                  { value: '', label: 'Select ID Type' },
                  { value: 'national_id', label: 'National ID' },
                  { value: 'passport', label: 'Passport' },
                  { value: 'drivers_license', label: "Driver's License" },
                  { value: 'voters_card', label: "Voter's Card" },
                ]}
              />
            </div>
            <div>
              <Label htmlFor="id_number">ID Number</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="id_issue_date">ID Issue Date</Label>
              <Input
                id="id_issue_date"
                type="date"
                value={formData.id_issue_date}
                onChange={(e) => setFormData({ ...formData, id_issue_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="id_expiry_date">ID Expiry Date</Label>
              <Input
                id="id_expiry_date"
                type="date"
                value={formData.id_expiry_date}
                onChange={(e) => setFormData({ ...formData, id_expiry_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bank_account_number">Bank Account Number</Label>
              <Input
                id="bank_account_number"
                value={formData.bank_account_number}
                onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bank_account_name">Bank Account Name</Label>
              <Input
                id="bank_account_name"
                value={formData.bank_account_name}
                onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : customerId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

