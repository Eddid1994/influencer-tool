'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Send,
  Clock,
  Link,
  AlertCircle,
  CheckCircle,
  Mail,
  User,
  Building2,
  Calendar,
  Loader2,
  Eye,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface UnifiedTemplateSenderProps {
  open: boolean
  onClose: () => void
  engagements: any[] // Can be one or many
  mode: 'single' | 'bulk'
  onSuccess?: () => void
  preselectedTemplate?: string
}

interface Template {
  id: string
  name: string
  subject: string
  content: string
  template_type: string
  automation_trigger?: string
  automation_delay_days?: number
  automation_next_template_id?: string
  automation_stop_condition?: string
}

interface ScheduledMessage {
  template_id: string
  template_name: string
  scheduled_for: Date
  delay_days: number
}

export default function UnifiedTemplateSender({
  open,
  onClose,
  engagements,
  mode,
  onSuccess,
  preselectedTemplate
}: UnifiedTemplateSenderProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>(preselectedTemplate || '')
  const [customSubject, setCustomSubject] = useState('')
  const [customContent, setCustomContent] = useState('')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('compose')
  const [automationChain, setAutomationChain] = useState<ScheduledMessage[]>([])
  const [enableAutomation, setEnableAutomation] = useState(true)
  
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open])

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate)
      if (template) {
        setCustomSubject(template.subject)
        setCustomContent(template.content)
        loadAutomationChain(template)
      }
    }
  }, [selectedTemplate, templates])

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('outreach_templates')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setTemplates(data || [])
      
      if (preselectedTemplate && data) {
        setSelectedTemplate(preselectedTemplate)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Failed to load templates')
    }
  }

  const loadAutomationChain = async (template: Template) => {
    const chain: ScheduledMessage[] = []
    let currentTemplate: Template | undefined = template
    let totalDays = 0
    let steps = 0
    
    // Build the automation chain
    while (currentTemplate?.automation_next_template_id && steps < 10) {
      totalDays += currentTemplate.automation_delay_days || 3
      
      const nextTemplate = templates.find(t => t.id === currentTemplate?.automation_next_template_id)
      if (nextTemplate) {
        chain.push({
          template_id: nextTemplate.id,
          template_name: nextTemplate.name,
          scheduled_for: new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000),
          delay_days: currentTemplate.automation_delay_days || 3
        })
        currentTemplate = nextTemplate
      } else {
        break
      }
      steps++
    }
    
    setAutomationChain(chain)
  }

  const replaceVariables = (text: string, engagement: any): string => {
    let result = text
    result = result.replace(/\{\{influencer_name\}\}/g, engagement.influencers?.name || 'there')
    result = result.replace(/\{\{brand_name\}\}/g, engagement.brands?.name || 'Brand')
    result = result.replace(/\{\{instagram_handle\}\}/g, engagement.influencers?.instagram_handle || '@handle')
    result = result.replace(/\{\{campaign_name\}\}/g, engagement.campaign_name || 'Campaign')
    result = result.replace(/\{\{period\}\}/g, engagement.period_label || 'This period')
    
    const today = new Date()
    result = result.replace(/\{\{current_date\}\}/g, today.toLocaleDateString())
    result = result.replace(/\{\{current_month\}\}/g, today.toLocaleDateString('en-US', { month: 'long' }))
    result = result.replace(/\{\{current_year\}\}/g, today.getFullYear().toString())
    
    return result
  }

  const handleSend = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template')
      return
    }

    setSending(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const engagement of engagements) {
        try {
          // Get current messages from engagement
          const { data: currentEngagement } = await supabase
            .from('engagements')
            .select('messages_sent, scheduled_messages, negotiation_data')
            .eq('id', engagement.id)
            .single()

          const messagesSent = currentEngagement?.messages_sent || []
          const scheduledMessages = currentEngagement?.scheduled_messages || []
          const negotiationData = currentEngagement?.negotiation_data || { 
            communications: [], 
            offers: [], 
            timeline: [] 
          }

          // Add this message to history
          const newMessage = {
            id: crypto.randomUUID(),
            template_id: selectedTemplate,
            template_name: templates.find(t => t.id === selectedTemplate)?.name,
            subject: replaceVariables(customSubject, engagement),
            content: replaceVariables(customContent, engagement),
            sent_at: new Date().toISOString(),
            type: 'email',
            direction: 'outbound'
          }

          messagesSent.push(newMessage)
          negotiationData.communications.push(newMessage)

          // Schedule follow-ups if automation is enabled
          if (enableAutomation && automationChain.length > 0) {
            automationChain.forEach(scheduled => {
              scheduledMessages.push({
                ...scheduled,
                engagement_id: engagement.id,
                scheduled_for: scheduled.scheduled_for.toISOString()
              })
            })
          }

          // Update engagement
          const { error: updateError } = await supabase
            .from('engagements')
            .update({
              messages_sent: messagesSent,
              scheduled_messages: scheduledMessages,
              negotiation_data: negotiationData,
              last_contact_date: new Date().toISOString(),
              negotiation_status: engagement.negotiation_status === 'pending_outreach' 
                ? 'outreach_sent' 
                : engagement.negotiation_status
            })
            .eq('id', engagement.id)

          if (updateError) throw updateError
          successCount++
        } catch (error) {
          console.error(`Error sending to ${engagement.influencers?.name}:`, error)
          errorCount++
        }
      }

      if (successCount > 0) {
        toast.success(
          mode === 'bulk' 
            ? `Sent to ${successCount} engagement${successCount !== 1 ? 's' : ''}`
            : 'Message sent successfully'
        )
        onSuccess?.()
        onClose()
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to send to ${errorCount} engagement${errorCount !== 1 ? 's' : ''}`)
      }
    } catch (error) {
      console.error('Error sending messages:', error)
      toast.error('Failed to send messages')
    } finally {
      setSending(false)
    }
  }

  const selectedTemplateObj = templates.find(t => t.id === selectedTemplate)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {mode === 'bulk' 
              ? `Send to ${engagements.length} Engagement${engagements.length !== 1 ? 's' : ''}`
              : `Send Message to ${engagements[0]?.influencers?.name || 'Engagement'}`
            }
          </DialogTitle>
          <DialogDescription>
            Use templates for consistent communication with automated follow-ups
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">
              <Mail className="h-4 w-4 mr-2" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="automation" disabled={!selectedTemplate}>
              <Zap className="h-4 w-4 mr-2" />
              Automation ({automationChain.length})
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedTemplate}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[450px] mt-4">
            <TabsContent value="compose" className="space-y-4 pr-4">
              <div>
                <Label>Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {template.name}
                          {template.automation_next_template_id && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              +{automationChain.length} auto
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subject</Label>
                <Input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Email content..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Available Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <code className="bg-white px-2 py-1 rounded">{`{{influencer_name}}`}</code>
                    <code className="bg-white px-2 py-1 rounded">{`{{brand_name}}`}</code>
                    <code className="bg-white px-2 py-1 rounded">{`{{instagram_handle}}`}</code>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4 pr-4">
              <div className="flex items-center justify-between">
                <Label>Enable Automated Follow-ups</Label>
                <Button
                  variant={enableAutomation ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEnableAutomation(!enableAutomation)}
                >
                  {enableAutomation ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              {automationChain.length > 0 ? (
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      These follow-ups will be sent automatically if no response is received
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Initial Message</div>
                        <div className="text-xs text-gray-500">Sends immediately</div>
                      </div>
                    </div>

                    {automationChain.map((scheduled, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{scheduled.template_name}</div>
                          <div className="text-xs text-gray-500">
                            After {scheduled.delay_days} days • {format(scheduled.scheduled_for, 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">
                      No automation configured for this template
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedTemplateObj?.automation_stop_condition && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Automation stops when: {selectedTemplateObj.automation_stop_condition.replace(/_/g, ' ')}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 pr-4">
              {mode === 'bulk' ? (
                <div className="space-y-3">
                  <Alert>
                    <Eye className="h-4 w-4" />
                    <AlertDescription>
                      Preview showing first 3 recipients
                    </AlertDescription>
                  </Alert>
                  {engagements.slice(0, 3).map((engagement, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{engagement.influencers?.name}</span>
                          <Badge variant="secondary">{engagement.brands?.name}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <Label className="text-xs">Subject</Label>
                          <p className="text-sm">{replaceVariables(customSubject, engagement)}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Message Preview</Label>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                            {replaceVariables(customContent, engagement)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Message Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">To</Label>
                      <p className="font-medium">{engagements[0]?.influencers?.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Subject</Label>
                      <p className="font-medium">{replaceVariables(customSubject, engagements[0])}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Message</Label>
                      <div className="bg-white border rounded-md p-4 whitespace-pre-wrap">
                        {replaceVariables(customContent, engagements[0])}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !selectedTemplate}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send {mode === 'bulk' ? `to ${engagements.length}` : 'Message'}
                {enableAutomation && automationChain.length > 0 && ` (+${automationChain.length} auto)`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}