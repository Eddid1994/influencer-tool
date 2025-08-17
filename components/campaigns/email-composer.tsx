'use client'

import { useState, useEffect } from 'react'
import { X, Send, Save, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface EmailComposerProps {
  isOpen: boolean
  onClose: () => void
  stage: string
  participants: any[]
  workflowId: string
  onSent: (updatedParticipants: any[]) => void
}

const DEFAULT_TEMPLATES = {
  outreach: {
    subject: 'Partnership Opportunity with {brand_name}',
    body: `Hi {influencer_name},

I hope this message finds you well! I've been following your amazing content and really admire your work in {niche}.

We'd love to explore a partnership opportunity with you for our upcoming campaign. Your authentic voice and engaged audience align perfectly with our brand values.

Campaign Details:
- Timeline: {timeline}
- Compensation: {budget}
- Deliverables: {deliverables}

Would you be interested in learning more? I'd love to schedule a quick call to discuss the details.

Looking forward to hearing from you!

Best regards,
{sender_name}`
  },
  reminder_1: {
    subject: 'Re: Partnership Opportunity with {brand_name}',
    body: `Hi {influencer_name},

I wanted to follow up on my previous email about the partnership opportunity.

I know your inbox is probably busy, so I wanted to make sure you saw our proposal. We're really excited about the possibility of working together!

If you're interested, just reply to this email and we can set up a time to chat.

Best,
{sender_name}`
  },
  reminder_2: {
    subject: 'Quick check-in: {brand_name} partnership',
    body: `Hi {influencer_name},

Just wanted to send a quick check-in about our partnership proposal.

We're finalizing our influencer roster this week, and I'd hate for you to miss out on this opportunity.

Would you have 15 minutes this week for a quick call?

Thanks,
{sender_name}`
  }
}

export default function EmailComposer({
  isOpen,
  onClose,
  stage,
  participants,
  workflowId,
  onSent
}: EmailComposerProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('custom')
  const [isSending, setIsSending] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const supabase = createClient()

  // Load templates
  useEffect(() => {
    async function loadTemplates() {
      const { data } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_type', getTemplateType())
        .order('is_default', { ascending: false })

      setTemplates(data || [])
      
      // Load default template
      if (stage === 'selected') {
        setSubject(DEFAULT_TEMPLATES.outreach.subject)
        setBody(DEFAULT_TEMPLATES.outreach.body)
      } else if (stage === 'follow_up') {
        setSubject(DEFAULT_TEMPLATES.reminder_1.subject)
        setBody(DEFAULT_TEMPLATES.reminder_1.body)
      }
    }
    
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, stage])

  const getTemplateType = () => {
    if (stage === 'selected') return 'outreach'
    if (stage === 'follow_up') return 'reminder_1'
    return 'outreach'
  }

  const getNextStage = () => {
    if (stage === 'selected') return 'outreach_sent'
    if (stage === 'follow_up') return 'reminder_1_sent'
    return stage
  }

  const handleSend = async () => {
    if (!subject || !body) {
      toast.error('Please fill in subject and message')
      return
    }

    setIsSending(true)

    try {
      // Update participants with new stage and email details
      const updates = participants.map(p => ({
        id: p.id,
        stage: getNextStage(),
        outreach_subject: subject,
        outreach_body: body,
        outreach_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      // Batch update all participants
      for (const update of updates) {
        await supabase
          .from('workflow_participants')
          .update({
            stage: update.stage,
            outreach_subject: update.outreach_subject,
            outreach_body: update.outreach_body,
            outreach_sent_at: update.outreach_sent_at,
            updated_at: update.updated_at
          })
          .eq('id', update.id)
      }

      // Log activities
      const activities = participants.map(p => ({
        workflow_id: workflowId,
        participant_id: p.id,
        influencer_id: p.influencer_id,
        activity_type: 'email_sent',
        description: `Outreach email sent to ${p.influencer?.name}`
      }))

      await supabase
        .from('workflow_activities')
        .insert(activities)

      toast.success(`Emails sent to ${participants.length} influencers`)
      
      // Update parent component
      const updatedParticipants = participants.map(p => ({
        ...p,
        stage: getNextStage(),
        outreach_sent_at: new Date().toISOString()
      }))
      
      onSent(updatedParticipants)
    } catch (error) {
      console.error('Error sending emails:', error)
      toast.error('Failed to send emails')
    } finally {
      setIsSending(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'custom') {
      setSelectedTemplate('custom')
      return
    }

    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setBody(template.body)
      setSelectedTemplate(templateId)
    }
  }

  const getVariables = () => {
    return [
      '{influencer_name}',
      '{brand_name}',
      '{campaign_name}',
      '{sender_name}',
      '{timeline}',
      '{budget}',
      '{deliverables}',
      '{niche}'
    ]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Compose Email</h2>
            <p className="text-sm text-gray-600 mt-1">
              Send to {participants.length} influencer{participants.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Recipients Preview */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Recipients:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.slice(0, 5).map(p => (
              <Badge key={p.id} variant="secondary">
                {p.influencer?.name}
              </Badge>
            ))}
            {participants.length > 5 && (
              <Badge variant="secondary">
                +{participants.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Template Selector */}
        <div className="p-4 border-b">
          <Label>Email Template</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Message</SelectItem>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Email body..."
                rows={12}
                className="mt-1 font-mono text-sm"
              />
            </div>

            {/* Variables Help */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Available Variables
              </p>
              <div className="flex flex-wrap gap-2">
                {getVariables().map(variable => (
                  <code
                    key={variable}
                    className="bg-white px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      navigator.clipboard.writeText(variable)
                      toast.success('Copied to clipboard')
                    }}
                  >
                    {variable}
                  </code>
                ))}
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Click to copy. These will be replaced with actual values when sending.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          </div>
          <Button 
            onClick={handleSend}
            disabled={isSending || !subject || !body}
          >
            {isSending ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {participants.length} Influencer{participants.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}