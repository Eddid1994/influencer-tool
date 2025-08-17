'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, Send, Clock, MessageSquare, CheckCircle, XCircle, Users, Mail, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import InfluencerSelector from './influencer-selector'
import EmailComposer from './email-composer'

interface WorkflowPipelineProps {
  campaignId: string
  campaign: any
  workflow: any
  participants: any[]
  allInfluencers: any[]
}

const PIPELINE_STAGES = [
  {
    id: 'selected',
    title: 'Selected',
    icon: Users,
    color: 'bg-gray-100',
    description: 'Influencers added to campaign'
  },
  {
    id: 'outreach_sent',
    title: 'Outreach Sent',
    icon: Send,
    color: 'bg-blue-100',
    description: 'Initial email sent'
  },
  {
    id: 'follow_up',
    title: 'Follow-up',
    icon: Clock,
    color: 'bg-yellow-100',
    description: 'Awaiting response',
    subStages: ['reminder_1_sent', 'reminder_2_sent', 'reminder_3_sent']
  },
  {
    id: 'negotiating',
    title: 'Negotiating',
    icon: MessageSquare,
    color: 'bg-purple-100',
    description: 'Discussing terms',
    subStages: ['responded', 'negotiating']
  },
  {
    id: 'agreed',
    title: 'Agreed',
    icon: CheckCircle,
    color: 'bg-green-100',
    description: 'Terms agreed',
    subStages: ['agreed', 'contracted']
  },
  {
    id: 'live',
    title: 'Campaign Live',
    icon: CheckCircle,
    color: 'bg-emerald-100',
    description: 'Active campaign',
    subStages: ['creating_content', 'content_approved', 'campaign_live']
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: CheckCircle,
    color: 'bg-gray-100',
    description: 'Campaign finished',
    subStages: ['completed', 'rejected', 'no_response']
  }
]

export default function WorkflowPipeline({
  campaignId,
  campaign,
  workflow,
  participants: initialParticipants,
  allInfluencers
}: WorkflowPipelineProps) {
  const [participants, setParticipants] = useState(initialParticipants)
  const [isSelectingInfluencers, setIsSelectingInfluencers] = useState(false)
  const [isSendingEmails, setIsSendingEmails] = useState(false)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [workflowId, setWorkflowId] = useState(workflow?.id)
  const [isDragging, setIsDragging] = useState(false)
  const supabase = createClient()

  // Group participants by stage
  const getParticipantsByStage = (stageId: string) => {
    const stage = PIPELINE_STAGES.find(s => s.id === stageId)
    if (!stage) return []

    if (stage.subStages) {
      return participants.filter(p => 
        p.stage === stageId || stage.subStages.includes(p.stage)
      )
    }
    return participants.filter(p => p.stage === stageId)
  }

  // Create workflow if it doesn't exist
  useEffect(() => {
    async function createWorkflowIfNeeded() {
      if (!workflow && campaignId) {
        const { data, error } = await supabase
          .from('campaign_workflows')
          .insert({
            campaign_id: campaignId,
            brand_id: campaign.brand_id,
            name: `${campaign.campaign_name} Workflow`,
            status: 'active'
          })
          .select()
          .single()

        if (data) {
          setWorkflowId(data.id)
        }
      }
    }
    createWorkflowIfNeeded()
  }, [workflow, campaignId])

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false)
    
    if (!result.destination) return
    if (result.source.droppableId === result.destination.droppableId) return

    const participantId = result.draggableId
    const newStage = result.destination.droppableId
    
    // Update local state immediately for responsiveness
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId ? { ...p, stage: newStage } : p
      )
    )

    // Update in database
    const { error } = await supabase
      .from('workflow_participants')
      .update({ 
        stage: newStage,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId)

    if (error) {
      toast.error('Failed to update stage')
      // Revert on error
      setParticipants(initialParticipants)
    } else {
      toast.success('Stage updated')
    }
  }

  // Add influencers to workflow
  const handleAddInfluencers = async (influencerIds: string[]) => {
    if (!workflowId) {
      toast.error('Workflow not initialized')
      return
    }

    const newParticipants = influencerIds.map(influencerId => ({
      workflow_id: workflowId,
      influencer_id: influencerId,
      stage: 'selected'
    }))

    const { data, error } = await supabase
      .from('workflow_participants')
      .insert(newParticipants)
      .select(`
        *,
        influencer:influencer_id (
          id,
          name,
          email,
          instagram_handle,
          instagram_followers,
          status
        )
      `)

    if (error) {
      toast.error('Failed to add influencers')
    } else {
      setParticipants(prev => [...prev, ...data])
      toast.success(`Added ${influencerIds.length} influencers`)
      setIsSelectingInfluencers(false)
    }
  }

  // Send bulk emails
  const handleSendEmails = async (stage: string) => {
    const stageParticipants = getParticipantsByStage(stage)
    if (stageParticipants.length === 0) {
      toast.error('No influencers in this stage')
      return
    }

    setSelectedStage(stage)
    setIsSendingEmails(true)
  }

  // Format follower count
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
    return count.toString()
  }

  // Get stage progress
  const getStageProgress = (stageId: string) => {
    const count = getParticipantsByStage(stageId).length
    const total = participants.length
    if (total === 0) return 0
    return Math.round((count / total) * 100)
  }

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {PIPELINE_STAGES.slice(0, 6).map(stage => {
          const count = getParticipantsByStage(stage.id).length
          const Icon = stage.icon
          return (
            <Card key={stage.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4 text-gray-500" />
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <p className="text-sm text-gray-600">{stage.title}</p>
              <div className="mt-2 h-1 bg-gray-200 rounded">
                <div 
                  className="h-1 bg-blue-500 rounded"
                  style={{ width: `${getStageProgress(stage.id)}%` }}
                />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Action Bar */}
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setIsSelectingInfluencers(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Influencers
        </Button>
        <Button 
          variant="outline"
          onClick={() => handleSendEmails('selected')}
          disabled={getParticipantsByStage('selected').length === 0}
        >
          <Mail className="h-4 w-4 mr-2" />
          Send Outreach
        </Button>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Workflow Settings
        </Button>
      </div>

      {/* Pipeline Board */}
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={() => setIsDragging(true)}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map(stage => {
            const stageParticipants = getParticipantsByStage(stage.id)
            const Icon = stage.icon
            
            return (
              <div key={stage.id} className="min-w-[280px]">
                <div className={`${stage.color} rounded-t-lg p-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <h3 className="font-semibold">{stage.title}</h3>
                      <Badge variant="secondary" className="ml-1">
                        {stageParticipants.length}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{stage.description}</p>
                </div>
                
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-gray-50 min-h-[400px] p-2 space-y-2 border-x border-b rounded-b-lg ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {stageParticipants.map((participant, index) => (
                        <Draggable
                          key={participant.id}
                          draggableId={participant.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg p-3 shadow-sm border ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              } hover:shadow-md transition-shadow cursor-move`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {participant.influencer?.name?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {participant.influencer?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {participant.influencer?.instagram_handle}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                                {participant.influencer?.instagram_followers && (
                                  <span>
                                    📸 {formatFollowers(participant.influencer.instagram_followers)}
                                  </span>
                                )}
                                {participant.outreach_sent_at && (
                                  <span>
                                    ✉️ {new Date(participant.outreach_sent_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>

                              {/* Stage-specific info */}
                              {stage.id === 'negotiating' && participant.initial_offer && (
                                <div className="mt-2 text-xs">
                                  <span className="text-gray-500">Offer:</span>
                                  <span className="ml-1 font-medium">
                                    ${participant.initial_offer.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              
                              {stage.id === 'follow_up' && participant.reminder_1_sent_at && (
                                <div className="mt-2 text-xs text-orange-600">
                                  🔔 Reminder sent
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Stage Actions */}
                      {stage.id === 'selected' && stageParticipants.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleSendEmails('selected')}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Send Outreach to All
                        </Button>
                      )}
                      
                      {stage.id === 'follow_up' && stageParticipants.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleSendEmails('follow_up')}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Send Reminders
                        </Button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* Modals */}
      {isSelectingInfluencers && (
        <InfluencerSelector
          isOpen={isSelectingInfluencers}
          onClose={() => setIsSelectingInfluencers(false)}
          onSelect={handleAddInfluencers}
          allInfluencers={allInfluencers}
          existingParticipants={participants}
        />
      )}

      {isSendingEmails && selectedStage && (
        <EmailComposer
          isOpen={isSendingEmails}
          onClose={() => {
            setIsSendingEmails(false)
            setSelectedStage(null)
          }}
          stage={selectedStage}
          participants={getParticipantsByStage(selectedStage)}
          workflowId={workflowId}
          onSent={(updatedParticipants) => {
            setParticipants(prev => {
              const updatedIds = updatedParticipants.map(p => p.id)
              return prev.map(p => 
                updatedIds.includes(p.id) ? 
                  updatedParticipants.find(up => up.id === p.id) : 
                  p
              )
            })
            setIsSendingEmails(false)
            setSelectedStage(null)
          }}
        />
      )}
    </div>
  )
}