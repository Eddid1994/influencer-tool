'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Edit, 
  Copy, 
  Trash, 
  MoreVertical, 
  Mail,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
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

interface TemplatesTableProps {
  templates: Template[]
  onEdit: (template: Template) => void
}

const typeColors: Record<string, string> = {
  initial_outreach: 'bg-blue-100 text-blue-800',
  follow_up: 'bg-indigo-100 text-indigo-800',
  reminder: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  counter_offer: 'bg-emerald-100 text-emerald-800',
  agreement: 'bg-teal-100 text-teal-800',
  decline: 'bg-red-100 text-red-800',
  on_hold: 'bg-orange-100 text-orange-800',
  contract: 'bg-yellow-100 text-yellow-800',
  invoice: 'bg-amber-100 text-amber-800',
  thank_you: 'bg-pink-100 text-pink-800',
  feedback: 'bg-cyan-100 text-cyan-800',
  custom: 'bg-gray-100 text-gray-800',
}

export default function TemplatesTable({ templates, onEdit }: TemplatesTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const handleToggleActive = async (template: Template) => {
    setUpdating(template.id)
    try {
      const { error } = await supabase
        .from('outreach_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id)

      if (error) throw error

      toast.success(
        template.is_active 
          ? `Template "${template.name}" deactivated` 
          : `Template "${template.name}" activated`
      )
      
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating template:', error)
      toast.error('Failed to update template status')
    } finally {
      setUpdating(null)
    }
  }

  const handleDuplicate = async (template: Template) => {
    try {
      const newTemplate = {
        name: `${template.name} (Copy)`,
        subject: template.subject,
        content: template.content,
        template_type: template.template_type,
        is_active: false,
        variables: template.variables
      }

      const { error } = await supabase
        .from('outreach_templates')
        .insert(newTemplate)

      if (error) throw error

      toast.success(`Template "${template.name}" duplicated`)
      window.location.reload()
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast.error('Failed to duplicate template')
    }
  }

  const handleDelete = async (template: Template) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('outreach_templates')
        .delete()
        .eq('id', template.id)

      if (error) throw error

      toast.success(`Template "${template.name}" deleted`)
      window.location.reload()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const formatTypeName = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Template Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>
                <Mail className="h-4 w-4 text-gray-400" />
              </TableCell>
              <TableCell className="font-medium">
                {template.name}
              </TableCell>
              <TableCell>
                <Badge 
                  className={typeColors[template.template_type] || typeColors.custom}
                  variant="secondary"
                >
                  {formatTypeName(template.template_type)}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {template.subject}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={template.is_active}
                    onCheckedChange={() => handleToggleActive(template)}
                    disabled={updating === template.id}
                  />
                  <span className="text-sm text-gray-500">
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-3 w-3" />
                  {format(new Date(template.updated_at), 'MMM d, yyyy')}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(template)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(template)}
                      className="text-red-600"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}