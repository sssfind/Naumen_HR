import type { ReactNode } from 'react'
import topLeftLines from '@/assets/register-side/top-left-lines.png'
import { AuthDecorLayer } from '@/components/auth/AuthDecorLayer'
import { RegisterSideBanner } from '@/components/auth/RegisterSideBanner'
import { cn } from '@/lib/utils'

type AuthPageLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  /** compact — страница регистрации с большим числом полей */
  size?: 'default' | 'compact'
}

export function AuthPageLayout({ title, subtitle, children, size = 'default' }: AuthPageLayoutProps) {
  const isCompact = size === 'compact'

  return (
    <div className="auth-font-body relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#EAEAEA] md:grid md:grid-cols-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-1/2 bg-[#FF6720] md:block" aria-hidden />

      <AuthDecorLayer />

      <div className="relative z-10 hidden h-full min-h-0 md:block">
        <RegisterSideBanner />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <img
            src={topLeftLines}
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-0 h-auto w-[min(420px,90vw)] -translate-x-[20%] -translate-y-[10%] opacity-40 select-none mix-blend-screen md:hidden"
          />
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#FF6720]/15 via-transparent to-[#FF6720]/5 md:hidden"
            aria-hidden
          />

          <div
            className={cn(
              'relative z-10 my-auto w-full shrink-0 rounded-[22px] bg-white shadow-[0_0_50px_5px_rgba(255,103,32,0.45)]',
              isCompact
                ? 'max-w-[440px] p-4 sm:p-5 md:p-6'
                : 'max-w-[480px] p-5 sm:p-6 md:p-7'
            )}
          >
            <header className={cn(isCompact ? 'mb-3 md:mb-4' : 'mb-4 md:mb-5')}>
              <h2
                className={cn(
                  'auth-font-heading leading-tight text-black',
                  isCompact
                    ? 'text-lg md:text-2xl md:leading-[30px]'
                    : 'text-xl md:text-[28px] md:leading-[34px]'
                )}
              >
                {title}
              </h2>
              <p
                className={cn(
                  'mt-1 text-[rgba(37,37,37,0.7)]',
                  isCompact ? 'text-xs md:text-sm md:leading-5' : 'text-sm md:text-base md:leading-6'
                )}
              >
                {subtitle}
              </p>
            </header>

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

