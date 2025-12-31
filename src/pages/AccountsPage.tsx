import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import AccountList from '@/components/accounts/AccountList'
import AccountForm from '@/components/accounts/AccountForm'
import { useQueryClient } from '@tanstack/react-query'

export default function AccountsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>()
  const queryClient = useQueryClient()

  const handleAdd = () => {
    setSelectedAccountId(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (id: string) => {
    setSelectedAccountId(id)
    setIsFormOpen(true)
  }

  const handleView = (id: string) => {
    // Navigate to account detail or open modal
    console.log('View account:', id)
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-500 mt-1">Manage bank accounts</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Create Account
        </Button>
      </div>

      <AccountList onEdit={handleEdit} onView={handleView} />

      <AccountForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        accountId={selectedAccountId}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
