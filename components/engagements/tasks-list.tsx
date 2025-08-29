'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import TaskDialog from './task-dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Task = Database['public']['Tables']['engagement_tasks']['Row'];

interface TasksListProps {
  engagementId: string;
  tasks: Task[];
  onUpdate: () => void;
}

const taskTypeColors = {
  followup: 'bg-blue-100 text-blue-800',
  reminder: 'bg-yellow-100 text-yellow-800',
  content_review: 'bg-purple-100 text-purple-800',
  payment: 'bg-green-100 text-green-800',
  product_shipment: 'bg-orange-100 text-orange-800',
};

export default function TasksList({ engagementId, tasks, onUpdate }: TasksListProps) {
  const supabase = createClientComponentClient<Database>();

  const completeTask = async (taskId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('engagement_tasks')
        .update({
          completed_at: new Date().toISOString(),
          completed_by: user?.id || null,
        })
        .eq('id', taskId);

      if (error) throw error;
      toast.success('Task marked as complete');
      onUpdate();
    } catch (error: any) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed_at);
  const completedTasks = tasks.filter(t => t.completed_at);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Pending Tasks ({pendingTasks.length})</CardTitle>
            <TaskDialog 
              engagementId={engagementId} 
              onTaskCreated={onUpdate}
            />
          </div>
        </CardHeader>
        <CardContent>
          {pendingTasks.length > 0 ? (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    onCheckedChange={() => completeTask(task.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{task.title}</p>
                      <Badge 
                        className={taskTypeColors[task.type as keyof typeof taskTypeColors]}
                        variant="secondary"
                      >
                        {task.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due {format(new Date(task.due_at), 'MMM d, yyyy')}
                      </span>
                      {task.assignee_id && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Assigned
                        </span>
                      )}
                    </div>
                  </div>
                  {new Date(task.due_at) < new Date() && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">All tasks completed!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks ({completedTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 text-sm text-muted-foreground"
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="line-through">{task.title}</span>
                  <span className="text-xs">
                    {task.completed_at && 
                      format(new Date(task.completed_at), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}