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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Save,
  Eye,
  Code,
  FileText,
  User,
  Building2,
  Calendar,
  Hash,
  AtSign,
  Type,
  Loader2,
  Copy,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  subject: string
  content: string
  template_type: string
  is_active: boolean
  variables: any
  created_at: string
  updated_at: string
  created_by: string | null
}

interface TemplateEditorProps {
  open: boolean
  onClose: () => void
  template?: Template | null
  templateTypes: Record<string, string>
}

const availableVariables = [
  { name: 'influencer_name', icon: User, description: 'Influencer\'s full name' },
  { name: 'brand_name', icon: Building2, description: 'Brand company name' },
  { name: 'instagram_handle', icon: AtSign, description: 'Instagram username' },
  { name: 'campaign_name', icon: Type, description: 'Campaign/Engagement name' },
  { name: 'period', icon: Calendar, description: 'Engagement period' },
  { name: 'current_date', icon: Calendar, description: 'Today\'s date' },
  { name: 'current_month', icon: Calendar, description: 'Current month name' },
  { name: 'current_year', icon: Calendar, description: 'Current year' },
]

export default function TemplateEditor({
  open,
  onClose,
  template,
  templateTypes
}: TemplateEditorProps) {
  const [form, setForm] = useState({
    name: '',
    subject: '',
    content: '',
    template_type: 'initial_outreach',
    is_active: true,
    variables: {}
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (template) {
      setForm({
        name: template.name,
        subject: template.subject,
        content: template.content,
        template_type: template.template_type,
        is_active: template.is_active,
        variables: template.variables || {}
      })
    } else {
      setForm({
        name: '',
        subject: '',
        content: '',
        template_type: 'initial_outreach',
        is_active: true,
        variables: {}
      })
    }
    setActiveTab('edit')
  }, [template])

  const handleSave = async () => {
    if (!form.name || !form.subject || !form.content) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      if (template) {
        // Update existing template
        const { error } = await supabase
          .from('outreach_templates')
          .update({
            name: form.name,
            subject: form.subject,
            content: form.content,
            template_type: form.template_type,
            is_active: form.is_active,
            variables: form.variables,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id)

        if (error) throw error
        toast.success('Template updated successfully')
      } else {
        // Create new template
        const { error } = await supabase
          .from('outreach_templates')
          .insert({
            name: form.name,
            subject: form.subject,
            content: form.content,
            template_type: form.template_type,
            is_active: form.is_active,
            variables: form.variables
          })

        if (error) throw error
        toast.success('Template created successfully')
      }

      window.location.reload()
      onClose()
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = form.content
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      const newText = `${before}{{${variable}}}${after}`
      setForm({ ...form, content: newText })
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus()
        const newPosition = start + variable.length + 4 // +4 for {{}}
        textarea.setSelectionRange(newPosition, newPosition)
      }, 0)
    }
  }

  const insertSubjectVariable = (variable: string) => {
    const input = document.getElementById('template-subject') as HTMLInputElement
    if (input) {
      const start = input.selectionStart || 0
      const end = input.selectionEnd || 0
      const text = form.subject
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      const newText = `${before}{{${variable}}}${after}`
      setForm({ ...form, subject: newText })
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        input.focus()
        const newPosition = start + variable.length + 4
        input.setSelectionRange(newPosition, newPosition)
      }, 0)
    }
  }

  const getPreviewText = (text: string) => {
    let preview = text
    preview = preview.replace(/\{\{influencer_name\}\}/g, 'Sarah Johnson')
    preview = preview.replace(/\{\{brand_name\}\}/g, 'TechStyle Co.')
    preview = preview.replace(/\{\{instagram_handle\}\}/g, '@sarahjohnson')
    preview = preview.replace(/\{\{campaign_name\}\}/g, 'Summer Collection 2024')
    preview = preview.replace(/\{\{period\}\}/g, '2024-08')
    preview = preview.replace(/\{\{current_date\}\}/g, new Date().toLocaleDateString())
    preview = preview.replace(/\{\{current_month\}\}/g, new Date().toLocaleDateString('en-US', { month: 'long' }))
    preview = preview.replace(/\{\{current_year\}\}/g, new Date().getFullYear().toString())
    return preview
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogDescription>
            Create reusable email templates with dynamic variables for personalized communication
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">
              <FileText className="h-4 w-4 mr-2" />
              Edit Template
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="edit" className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Initial Outreach - Influencer"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Template Type *</Label>
                  <Select 
                    value={form.template_type} 
                    onValueChange={(value) => setForm({ ...form, template_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial_outreach">Initial Outreach</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="counter_offer">Counter Offer</SelectItem>
                      <SelectItem value="agreement">Agreement</SelectItem>
                      <SelectItem value="decline">Decline</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="thank_you">Thank You</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="template-subject">Subject Line *</Label>
                <div className="space-y-2">
                  <Input
                    id="template-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g., Collaboration Opportunity with {{brand_name}}"
                  />
                  <div className="flex gap-2 flex-wrap">
                    {availableVariables.slice(0, 4).map((variable) => (
                      <Button
                        key={variable.name}
                        variant="outline"
                        size="sm"
                        onClick={() => insertSubjectVariable(variable.name)}
                        className="h-7 text-xs"
                      >
                        <variable.icon className="h-3 w-3 mr-1" />
                        {variable.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="template-content">Message Content *</Label>
                <Textarea
                  id="template-content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your email template here..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Available Variables</CardTitle>
                  <CardDescription className="text-xs">
                    Click to insert at cursor position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {availableVariables.map((variable) => (
                      <Button
                        key={variable.name}
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(variable.name)}
                        className="justify-start bg-white"
                      >
                        <variable.icon className="h-3 w-3 mr-2" />
                        <code className="text-xs mr-2">{`{{${variable.name}}}`}</code>
                        <span className="text-xs text-gray-500 ml-auto">
                          {variable.description}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                  <Label className="text-sm">Active</Label>
                  <span className="text-xs text-gray-500">
                    (Active templates can be used in outreach)
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Preview with Sample Data</CardTitle>
                  <CardDescription className="text-xs">
                    This shows how your template will look with actual data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Subject</Label>
                    <p className="font-medium">{getPreviewText(form.subject)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Message</Label>
                    <div className="bg-white border rounded-md p-4 whitespace-pre-wrap">
                      {getPreviewText(form.content)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Sample Data Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><strong>Influencer:</strong> Sarah Johnson</div>
                    <div><strong>Brand:</strong> TechStyle Co.</div>
                    <div><strong>Instagram:</strong> @sarahjohnson</div>
                    <div><strong>Campaign:</strong> Summer Collection 2024</div>
                    <div><strong>Period:</strong> 2024-08</div>
                    <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {template ? 'Update Template' : 'Create Template'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}