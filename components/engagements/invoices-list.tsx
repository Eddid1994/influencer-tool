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
import { 
  Plus,
  FileText,
  Download,
  Send,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Invoice = Database['public']['Tables']['invoices']['Row'];

interface InvoicesListProps {
  engagementId: string;
  invoices: Invoice[];
  onUpdate: () => void;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  draft: FileText,
  sent: Send,
  paid: CheckCircle,
  overdue: AlertCircle,
  cancelled: FileText,
};

export default function InvoicesList({ engagementId, invoices, onUpdate }: InvoicesListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    amount_cents: 0,
    issued_at: new Date().toISOString().split('T')[0],
    due_at: '',
    status: 'draft' as Invoice['status'],
    notes: '',
  });
  const supabase = createClientComponentClient<Database>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('invoices')
        .insert({
          engagement_id: engagementId,
          ...formData,
          amount_cents: formData.amount_cents * 100, // Convert to cents
          total_cents: formData.amount_cents * 100,
        });

      if (error) throw error;
      
      toast.success('Invoice created successfully');
      setIsAddDialogOpen(false);
      setFormData({
        number: '',
        amount_cents: 0,
        issued_at: new Date().toISOString().split('T')[0],
        due_at: '',
        status: 'draft',
        notes: '',
      });
      onUpdate();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
    }
  };

  const updateInvoiceStatus = async (id: string, status: Invoice['status']) => {
    try {
      const updates: any = { status };
      
      if (status === 'sent' && !invoices.find(i => i.id === id)?.sent_at) {
        updates.sent_at = new Date().toISOString();
      }
      if (status === 'paid' && !invoices.find(i => i.id === id)?.paid_at) {
        updates.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success(`Invoice marked as ${status}`);
      onUpdate();
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount_cents || 0), 0);
  const paidAmount = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount_cents || 0), 0);
  const outstandingAmount = totalAmount - paidAmount;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoices</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>
                    Generate a new invoice for this engagement
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Invoice Number</Label>
                      <Input
                        id="number"
                        placeholder="INV-001"
                        value={formData.number}
                        onChange={(e) =>
                          setFormData({ ...formData, number: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (EUR)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount_cents}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amount_cents: parseFloat(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issued_at">Issue Date</Label>
                      <Input
                        id="issued_at"
                        type="date"
                        value={formData.issued_at}
                        onChange={(e) =>
                          setFormData({ ...formData, issued_at: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due_at">Due Date</Label>
                      <Input
                        id="due_at"
                        type="date"
                        value={formData.due_at}
                        onChange={(e) =>
                          setFormData({ ...formData, due_at: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes..."
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Invoice</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                Total Invoiced
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Paid
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                Outstanding
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(outstandingAmount)}
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const StatusIcon = statusIcons[invoice.status as keyof typeof statusIcons];
                  const isOverdue = invoice.due_at && 
                    new Date(invoice.due_at) < new Date() && 
                    invoice.status !== 'paid';
                  
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.number || 'Draft'}
                      </TableCell>
                      <TableCell>
                        {invoice.issued_at
                          ? format(new Date(invoice.issued_at), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {invoice.due_at ? (
                          <div className={isOverdue ? 'text-red-600' : ''}>
                            {format(new Date(invoice.due_at), 'MMM d, yyyy')}
                            {isOverdue && (
                              <div className="text-xs">Overdue</div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.amount_cents || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            isOverdue
                              ? statusColors.overdue
                              : statusColors[invoice.status as keyof typeof statusColors]
                          }
                          variant="secondary"
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {isOverdue ? 'Overdue' : invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" title="Download">
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                              title="Mark as Sent"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {invoice.status === 'sent' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                              title="Mark as Paid"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No invoices created yet</p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create First Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}