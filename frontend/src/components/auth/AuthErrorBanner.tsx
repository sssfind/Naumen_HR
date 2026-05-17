import { cn } from '@/lib/utils'

type AuthErrorBannerProps = {
  message: string
  className?: string
}

export function AuthErrorBanner({ message, className }: AuthErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-[12px] border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium leading-snug text-red-700',
        className
      )}
    >
      {message}
    </div>
  )
}
