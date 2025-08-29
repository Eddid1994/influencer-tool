'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialKPICardsProps {
  spent: number | null; // in cents
  revenue: number | null; // in cents
  roas: number | null;
  targetRoas?: number;
  currency?: string;
  className?: string;
}

export default function FinancialKPICards({
  spent,
  revenue,
  roas,
  targetRoas = 1.0,
  currency = 'EUR',
  className
}: FinancialKPICardsProps) {
  const formatCurrency = (cents: number | null) => {
    if (cents === null || cents === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  const formatRoas = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(2)}x`;
  };

  const getRoasColor = (value: number | null) => {
    if (!value) return 'text-muted-foreground';
    if (value >= 2.0) return 'text-green-600';
    if (value >= targetRoas) return 'text-blue-600';
    return 'text-red-600';
  };

  const getRoasIcon = (value: number | null) => {
    if (!value) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    if (value >= targetRoas) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const profit = (revenue || 0) - (spent || 0);
  const profitMargin = spent && spent > 0 ? (profit / spent) * 100 : null;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-4", className)}>
      {/* Spent Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(spent)}</div>
          <p className="text-xs text-muted-foreground">
            Total investment
          </p>
        </CardContent>
      </Card>

      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(revenue)}</div>
          <p className="text-xs text-muted-foreground">
            Generated revenue
          </p>
        </CardContent>
      </Card>

      {/* ROAS Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">ROAS</CardTitle>
          {getRoasIcon(roas)}
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold flex items-center gap-2", getRoasColor(roas))}>
            {formatRoas(roas)}
          </div>
          <p className="text-xs text-muted-foreground">
            Return on ad spend
          </p>
        </CardContent>
      </Card>

      {/* Profit/Loss Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
          {profit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            profit >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {formatCurrency(profit)}
          </div>
          <p className="text-xs text-muted-foreground">
            {profitMargin !== null ? `${profitMargin.toFixed(1)}% margin` : 'Net result'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}