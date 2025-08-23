'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Send, 
  DollarSign, 
  MessageSquare, 
  Phone,
  Clock,
  FileText,
  ChevronDown,
  Mail
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { NegotiationStatus } from './negotiation-status-badge'
import { 
  negotiationOfferSchema, 
  negotiationCommunicationSchema, 
  negotiationTaskSchema,
  validateAndFormatAmount,
  sanitizeInput 
} from '@/lib/utils/validation'

interface NegotiationQuickActionsProps {
  negotiationId: string
  currentStatus: NegotiationStatus
  onUpdate?: () => void
  disabled?: boolean
}

export function NegotiationQuickActions({ 
  negotiationId, 
  currentStatus,
  onUpdate,
  disabled = false
}: NegotiationQuickActionsProps) {
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  // Offer form state
  const [offerAmount, setOfferAmount] = useState('')
  const [offerNotes, setOfferNotes] = useState('')
  const [offerType, setOfferType] = useState<'initial' | 'counter' | 'final'>('counter')

  // Message form state
  const [messageType, setMessageType] = useState<'email' | 'phone' | 'message'>('email')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')

  // Task form state
  const [taskType, setTaskType] = useState<'follow_up' | 'internal_review' | 'send_offer'>('follow_up')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskDescription, setTaskDescription] = useState('')

  const handleSendOffer = async () => {
    // Validate amount
    const amountCents = validateAndFormatAmount(offerAmount)
    if (!amountCents) {
      toast.error('Please enter a valid offer amount')
      return
    }
    
    if (amountCents > 100000000) { // $1,000,000 limit
      toast.error('Offer amount exceeds maximum limit of $1,000,000')
      return
    }

    setIsLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('Authentication error in handleSendOffer:', authError)
        toast.error('Please log in to send offers')
        return
      }

      // Prepare and validate offer data
      const offerData = {
        negotiation_id: negotiationId,
        offer_type: offerType,
        offered_by: 'brand' as const,
        amount_cents: amountCents,
        currency: 'USD',
        terms: { deliverables: [], payment_terms: 'standard' },
        notes: offerNotes ? sanitizeInput(offerNotes) : null,
        created_by: user.id
      }
      
      // Validate with schema
      try {
        negotiationOfferSchema.parse(offerData)
      } catch (validationError: any) {
        console.error('Validation error:', validationError)
        toast.error(`Invalid offer data: ${validationError.errors?.[0]?.message || 'Unknown validation error'}`)
        return
      }

      // Create the offer
      const { error } = await supabase
        .from('negotiation_offers')
        .insert(offerData)

      if (error) {
        console.error('Error creating offer:', error)
        throw error
      }

      // Update negotiation status if needed
      if (currentStatus === 'pending_outreach' || currentStatus === 'outreach_sent') {
        await supabase
          .from('campaign_negotiations')
          .update({ 
            status: 'negotiating',
            current_stage: 'price_negotiation',
            updated_by: user.id
          })
          .eq('id', negotiationId)
      }

      toast.success('Offer sent successfully')
      setIsOfferDialogOpen(false)
      setOfferAmount('')
      setOfferNotes('')
      onUpdate?.()
    } catch (error) {
      const err = error as any
      console.error('Error sending offer:', {
        message: err.message,
        code: err.code,
        details: err.details
      })
      toast.error(`Failed to send offer: ${err.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogCommunication = async () => {
    if (!messageContent || messageContent.trim().length === 0) {
      toast.error('Please enter message content')
      return
    }
    
    if (messageContent.length > 5000) {
      toast.error('Message content is too long (max 5000 characters)')
      return
    }

    setIsLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('Authentication error in handleLogCommunication:', authError)
        toast.error('Please log in to log communications')
        return
      }

      // Prepare and validate communication data
      const communicationData = {
        negotiation_id: negotiationId,
        communication_type: messageType,
        direction: 'outbound' as const,
        subject: messageSubject ? sanitizeInput(messageSubject) : null,
        content: sanitizeInput(messageContent),
        created_by: user.id
      }
      
      // Validate with schema
      try {
        negotiationCommunicationSchema.parse(communicationData)
      } catch (validationError: any) {
        console.error('Validation error:', validationError)
        toast.error(`Invalid communication data: ${validationError.errors?.[0]?.message || 'Unknown validation error'}`)
        return
      }

      const { error } = await supabase
        .from('negotiation_communications')
        .insert(communicationData)

      if (error) {
        console.error('Error creating communication:', error)
        throw error
      }

      // Update last contact date
      await supabase
        .from('campaign_negotiations')
        .update({ 
          last_contact_date: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', negotiationId)

      toast.success('Communication logged')
      setIsMessageDialogOpen(false)
      setMessageSubject('')
      setMessageContent('')
      onUpdate?.()
    } catch (error) {
      const err = error as any
      console.error('Error logging communication:', {
        message: err.message,
        code: err.code,
        details: err.details
      })
      toast.error(`Failed to log communication: ${err.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!taskTitle || taskTitle.trim().length === 0) {
      toast.error('Please enter a task title')
      return
    }
    
    if (!taskDueDate) {
      toast.error('Please select a due date')
      return
    }
    
    // Validate due date is in the future
    const dueDate = new Date(taskDueDate)
    if (dueDate < new Date()) {
      toast.error('Due date must be in the future')
      return
    }

    setIsLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('Authentication error in handleCreateTask:', authError)
        toast.error('Please log in to create tasks')
        return
      }

      // Prepare and validate task data
      const taskData = {
        negotiation_id: negotiationId,
        type: taskType,
        title: sanitizeInput(taskTitle),
        description: taskDescription ? sanitizeInput(taskDescription) : null,
        due_at: new Date(taskDueDate).toISOString(),
        assignee_id: user.id,
        created_by: user.id
      }
      
      // Validate with schema
      try {
        negotiationTaskSchema.parse(taskData)
      } catch (validationError: any) {
        console.error('Validation error:', validationError)
        toast.error(`Invalid task data: ${validationError.errors?.[0]?.message || 'Unknown validation error'}`)
        return
      }

      const { error } = await supabase
        .from('negotiation_tasks')
        .insert(taskData)

      if (error) {
        console.error('Error creating task:', error)
        throw error
      }

      toast.success('Task created')
      setIsTaskDialogOpen(false)
      setTaskTitle('')
      setTaskDescription('')
      setTaskDueDate('')
      onUpdate?.()
    } catch (error) {
      const err = error as any
      console.error('Error creating task:', {
        message: err.message,
        code: err.code,
        details: err.details
      })
      toast.error(`Failed to create task: ${err.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: NegotiationStatus) => {
    setIsLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('Authentication error in handleUpdateStatus:', authError)
        toast.error('Please log in to update status')
        return
      }

      const { error } = await supabase
        .from('campaign_negotiations')
        .update({ 
          status: newStatus,
          updated_by: user.id
        })
        .eq('id', negotiationId)

      if (error) {
        console.error('Error updating status:', error)
        throw error
      }

      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
      onUpdate?.()
    } catch (error) {
      const err = error as any
      console.error('Error updating status:', {
        message: err.message,
        code: err.code,
        details: err.details
      })
      toast.error(`Failed to update status: ${err.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        {/* Quick status updates */}
        {currentStatus === 'pending_outreach' && (
          <Button
            size="sm"
            onClick={() => handleUpdateStatus('outreach_sent')}
            disabled={isLoading || disabled}
          >
            <Send className="h-4 w-4 mr-2" />
            Mark Outreach Sent
          </Button>
        )}

        {currentStatus === 'outreach_sent' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateStatus('awaiting_response')}
            disabled={isLoading || disabled}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Got Response
          </Button>
        )}

        {/* Action buttons */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsOfferDialogOpen(true)}
          disabled={isLoading}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Send Offer
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsMessageDialogOpen(true)}
          disabled={isLoading}
        >
          <Mail className="h-4 w-4 mr-2" />
          Log Communication
        </Button>

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" disabled={isLoading || disabled}>
              More
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsTaskDialogOpen(true)}>
              <Clock className="h-4 w-4 mr-2" />
              Create Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateStatus('on_hold')}>
              <Clock className="h-4 w-4 mr-2" />
              Put On Hold
            </DropdownMenuItem>
            {currentStatus !== 'agreed' && (
              <DropdownMenuItem 
                onClick={() => handleUpdateStatus('agreed')}
                className="text-green-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                Mark as Agreed
              </DropdownMenuItem>
            )}
            {currentStatus !== 'declined' && (
              <DropdownMenuItem 
                onClick={() => handleUpdateStatus('declined')}
                className="text-red-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                Mark as Declined
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Send Offer Dialog */}
      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Offer</DialogTitle>
            <DialogDescription>
              Create a new offer for this negotiation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="offer-type">Offer Type</Label>
              <Select value={offerType} onValueChange={(v: any) => setOfferType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Initial Offer</SelectItem>
                  <SelectItem value="counter">Counter Offer</SelectItem>
                  <SelectItem value="final">Final Offer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="offer-amount">Amount (USD)</Label>
              <Input
                id="offer-amount"
                type="number"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="offer-notes">Notes (optional)</Label>
              <Textarea
                id="offer-notes"
                placeholder="Additional terms or notes..."
                value={offerNotes}
                onChange={(e) => setOfferNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOfferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendOffer} disabled={isLoading}>
              Send Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Communication Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
            <DialogDescription>
              Record a communication with the influencer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message-type">Communication Type</Label>
              <Select value={messageType} onValueChange={(v: any) => setMessageType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="message">Message/DM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message-subject">Subject (optional)</Label>
              <Input
                id="message-subject"
                placeholder="Subject or topic..."
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="message-content">Content</Label>
              <Textarea
                id="message-content"
                placeholder="Summary of the communication..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogCommunication} disabled={isLoading}>
              Log Communication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Set a reminder or task for this negotiation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-type">Task Type</Label>
              <Select value={taskType} onValueChange={(v: any) => setTaskType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="internal_review">Internal Review</SelectItem>
                  <SelectItem value="send_offer">Send Offer</SelectItem>
                  <SelectItem value="send_contract">Send Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="Task title..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="task-due">Due Date</Label>
              <Input
                id="task-due"
                type="datetime-local"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description (optional)</Label>
              <Textarea
                id="task-description"
                placeholder="Additional details..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={isLoading}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}