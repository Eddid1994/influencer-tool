'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  DollarSign,
  Percent,
  BarChart,
  Target
} from 'lucide-react';

type Deliverable = Database['public']['Tables']['deliverables']['Row'];
type Metric = Database['public']['Tables']['deliverable_metrics']['Row'];

interface MetricsPanelProps {
  engagementId: string;
  deliverables: Deliverable[];
  agreedAmount: number | null;
}

export default function MetricsPanel({ 
  engagementId, 
  deliverables,
  agreedAmount 
}: MetricsPanelProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchMetrics();
  }, [deliverables]);

  const fetchMetrics = async () => {
    if (deliverables.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const deliverableIds = deliverables.map(d => d.id);
      const { data, error } = await supabase
        .from('deliverable_metrics')
        .select('*')
        .in('deliverable_id', deliverableIds)
        .eq('is_final', true);

      if (error) {
        console.error('Error fetching metrics:', error);
      } else {
        setMetrics(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate metrics
  const totalViews = metrics.reduce((sum, m) => sum + (m.views || 0), 0);
  const totalClicks = metrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
  const totalRevenue = metrics.reduce((sum, m) => sum + (m.revenue_cents || 0), 0);
  const avgEngagementRate = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + (m.engagement_rate || 0), 0) / metrics.length
    : 0;

  // Calculate TKP (Tausend-Kontakt-Preis / Cost per thousand views)
  const tkp = totalViews > 0 && agreedAmount 
    ? (agreedAmount / 100) / totalViews * 1000 
    : null;

  // Calculate ROAS (Return on Ad Spend)
  const roas = agreedAmount && agreedAmount > 0 
    ? (totalRevenue / agreedAmount) 
    : null;

  // Calculate CTR (Click-through rate)
  const ctr = totalViews > 0 
    ? (totalClicks / totalViews) * 100 
    : 0;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              Across {deliverables.length} deliverables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgEngagementRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">TKP</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tkp ? formatCurrency(tkp * 100) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost per 1000 views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ROAS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {roas ? `${roas.toFixed(2)}x` : '-'}
              {roas && (
                roas >= 1 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Return on ad spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Click-through Rate</span>
              <span className="text-sm font-bold">{ctr.toFixed(2)}%</span>
            </div>
            <Progress value={ctr} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Revenue Generated</span>
              <span className="text-sm font-bold">{formatCurrency(totalRevenue)}</span>
            </div>
            {agreedAmount && (
              <Progress 
                value={(totalRevenue / agreedAmount) * 100} 
                className="h-2" 
              />
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Link Clicks</span>
              <span className="text-sm font-bold">{formatNumber(totalClicks)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MousePointer className="h-3 w-3" />
              {totalViews > 0 && (
                <span>{((totalClicks / totalViews) * 100).toFixed(1)}% of views</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliverable Breakdown */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deliverable Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deliverables.map((deliverable) => {
                const metric = metrics.find(m => m.deliverable_id === deliverable.id);
                if (!metric) return null;

                return (
                  <div key={deliverable.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {deliverable.platform} {deliverable.deliverable}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {deliverable.promoted_product || 'No product specified'}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{formatNumber(metric.views || 0)}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{metric.engagement_rate?.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">Eng. Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{formatNumber(metric.clicks || 0)}</p>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {metrics.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No performance metrics available yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Metrics will appear once content is published and tracked.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}