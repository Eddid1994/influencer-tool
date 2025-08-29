'use client';

import { useState, useEffect, use } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Users,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import DeliverablesList from '@/components/engagements/deliverables-list';
import TasksList from '@/components/engagements/tasks-list';
import MetricsPanel from '@/components/engagements/metrics-panel';
import NegotiationTab from '@/components/engagements/negotiation-tab';
import ScreenshotsTab from '@/components/engagements/screenshots-tab';
import InvoiceAttachments from '@/components/engagements/invoice-attachments';
import FinancialKPICards from '@/components/kpi/financial-kpi-cards';

type PageProps = {
  params: Promise<{ id: string }>;
};

type Engagement = Database['public']['Tables']['engagements']['Row'] & {
  brand?: { name: string; website?: string | null };
  influencer?: { name: string; instagram_handle?: string | null };
  deliverables?: Array<Database['public']['Tables']['deliverables']['Row']>;
  tasks?: Array<Database['public']['Tables']['engagement_tasks']['Row']>;
  invoices?: Array<Database['public']['Tables']['invoices']['Row']>;
};

const statusColors = {
  negotiating: 'bg-yellow-100 text-yellow-800',
  agreed: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  paused: 'bg-orange-100 text-orange-800',
};

export default function EngagementDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchEngagement();
  }, [resolvedParams.id]);

  const fetchEngagement = async () => {
    try {
      const { data, error } = await supabase
        .from('engagements')
        .select(`
          *,
          brand:brands(name, website),
          influencer:influencers(name, instagram_handle),
          deliverables(*),
          tasks:engagement_tasks(*),
          invoices(*)
        `)
        .eq('id', resolvedParams.id)
        .single();

      if (error) {
        console.error('Error fetching engagement:', error);
      } else {
        setEngagement(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number | null) => {
    if (!cents) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Engagement not found</h2>
        <p className="text-muted-foreground mb-4">This engagement doesn't exist or has been deleted.</p>
        <Link href="/engagements">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Engagements
          </Button>
        </Link>
      </div>
    );
  }

  const completedDeliverables = engagement.deliverables?.filter((d: any) => d.content_approved).length || 0;
  const totalDeliverables = engagement.deliverables?.length || 0;
  const pendingTasks = engagement.tasks?.filter((t: any) => !t.completed_at).length || 0;
  const unpaidInvoices = engagement.invoices?.filter((i: any) => i.status !== 'paid').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/engagements">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {engagement.brand?.name} × {engagement.influencer?.name}
            </h1>
            <p className="text-muted-foreground">
              {engagement.period_label} • Created {format(new Date(engagement.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge 
            className={statusColors[engagement.status as keyof typeof statusColors]}
            variant="secondary"
          >
            {engagement.status}
          </Badge>
          <Link href={`/engagements/${engagement.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agreed Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(engagement.agreed_total_cents)}</div>
            <p className="text-xs text-muted-foreground">{engagement.payment_terms || 'Standard terms'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deliverables</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedDeliverables}/{totalDeliverables}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalDeliverables > 0 
                ? `${Math.round((completedDeliverables / totalDeliverables) * 100)}% complete`
                : 'No deliverables yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              {pendingTasks > 0 ? 'Action required' : 'All clear'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contract</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagement.contract_status === 'signed' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {engagement.contract_status || 'Not started'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
          <TabsTrigger value="deliverables">
            Deliverables {totalDeliverables > 0 && `(${totalDeliverables})`}
          </TabsTrigger>
          <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks {pendingTasks > 0 && `(${pendingTasks})`}
          </TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices {unpaidInvoices > 0 && `(${unpaidInvoices})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Financial KPIs */}
          <FinancialKPICards
            spent={engagement.agreed_total_cents}
            revenue={engagement.total_revenue_cents || 0}
            roas={(engagement.total_revenue_cents && engagement.agreed_total_cents && engagement.agreed_total_cents > 0) 
              ? (engagement.total_revenue_cents / engagement.agreed_total_cents) 
              : null}
            currency={engagement.agreed_currency || 'EUR'}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Brand Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <p className="font-medium">{engagement.brand?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Website:</span>
                  <p className="font-medium">{engagement.brand?.website || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Period:</span>
                  <p className="font-medium">{engagement.period_label}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Influencer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <p className="font-medium">{engagement.influencer?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Instagram:</span>
                  <p className="font-medium">{engagement.influencer?.instagram_handle || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge 
                    className={statusColors[engagement.status as keyof typeof statusColors]}
                    variant="secondary"
                  >
                    {engagement.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {engagement.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{engagement.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="negotiation">
          <NegotiationTab 
            engagementId={engagement.id}
            engagement={engagement}
            onUpdate={fetchEngagement}
          />
        </TabsContent>

        <TabsContent value="deliverables">
          <DeliverablesList 
            engagementId={engagement.id} 
            deliverables={engagement.deliverables || []}
            onUpdate={fetchEngagement}
          />
        </TabsContent>

        <TabsContent value="screenshots">
          <ScreenshotsTab engagementId={engagement.id} />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksList 
            engagementId={engagement.id}
            tasks={engagement.tasks || []}
            onUpdate={fetchEngagement}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsPanel 
            engagementId={engagement.id}
            deliverables={engagement.deliverables || []}
            agreedAmount={engagement.agreed_total_cents}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceAttachments 
            engagementId={engagement.id}
            engagement={engagement}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}