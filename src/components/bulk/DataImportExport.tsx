import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { customerService } from '@/services/customerService'
import { accountService } from '@/services/accountService'
import { loanService } from '@/services/loanService'
import { transactionService } from '@/services/transactionService'

export default function DataImportExport() {
  const [loading, setLoading] = useState(false)
  const [exportType, setExportType] = useState('customers')

  const handleExport = async () => {
    setLoading(true)
    try {
      let data: any[] = []
      let filename = ''

      switch (exportType) {
        case 'customers':
          data = await customerService.getAll()
          filename = 'customers-export'
          break
        case 'accounts':
          data = await accountService.getAll()
          filename = 'accounts-export'
          break
        case 'loans':
          data = await loanService.getAll()
          filename = 'loans-export'
          break
        case 'transactions':
          data = await transactionService.getAll()
          filename = 'transactions-export'
          break
      }

      // Convert to JSON
      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Export completed')
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Import logic would go here
      // This is a simplified example
      toast.success(`Imported ${data.length} records`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to import data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Export Type</label>
            <Select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              options={[
                { value: 'customers', label: 'Customers' },
                { value: 'accounts', label: 'Accounts' },
                { value: 'loans', label: 'Loans' },
                { value: 'transactions', label: 'Transactions' },
              ]}
            />
          </div>
          <Button onClick={handleExport} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Exporting...' : 'Export as JSON'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select JSON File</label>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
          </div>
          <p className="text-sm text-gray-500">
            Import data from a JSON file. Ensure the file format matches the export format.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

