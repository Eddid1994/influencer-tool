'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface TaskDialogProps {
  engagementId: string
  onTaskCreated: () => void
  children?: React.ReactNode
}

type TaskType = 'followup' | 'reminder' | 'content_review' | 'payment' | 'product_shipment'

export default function TaskDialog({ engagementId, onTaskCreated, children }: TaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'followup' as TaskType,
    dueDate: ''
  })

  const supabase = createClientComponentClient<Database>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.dueDate) {
      toast.error('Title and due date are required')
      return
    }

    setLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      // Convert date string to ISO format
      const dueDate = new Date(form.dueDate)
      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date')
      }

      const { error } = await supabase
        .from('engagement_tasks')
        .insert({
          engagement_id: engagementId,
          title: form.title.trim(),
          description: form.description.trim() || null,
          type: form.type,
          due_at: dueDate.toISOString(),
          assignee_id: user.id, // Assign to current user by default
        })

      if (error) throw error

      toast.success('Task created successfully')
      setForm({
        title: '',
        description: '',
        type: 'followup',
        dueDate: ''
      })
      setOpen(false)
      onTaskCreated()
    } catch (error: any) {
      console.error('Error creating task:', error)
      toast.error(`Failed to create task: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const taskTypes: { value: TaskType; label: string }[] = [
    { value: 'followup', label: 'Follow-up' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'content_review', label: 'Content Review' },
    { value: 'payment', label: 'Payment' },
    { value: 'product_shipment', label: 'Product Shipment' },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional task description"
              className="min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={form.type} onValueChange={(value: TaskType) => setForm({ ...form, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}