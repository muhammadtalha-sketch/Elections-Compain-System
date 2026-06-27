'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isMissingEnv =
    error.message.includes('supabaseUrl') ||
    error.message.includes('NEXT_PUBLIC_SUPABASE')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-destructive" />
      </div>

      <div className="text-center max-w-md">
        <h2 className="font-semibold text-foreground text-lg mb-2">
          {isMissingEnv ? 'Missing Configuration' : 'Dashboard Error'}
        </h2>

        {isMissingEnv ? (
          <p className="text-sm text-muted-foreground">
            Supabase environment variables are not configured.
            Set <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in
            your Vercel project settings, then redeploy.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{error.message}</p>
        )}

        {error.digest && (
          <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  )
}
