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
  CreditCard,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Payment = Database['public']['Tables']['engagement_payments']['Row'];
type Invoice = Database['public']['Tables']['invoices']['Row'];

interface PaymentsListProps {
  engagementId: string;
  payments: Payment[];
  invoices: Invoice[];
  onUpdate: () => void;
}

const methodIcons = {
  bank_transfer: Building2,
  credit_card: CreditCard,
  paypal: DollarSign,
  other: DollarSign,
};

export default function PaymentsList({ 
  engagementId, 
  payments, 
  invoices,
  onUpdate 
}: PaymentsListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_id: '',
    amount_cents: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer' as Payment['payment_method'],
    transaction_id: '',
    notes: '',
  });
  const supabase = createClientComponentClient<Database>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('engagement_payments')
        .insert({
          engagement_id: engagementId,
          invoice_id: formData.invoice_id || null,
          amount_cents: formData.amount_cents * 100, // Convert to cents
          payment_date: formData.payment_date,
          payment_method: formData.payment_method,
          transaction_id: formData.transaction_id || null,
          notes: formData.notes || null,
        });

      if (error) throw error;
      
      // Update invoice status if linked
      if (formData.invoice_id) {
        const invoice = invoices.find(i => i.id === formData.invoice_id);
        if (invoice) {
          const totalPaid = payments
            .filter(p => p.invoice_id === formData.invoice_id)
            .reduce((sum, p) => sum + (p.amount_cents || 0), 0) + (formData.amount_cents * 100);
          
          if (totalPaid >= (invoice.amount_cents || 0)) {
            await supabase
              .from('invoices')
              .update({ 
                status: 'paid',
                paid_at: new Date().toISOString()
              })
              .eq('id', formData.invoice_id);
          }
        }
      }
      
      toast.success('Payment recorded successfully');
      setIsAddDialogOpen(false);
      setFormData({
        invoice_id: '',
        amount_cents: 0,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        transaction_id: '',
        notes: '',
      });
      onUpdate();
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast.error(error.message || 'Failed to record payment');
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const totalPayments = payments.reduce((sum, p) => sum + (p.amount_cents || 0), 0);
  const unpaidInvoices = invoices.filter(i => i.status !== 'paid');

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payments</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>
                    Record a payment received for this engagement
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="invoice">Invoice (Optional)</Label>
                      <Select
                        value={formData.invoice_id}
                        onValueChange={(value) => {
                          setFormData({ ...formData, invoice_id: value });
                          // Auto-fill amount from invoice
                          const invoice = invoices.find(i => i.id === value);
                          if (invoice) {
                            const paidAmount = payments
                              .filter(p => p.invoice_id === value)
                              .reduce((sum, p) => sum + (p.amount_cents || 0), 0);
                            const remaining = (invoice.amount_cents || 0) - paidAmount;
                            setFormData(prev => ({ 
                              ...prev, 
                              amount_cents: remaining / 100 
                            }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select invoice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No invoice</SelectItem>
                          {unpaidInvoices.map(invoice => (
                            <SelectItem key={invoice.id} value={invoice.id}>
                              {invoice.number} - {formatCurrency(invoice.amount_cents || 0)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Label htmlFor="payment_date">Payment Date</Label>
                      <Input
                        id="payment_date"
                        type="date"
                        value={formData.payment_date}
                        onChange={(e) =>
                          setFormData({ ...formData, payment_date: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="method">Payment Method</Label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, payment_method: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transaction_id">Transaction ID</Label>
                      <Input
                        id="transaction_id"
                        placeholder="Optional reference"
                        value={formData.transaction_id}
                        onChange={(e) =>
                          setFormData({ ...formData, transaction_id: e.target.value })
                        }
                      />
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
                    <Button type="submit">Record Payment</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="p-4 border rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  Total Received
                </div>
                <div className="text-2xl font-bold">{formatCurrency(totalPayments)}</div>
              </div>
              {unpaidInvoices.length > 0 && (
                <Badge variant="outline" className="bg-orange-50">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Payments Table */}
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const MethodIcon = methodIcons[payment.payment_method as keyof typeof methodIcons] || DollarSign;
                  const linkedInvoice = payment.invoice_id 
                    ? invoices.find(i => i.id === payment.invoice_id)
                    : null;
                  
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.payment_date
                          ? format(new Date(payment.payment_date), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount_cents || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MethodIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {payment.payment_method?.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {linkedInvoice ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{linkedInvoice.number}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {payment.transaction_id ? (
                          <code className="text-xs">{payment.transaction_id}</code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {payment.notes ? (
                          <span className="text-sm text-muted-foreground truncate">
                            {payment.notes}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No payments recorded yet</p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Record First Payment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}