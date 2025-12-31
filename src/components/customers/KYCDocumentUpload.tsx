import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { customerService } from '@/services/customerService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface KYCDocumentUploadProps {
  customerId: string
  onUploadComplete: () => void
}

export default function KYCDocumentUpload({ customerId, onUploadComplete }: KYCDocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null)
  const [idBackFile, setIdBackFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload JPG, PNG, or PDF')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size too large. Maximum size is 5MB')
        return
      }

      setFile(file)
    }
  }

  const handleUpload = async () => {
    if (!idFrontFile && !idBackFile && !photoFile) {
      toast.error('Please select at least one file to upload')
      return
    }

    setUploading(true)

    try {
      const uploads: Promise<string>[] = []

      if (idFrontFile) {
        const fileExt = idFrontFile.name.split('.').pop()
        const fileName = `id-front-${customerId}-${Date.now()}.${fileExt}`
        const filePath = `kyc/${customerId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, idFrontFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('kyc-documents')
          .getPublicUrl(filePath)

        await customerService.update(customerId, { id_front_url: publicUrl })
        uploads.push(Promise.resolve(publicUrl))
      }

      if (idBackFile) {
        const fileExt = idBackFile.name.split('.').pop()
        const fileName = `id-back-${customerId}-${Date.now()}.${fileExt}`
        const filePath = `kyc/${customerId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, idBackFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('kyc-documents')
          .getPublicUrl(filePath)

        await customerService.update(customerId, { id_back_url: publicUrl })
        uploads.push(Promise.resolve(publicUrl))
      }

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `photo-${customerId}-${Date.now()}.${fileExt}`
        const filePath = `kyc/${customerId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, photoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('kyc-documents')
          .getPublicUrl(filePath)

        await customerService.update(customerId, { photo_url: publicUrl })
        uploads.push(Promise.resolve(publicUrl))
      }

      await Promise.all(uploads)
      toast.success('Documents uploaded successfully')
      setIdFrontFile(null)
      setIdBackFile(null)
      setPhotoFile(null)
      onUploadComplete()
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload documents')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Document Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">ID Front</label>
          <div className="flex items-center gap-2">
            <label className="flex-1">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileSelect(e, setIdFrontFile)}
                className="hidden"
              />
              <div className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                {idFrontFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">{idFrontFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIdFrontFile(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload ID front</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">ID Back</label>
          <label className="block">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileSelect(e, setIdBackFile)}
              className="hidden"
            />
            <div className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50">
              {idBackFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">{idBackFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIdBackFile(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload ID back</p>
                </div>
              )}
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Customer Photo</label>
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, setPhotoFile)}
              className="hidden"
            />
            <div className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50">
              {photoFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">{photoFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPhotoFile(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload photo</p>
                </div>
              )}
            </div>
          </label>
        </div>

        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </Button>
      </CardContent>
    </Card>
  )
}

