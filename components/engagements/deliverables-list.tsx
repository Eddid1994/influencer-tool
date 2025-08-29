'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus,
  Edit,
  Check,
  X,
  Package,
  Calendar,
  Link as LinkIcon,
  FileText,
  Send,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Deliverable = Database['public']['Tables']['deliverables']['Row'];

interface DeliverablesListProps {
  engagementId: string;
  deliverables: Deliverable[];
  onUpdate: () => void;
}

const platformIcons = {
  instagram: '📷',
  tiktok: '🎵',
  youtube: '📺',
  twitter: '🐦',
  linkedin: '💼',
};

const deliverableTypes = {
  story: 'Story',
  post: 'Post',
  reel: 'Reel',
  video: 'Video',
  live: 'Live',
  carousel: 'Carousel',
  igtv: 'IGTV',
  shorts: 'Shorts',
};

export default function DeliverablesList({
  engagementId,
  deliverables,
  onUpdate,
}: DeliverablesListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);
  const [formData, setFormData] = useState({
    platform: 'instagram' as Deliverable['platform'],
    deliverable: 'post' as Deliverable['deliverable'],
    quantity: 1,
    planned_publish_at: '',
    promoted_product: '',
    tracking_link: '',
    notes: '',
  });
  const supabase = createClientComponentClient<Database>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDeliverable) {
        const { error } = await supabase
          .from('deliverables')
          .update({
            ...formData,
            planned_publish_at: formData.planned_publish_at || null,
          })
          .eq('id', editingDeliverable.id);

        if (error) throw error;
        toast.success('Deliverable updated successfully');
      } else {
        const { error } = await supabase
          .from('deliverables')
          .insert({
            engagement_id: engagementId,
            ...formData,
            planned_publish_at: formData.planned_publish_at || null,
          });

        if (error) throw error;
        toast.success('Deliverable added successfully');
      }

      setIsAddDialogOpen(false);
      setEditingDeliverable(null);
      setFormData({
        platform: 'instagram',
        deliverable: 'post',
        quantity: 1,
        planned_publish_at: '',
        promoted_product: '',
        tracking_link: '',
        notes: '',
      });
      onUpdate();
    } catch (error: any) {
      console.error('Error saving deliverable:', error);
      toast.error(error.message || 'Failed to save deliverable');
    }
  };

  const updateDeliverableStatus = async (
    id: string,
    field: string,
    value: boolean
  ) => {
    try {
      const updates: any = { [field]: value };
      if (value) {
        updates[`${field}_at`] = new Date().toISOString();
      }

      const { error } = await supabase
        .from('deliverables')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Status updated');
      onUpdate();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (deliverable: Deliverable) => {
    if (deliverable.content_approved) {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    }
    if (deliverable.content_submitted) {
      return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
    }
    if (deliverable.briefing_sent) {
      return <Badge className="bg-yellow-100 text-yellow-800">Briefing Sent</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Deliverables</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deliverable
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingDeliverable ? 'Edit' : 'Add'} Deliverable
                  </DialogTitle>
                  <DialogDescription>
                    Define the content to be delivered for this engagement
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform</Label>
                      <Select
                        value={formData.platform}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, platform: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliverable">Content Type</Label>
                      <Select
                        value={formData.deliverable}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, deliverable: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="post">Post</SelectItem>
                          <SelectItem value="reel">Reel</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                          <SelectItem value="carousel">Carousel</SelectItem>
                          <SelectItem value="igtv">IGTV</SelectItem>
                          <SelectItem value="shorts">Shorts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="planned_publish_at">Planned Date</Label>
                      <Input
                        type="date"
                        value={formData.planned_publish_at}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            planned_publish_at: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="promoted_product">Product/Service</Label>
                      <Input
                        placeholder="e.g., Summer Collection"
                        value={formData.promoted_product}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            promoted_product: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tracking_link">Tracking Link</Label>
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={formData.tracking_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tracking_link: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      placeholder="Special requirements, hashtags, etc."
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingDeliverable(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingDeliverable ? 'Update' : 'Add'} Deliverable
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {deliverables.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Planned Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliverables.map((deliverable) => (
                  <TableRow key={deliverable.id}>
                    <TableCell>
                      <span className="text-xl mr-2">
                        {platformIcons[deliverable.platform]}
                      </span>
                      {deliverable.platform}
                    </TableCell>
                    <TableCell>
                      {deliverableTypes[deliverable.deliverable]}
                      {deliverable.quantity > 1 && ` (${deliverable.quantity}x)`}
                    </TableCell>
                    <TableCell>{deliverable.promoted_product || '-'}</TableCell>
                    <TableCell>
                      {deliverable.planned_publish_at
                        ? format(new Date(deliverable.planned_publish_at), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(deliverable)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Checkbox
                          checked={deliverable.briefing_sent}
                          onCheckedChange={(checked) =>
                            updateDeliverableStatus(
                              deliverable.id,
                              'briefing_sent',
                              checked as boolean
                            )
                          }
                        />
                        <span className="text-xs">Brief</span>
                        
                        <Checkbox
                          checked={deliverable.product_sent}
                          onCheckedChange={(checked) =>
                            updateDeliverableStatus(
                              deliverable.id,
                              'product_sent',
                              checked as boolean
                            )
                          }
                        />
                        <span className="text-xs">Product</span>
                        
                        <Checkbox
                          checked={deliverable.content_submitted}
                          onCheckedChange={(checked) =>
                            updateDeliverableStatus(
                              deliverable.id,
                              'content_submitted',
                              checked as boolean
                            )
                          }
                        />
                        <span className="text-xs">Submitted</span>
                        
                        <Checkbox
                          checked={deliverable.content_approved}
                          onCheckedChange={(checked) =>
                            updateDeliverableStatus(
                              deliverable.id,
                              'content_approved',
                              checked as boolean
                            )
                          }
                        />
                        <span className="text-xs">Approved</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingDeliverable(deliverable);
                          setFormData({
                            platform: deliverable.platform,
                            deliverable: deliverable.deliverable,
                            quantity: deliverable.quantity,
                            planned_publish_at: deliverable.planned_publish_at || '',
                            promoted_product: deliverable.promoted_product || '',
                            tracking_link: deliverable.tracking_link || '',
                            notes: deliverable.notes || '',
                          });
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No deliverables defined yet
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Deliverable
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}