import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
    />
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-5 gap-4 pb-2 border-b">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PerformancePanelSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Metrics */}
      <MetricsGridSkeleton />
      
      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="h-64 bg-muted rounded-lg animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around p-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted-foreground/10 rounded-t"
              style={{
                height: `${Math.random() * 80 + 20}%`,
                width: '10%'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}