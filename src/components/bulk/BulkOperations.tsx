import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Download, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { customerService } from '@/services/customerService'
import { useQueryClient } from '@tanstack/react-query'

export default function BulkOperations() {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleBulkImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setLoading(true)
    try {
      const text = await selectedFile.text()
      const lines = text.split('\n').filter((line) => line.trim())
      const headers = lines[0].split(',').map((h) => h.trim())

      // Validate headers
      const requiredHeaders = ['first_name', 'last_name', 'phone', 'email']
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

      if (missingHeaders.length > 0) {
        toast.error(`Missing required columns: ${missingHeaders.join(', ')}`)
        return
      }

      const customers = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim())
        const customer: any = {}
        headers.forEach((header, index) => {
          customer[header] = values[index] || null
        })

        // Get tenant_id from current user context (would need to be passed)
        customers.push(customer)
      }

      // Import customers (this would need to be implemented in the service)
      toast.success(`Processed ${customers.length} customers`)
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setSelectedFile(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to import customers')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkExport = async () => {
    setLoading(true)
    try {
      const customers = await customerService.getAll()

      // Convert to CSV
      const headers = [
        'Customer Number',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Status',
        'Credit Score',
      ]
      const rows = customers.map((c) => [
        c.customer_number,
        c.first_name,
        c.last_name,
        c.email || '',
        c.phone,
        c.status,
        c.credit_score,
      ])

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Export completed')
    } catch (error: any) {
      toast.error(error.message || 'Failed to export customers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="import-file">Select CSV File</Label>
            <Input
              id="import-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="mt-2"
            />
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-2">Selected: {selectedFile.name}</p>
            )}
          </div>
          <Button onClick={handleBulkImport} disabled={loading || !selectedFile}>
            <Upload className="h-4 w-4 mr-2" />
            {loading ? 'Importing...' : 'Import Customers'}
          </Button>
          <div className="text-sm text-gray-500">
            <p className="font-medium mb-2">CSV Format:</p>
            <p>Required columns: first_name, last_name, phone, email</p>
            <p>Optional columns: middle_name, date_of_birth, gender, address, etc.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Export all customers to CSV format for backup or external processing.
          </p>
          <Button onClick={handleBulkExport} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Exporting...' : 'Export Customers'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

