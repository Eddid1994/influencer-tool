'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  FileText, 
  Eye, 
  Mail,
  AlertCircle,
  CheckCircle,
  User,
  Building2,
  Loader2,
  Copy,
  Edit2
} from 'lucide-react'
import { toast } from 'sonner'

interface BulkOutreachDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedEngagements: any[]
  onSuccess?: () => void
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  template_type: string
  variables?: any
}

interface MessagePreview {
  engagementId: string
  influencerName: string
  brandName: string
  subject: string
  content: string
  customized?: boolean
}

export default function BulkOutreachDialog({ 
  open, 
  onOpenChange, 
  selectedEngagements,
  onSuccess 
}: BulkOutreachDialogProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customSubject, setCustomSubject] = useState('')
  const [customContent, setCustomContent] = useState('')
  const [messagePreviews, setMessagePreviews] = useState<MessagePreview[]>([])
  const [activeTab, setActiveTab] = useState('template')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [editingPreview, setEditingPreview] = useState<string | null>(null)
  
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (open) {
      loadTemplates()
      generatePreviews()
    }
  }, [open])

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate)
      if (template) {
        setCustomSubject(template.subject)
        setCustomContent(template.content)
      }
    }
  }, [selectedTemplate, templates])

  useEffect(() => {
    generatePreviews()
  }, [customSubject, customContent])

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('outreach_templates')
        .select('*')
        .eq('is_active', true)
        .eq('template_type', 'initial_outreach')
        .order('name')

      if (error) throw error
      setTemplates(data || [])
      
      // Auto-select first template if available
      if (data && data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data[0].id)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Failed to load email templates')
    }
  }

  const replaceVariables = (text: string, engagement: any): string => {
    let result = text
    
    // Replace common variables
    result = result.replace(/\{\{influencer_name\}\}/g, engagement.influencers?.name || 'there')
    result = result.replace(/\{\{brand_name\}\}/g, engagement.brands?.name || 'Brand')
    result = result.replace(/\{\{instagram_handle\}\}/g, engagement.influencers?.instagram_handle || '@handle')
    result = result.replace(/\{\{campaign_name\}\}/g, engagement.campaign_name || 'Campaign')
    result = result.replace(/\{\{period\}\}/g, engagement.period_label || 'This period')
    
    // Replace date variables
    const today = new Date()
    result = result.replace(/\{\{current_date\}\}/g, today.toLocaleDateString())
    result = result.replace(/\{\{current_month\}\}/g, today.toLocaleDateString('en-US', { month: 'long' }))
    result = result.replace(/\{\{current_year\}\}/g, today.getFullYear().toString())
    
    return result
  }

  const generatePreviews = () => {
    if (!customSubject || !customContent) return
    
    const previews = selectedEngagements.map(engagement => ({
      engagementId: engagement.id,
      influencerName: engagement.influencers?.name || 'Unknown',
      brandName: engagement.brands?.name || 'Unknown',
      subject: replaceVariables(customSubject, engagement),
      content: replaceVariables(customContent, engagement),
      customized: false
    }))
    
    setMessagePreviews(previews)
  }

  const handleCustomizeMessage = (engagementId: string, field: 'subject' | 'content', value: string) => {
    setMessagePreviews(prev => prev.map(preview => 
      preview.engagementId === engagementId
        ? { ...preview, [field]: value, customized: true }
        : preview
    ))
  }

  const handleSendOutreach = async () => {
    if (!messagePreviews.length) {
      toast.error('No messages to send')
      return
    }

    setSending(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const preview of messagePreviews) {
        try {
          // Update engagement with outreach data
          const { error: updateError } = await supabase
            .from('engagements')
            .update({
              negotiation_status: 'outreach_sent',
              last_contact_date: new Date().toISOString(),
              negotiation_data: {
                communications: [{
                  id: crypto.randomUUID(),
                  type: 'email',
                  direction: 'outbound',
                  subject: preview.subject,
                  content: preview.content,
                  created_at: new Date().toISOString(),
                  template_used: selectedTemplate || null
                }],
                offers: [],
                timeline: [{
                  event: 'initial_outreach',
                  date: new Date().toISOString(),
                  description: 'Sent initial outreach email'
                }],
                current_stage: 'outreach_sent',
                notes: '',
                templates_used: selectedTemplate ? [selectedTemplate] : [],
                follow_up_count: 0
              }
            })
            .eq('id', preview.engagementId)

          if (updateError) throw updateError
          
          successCount++
        } catch (error) {
          console.error(`Error sending to ${preview.influencerName}:`, error)
          errorCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} outreach message${successCount !== 1 ? 's' : ''}`)
        onSuccess?.()
        onOpenChange(false)
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to send ${errorCount} message${errorCount !== 1 ? 's' : ''}`)
      }
    } catch (error) {
      console.error('Error sending bulk outreach:', error)
      toast.error('Failed to send outreach messages')
    } finally {
      setSending(false)
    }
  }

  const pendingOutreachCount = selectedEngagements.filter(e => 
    e.negotiation_status === 'pending_outreach' || !e.negotiation_status
  ).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Send Bulk Outreach</DialogTitle>
          <DialogDescription>
            Send personalized outreach messages to {selectedEngagements.length} selected engagement{selectedEngagements.length !== 1 ? 's' : ''}.
            {pendingOutreachCount < selectedEngagements.length && (
              <span className="text-amber-600 block mt-1">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Note: {selectedEngagements.length - pendingOutreachCount} engagement{selectedEngagements.length - pendingOutreachCount !== 1 ? 's are' : ' is'} not in "pending outreach" status
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">
              <FileText className="h-4 w-4 mr-2" />
              Template & Message
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!customSubject || !customContent}>
              <Eye className="h-4 w-4 mr-2" />
              Preview ({messagePreviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="template">Email Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available variables: {`{{influencer_name}}, {{brand_name}}, {{campaign_name}}`}
              </p>
            </div>

            <div>
              <Label htmlFor="content">Message Content</Label>
              <Textarea
                id="content"
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Enter your message..."
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Variables will be automatically replaced for each recipient
              </p>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Available Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <code className="bg-white px-2 py-1 rounded">{`{{influencer_name}}`}</code>
                  <code className="bg-white px-2 py-1 rounded">{`{{brand_name}}`}</code>
                  <code className="bg-white px-2 py-1 rounded">{`{{instagram_handle}}`}</code>
                  <code className="bg-white px-2 py-1 rounded">{`{{campaign_name}}`}</code>
                  <code className="bg-white px-2 py-1 rounded">{`{{period}}`}</code>
                  <code className="bg-white px-2 py-1 rounded">{`{{current_date}}`}</code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {messagePreviews.map((preview, index) => (
                  <Card key={preview.engagementId} className={preview.customized ? 'border-blue-500' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{preview.influencerName}</span>
                          <span className="text-muted-foreground">•</span>
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{preview.brandName}</span>
                        </div>
                        {preview.customized && (
                          <Badge variant="secondary" className="text-xs">Customized</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label className="text-xs">Subject</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => setEditingPreview(
                              editingPreview === `${preview.engagementId}-subject` 
                                ? null 
                                : `${preview.engagementId}-subject`
                            )}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {editingPreview === `${preview.engagementId}-subject` ? (
                          <Input
                            value={preview.subject}
                            onChange={(e) => handleCustomizeMessage(preview.engagementId, 'subject', e.target.value)}
                            className="text-sm"
                            onBlur={() => setEditingPreview(null)}
                            autoFocus
                          />
                        ) : (
                          <p className="text-sm font-medium">{preview.subject}</p>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label className="text-xs">Message</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => setEditingPreview(
                              editingPreview === `${preview.engagementId}-content` 
                                ? null 
                                : `${preview.engagementId}-content`
                            )}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {editingPreview === `${preview.engagementId}-content` ? (
                          <Textarea
                            value={preview.content}
                            onChange={(e) => handleCustomizeMessage(preview.engagementId, 'content', e.target.value)}
                            className="text-sm min-h-[100px]"
                            onBlur={() => setEditingPreview(null)}
                            autoFocus
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {preview.content}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendOutreach} 
            disabled={sending || !messagePreviews.length || activeTab !== 'preview'}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send {messagePreviews.length} Message{messagePreviews.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}