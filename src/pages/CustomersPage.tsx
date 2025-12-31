import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CustomerList from '@/components/customers/CustomerList'
import CustomerForm from '@/components/customers/CustomerForm'
import CustomerDetailView from '@/components/customers/CustomerDetailView'
import { useQueryClient } from '@tanstack/react-query'

export default function CustomersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>()
  const queryClient = useQueryClient()

  const handleAdd = () => {
    setSelectedCustomerId(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (id: string) => {
    setSelectedCustomerId(id)
    setIsFormOpen(true)
  }

  const handleView = (id: string) => {
    setSelectedCustomerId(id)
    setIsDetailOpen(true)
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your bank customers</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <CustomerList onEdit={handleEdit} onView={handleView} />

      <CustomerForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        customerId={selectedCustomerId}
        onSuccess={handleSuccess}
      />

      {selectedCustomerId && (
        <CustomerDetailView
          customerId={selectedCustomerId}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </div>
  )
}

