import type { ReactNode } from 'react'
import topLeftLines from '@/assets/register-side/top-left-lines.png'
import { AuthDecorLayer } from '@/components/auth/AuthDecorLayer'
import { RegisterSideBanner } from '@/components/auth/RegisterSideBanner'
import { cn } from '@/lib/utils'

type AuthPageLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthPageLayout({ title, subtitle, children }: AuthPageLayoutProps) {
  return (
    <div className="auth-font-body relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#EAEAEA] md:grid md:grid-cols-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-1/2 bg-[#FF6720] md:block" aria-hidden />

      <AuthDecorLayer />

      <div className="relative z-10 hidden h-full min-h-0 md:block">
        <RegisterSideBanner />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:px-6 md:px-8 md:py-8">
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
            'relative z-10 my-auto w-full max-w-[685px] shrink-0 rounded-[27px] bg-white p-6 sm:p-8 md:p-10',
            'shadow-[0_0_70px_7px_rgba(255,103,32,0.58)]'
          )}
        >
          <header className="mb-5 md:mb-6">
            <h2 className="auth-font-heading text-2xl leading-tight text-black md:text-[36px] md:leading-[45px]">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[rgba(37,37,37,0.7)] md:text-xl md:leading-[30px]">
              {subtitle}
            </p>
          </header>

          {children}
        </div>
      </div>
    </div>
  )
}
