'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-5 text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-lg mb-2">Application Error</h2>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            {error.digest && (
              <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono">ID: {error.digest}</p>
            )}
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}
