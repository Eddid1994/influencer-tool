'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Mail, Filter } from 'lucide-react'
import TemplatesTable from '@/components/templates/templates-table'
import TemplateEditor from '@/components/templates/template-editor'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'

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

interface ClientTemplatesPageProps {
  templates: Template[]
}

const templateTypes = {
  all: 'All Templates',
  initial_outreach: 'Initial Outreach',
  follow_up: 'Follow Up',
  reminder: 'Reminders',
  offer: 'Offers',
  counter_offer: 'Counter Offers',
  agreement: 'Agreements',
  decline: 'Declines',
  on_hold: 'On Hold',
  contract: 'Contracts',
  invoice: 'Invoices',
  thank_you: 'Thank You',
  feedback: 'Feedback',
  custom: 'Custom'
}

const templateCategories = {
  outreach: ['initial_outreach', 'follow_up', 'reminder'],
  negotiation: ['offer', 'counter_offer', 'agreement'],
  administrative: ['decline', 'on_hold', 'contract', 'invoice'],
  general: ['thank_you', 'feedback', 'custom']
}

export default function ClientTemplatesPage({ templates }: ClientTemplatesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  // Filter templates based on category and search
  const filteredTemplates = templates.filter(template => {
    // Category filter
    if (selectedCategory !== 'all') {
      const categoryTypes = templateCategories[selectedCategory as keyof typeof templateCategories]
      if (categoryTypes && !categoryTypes.includes(template.template_type)) {
        return false
      }
    }

    // Active filter
    if (showActiveOnly && !template.is_active) {
      return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        template.name.toLowerCase().includes(query) ||
        template.subject.toLowerCase().includes(query) ||
        template.content.toLowerCase().includes(query)
      )
    }

    return true
  })

  const handleNewTemplate = () => {
    setEditingTemplate(null)
    setIsEditorOpen(true)
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingTemplate(null)
  }

  // Count templates by category
  const getCategoryCount = (category: string) => {
    if (category === 'all') return templates.length
    
    const categoryTypes = templateCategories[category as keyof typeof templateCategories]
    if (!categoryTypes) return 0
    
    return templates.filter(t => categoryTypes.includes(t.template_type)).length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-500">
            Manage your outreach and communication templates
          </p>
        </div>
        <Button onClick={handleNewTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          variant={showActiveOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowActiveOnly(!showActiveOnly)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Active Only
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2 text-xs">
              {getCategoryCount('all')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="outreach">
            Outreach
            <Badge variant="secondary" className="ml-2 text-xs">
              {getCategoryCount('outreach')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="negotiation">
            Negotiation
            <Badge variant="secondary" className="ml-2 text-xs">
              {getCategoryCount('negotiation')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="administrative">
            Admin
            <Badge variant="secondary" className="ml-2 text-xs">
              {getCategoryCount('administrative')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="general">
            General
            <Badge variant="secondary" className="ml-2 text-xs">
              {getCategoryCount('general')}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          {filteredTemplates.length > 0 ? (
            <TemplatesTable
              templates={filteredTemplates}
              onEdit={handleEditTemplate}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No templates found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? "Try adjusting your search query"
                  : "Create your first template to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={handleNewTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Editor Dialog/Panel */}
      <TemplateEditor
        open={isEditorOpen}
        onClose={handleCloseEditor}
        template={editingTemplate}
        templateTypes={templateTypes}
      />
    </div>
  )
}