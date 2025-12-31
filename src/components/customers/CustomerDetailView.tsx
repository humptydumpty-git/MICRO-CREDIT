import { useQuery } from '@tanstack/react-query'
import { customerService } from '@/services/customerService'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'

interface CustomerDetailViewProps {
  customerId: string
  open: boolean
  onClose: () => void
}

export default function CustomerDetailView({ customerId, open, onClose }: CustomerDetailViewProps) {
  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerService.getById(customerId),
    enabled: open && !!customerId,
  })

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <LoadingSpinner />
        </DialogContent>
      </Dialog>
    )
  }

  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Customer Number</label>
                <p className="font-medium">{customer.customer_number}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <p className="font-medium">
                  {customer.first_name} {customer.middle_name} {customer.last_name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{customer.email || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium">{customer.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date of Birth</label>
                <p className="font-medium">{customer.date_of_birth ? formatDate(customer.date_of_birth) : '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Gender</label>
                <p className="font-medium capitalize">{customer.gender || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Nationality</label>
                <p className="font-medium">{customer.nationality || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Address</label>
                <p className="font-medium">
                  {customer.address ? `${customer.address}, ${customer.city}, ${customer.state}, ${customer.country}` : '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Credit Score</label>
                <p className="font-medium text-2xl">{customer.credit_score}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Credit Limit</label>
                <p className="font-medium text-2xl">{formatCurrency(Number(customer.credit_limit))}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Tier</label>
                <Badge variant="default" className="mt-1">
                  {customer.tier.toUpperCase()}
                </Badge>
              </div>
              <div>
                <label className="text-sm text-gray-500">Monthly Income</label>
                <p className="font-medium">{customer.monthly_income ? formatCurrency(Number(customer.monthly_income)) : '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Occupation</label>
                <p className="font-medium">{customer.occupation || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Employer</label>
                <p className="font-medium">{customer.employer_name || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>KYC Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">KYC Status</label>
                <div className="mt-1">
                  <Badge variant={customer.kyc_status === 'verified' ? 'success' : 'secondary'}>
                    {customer.kyc_status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Verified At</label>
                <p className="font-medium">{customer.kyc_verified_at ? formatDate(customer.kyc_verified_at) : '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">ID Type</label>
                <p className="font-medium">{customer.id_type || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">ID Number</label>
                <p className="font-medium">{customer.id_number || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">ID Issue Date</label>
                <p className="font-medium">{customer.id_issue_date ? formatDate(customer.id_issue_date) : '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">ID Expiry Date</label>
                <p className="font-medium">{customer.id_expiry_date ? formatDate(customer.id_expiry_date) : '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank Account Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Bank Name</label>
                <p className="font-medium">{customer.bank_name || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Account Number</label>
                <p className="font-medium">{customer.bank_account_number || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Account Name</label>
                <p className="font-medium">{customer.bank_account_name || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {customer.accounts && customer.accounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Accounts ({customer.accounts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {customer.accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{account.account_number}</p>
                        <p className="text-sm text-gray-500 capitalize">{account.account_type}</p>
                      </div>
                      <p className="font-bold">{formatCurrency(Number(account.balance))}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

