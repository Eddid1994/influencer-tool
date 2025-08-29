'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred while rendering this component.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-mono text-muted-foreground">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={this.resetError} variant="default">
                  Try Again
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Refresh Page
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">
                    Show error details
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook for wrapping async operations with error handling
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const resetError = () => setError(null)

  const execute = React.useCallback(async <T,>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await asyncFunction()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred')
      setError(error)
      console.error('Error in async operation:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    error,
    isLoading,
    resetError,
    execute
  }
}