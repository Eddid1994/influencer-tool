'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Calendar,
  Mail,
  Paperclip,
  Search
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { NegotiationData, NegotiationCommunication } from '@/types/negotiation'

interface InvoiceAttachment {
  id: string
  filename: string
  url: string
  size?: number
  uploadedAt: string
  source: 'email' | 'manual'
  emailSubject?: string
  emailDate?: string
}

interface InvoiceAttachmentsProps {
  engagementId: string
  engagement?: any
}

export default function InvoiceAttachments({ engagementId, engagement }: InvoiceAttachmentsProps) {
  const [attachments, setAttachments] = useState<InvoiceAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadInvoiceAttachments()
  }, [engagementId, engagement])

  const loadInvoiceAttachments = async () => {
    try {
      // Get negotiation data from engagement
      const negotiationData = engagement?.negotiation_data as NegotiationData
      
      if (!negotiationData?.communications) {
        setAttachments([])
        return
      }

      // Scan communications for invoice attachments
      const invoiceAttachments: InvoiceAttachment[] = []
      
      negotiationData.communications.forEach((comm: NegotiationCommunication) => {
        // Check if communication has attachments in metadata
        if (comm.metadata?.attachments) {
          comm.metadata.attachments.forEach((attachment: any) => {
            if (isInvoiceAttachment(comm, attachment)) {
              invoiceAttachments.push({
                id: `${comm.id}_${attachment.id}`,
                filename: attachment.filename,
                url: attachment.url,
                size: attachment.size,
                uploadedAt: comm.created_at,
                source: 'email',
                emailSubject: comm.subject,
                emailDate: comm.created_at
              })
            }
          })
        }
      })

      setAttachments(invoiceAttachments)
    } catch (error) {
      console.error('Error loading invoice attachments:', error)
      toast.error('Failed to load invoice attachments')
    } finally {
      setLoading(false)
    }
  }

  // Invoice detection logic
  const isInvoiceAttachment = (communication: NegotiationCommunication, attachment: any): boolean => {
    const invoiceKeywords = ['invoice', 'rechnung', 'factura', 'bill', 'inv', 'faktura']
    
    // Check email subject
    const subjectHasInvoice = communication.subject && 
      invoiceKeywords.some(keyword => 
        communication.subject!.toLowerCase().includes(keyword)
      )
    
    // Check filename
    const filenameHasInvoice = attachment.filename &&
      invoiceKeywords.some(keyword => 
        attachment.filename.toLowerCase().includes(keyword)
      )
    
    // Check if PDF or image
    const isValidType = attachment.type === 'application/pdf' || 
                        attachment.type?.startsWith('image/') ||
                        attachment.filename?.toLowerCase().endsWith('.pdf') ||
                        attachment.filename?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i)
    
    return (subjectHasInvoice || filenameHasInvoice) && isValidType
  }

  const uploadManualInvoice = async (file: File, title: string) => {
    setIsUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${engagementId}/invoices/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('invoices')
        .getPublicUrl(fileName)

      // Add to attachments list (this would normally be stored in a separate table)
      const newAttachment: InvoiceAttachment = {
        id: `manual_${Date.now()}`,
        filename: title || file.name,
        url: publicUrl,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        source: 'manual'
      }

      setAttachments(prev => [newAttachment, ...prev])
      toast.success('Invoice uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading invoice:', error)
      toast.error(`Failed to upload invoice: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Byte'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Invoice Attachments</h3>
          <p className="text-sm text-muted-foreground">
            Detected from emails and manually uploaded invoices
          </p>
        </div>
        <ManualInvoiceUpload onUpload={uploadManualInvoice} isUploading={isUploading} />
      </div>

      {/* Attachments List */}
      {attachments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{attachment.filename}</h4>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(attachment.uploadedAt), 'MMM d, yyyy')}
                        </span>
                        
                        {attachment.size && (
                          <span>{formatFileSize(attachment.size)}</span>
                        )}
                        
                        <Badge variant={attachment.source === 'email' ? 'default' : 'secondary'}>
                          {attachment.source === 'email' ? (
                            <Mail className="h-3 w-3 mr-1" />
                          ) : (
                            <Upload className="h-3 w-3 mr-1" />
                          )}
                          {attachment.source}
                        </Badge>
                      </div>

                      {attachment.emailSubject && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <span className="font-medium">From email:</span> {attachment.emailSubject}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = attachment.url
                        link.download = attachment.filename
                        link.click()
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-3 bg-gray-100 rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No invoices detected</h3>
            <p className="text-muted-foreground text-center mb-4">
              Invoice attachments will automatically appear here when detected in emails,
              or you can upload them manually.
            </p>
            <ManualInvoiceUpload onUpload={uploadManualInvoice} isUploading={isUploading} />
          </CardContent>
        </Card>
      )}

      {/* Detection Info */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Paperclip className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Automatic Detection</h4>
              <p className="text-sm text-blue-700 mt-1">
                Invoices are automatically detected from email communications when:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>Email subject contains: "invoice", "bill", "rechnung"</li>
                <li>Attachment filename contains invoice-related keywords</li>
                <li>File type is PDF or image (PNG, JPG)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Manual Invoice Upload Dialog
function ManualInvoiceUpload({ 
  onUpload, 
  isUploading 
}: { 
  onUpload: (file: File, title: string) => Promise<void>
  isUploading: boolean
}) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file')
      return
    }

    await onUpload(file, title || file.name)
    setFile(null)
    setTitle('')
    setOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile)
        if (!title) {
          setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
        }
      } else {
        toast.error('Please select a PDF or image file')
        e.target.value = ''
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Invoice Manually</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Invoice File *</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              required
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, JPG, PNG
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Invoice title"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !file}>
              {isUploading ? 'Uploading...' : 'Upload Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}