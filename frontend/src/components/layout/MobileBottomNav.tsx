import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAV_ITEMS, type AppNavView } from './appNav'

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ИИ'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

interface MobileBottomNavProps {
  activeView: AppNavView
  onNavigate: (view: AppNavView) => void
  userFullName: string
  onOpenUserProfile?: () => void
  onLogout?: () => void
}

export function MobileBottomNav({
  activeView,
  onNavigate,
  userFullName,
  onOpenUserProfile,
  onLogout,
}: MobileBottomNavProps) {
  const initials = getInitials(userFullName)

  return (
    <nav
      aria-label="Основная навигация"
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm lg:hidden',
        'pb-[max(0.25rem,env(safe-area-inset-bottom))]',
      )}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0 px-0.5 pt-1">
        {APP_NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeView === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={cn(
                'flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-medium transition-colors touch-manipulation sm:text-[11px]',
                isActive ? 'text-[#F95700] bg-orange-50' : 'text-gray-600 active:bg-gray-100',
              )}
            >
              <Icon className="h-6 w-6 shrink-0" strokeWidth={isActive ? 2.25 : 2} aria-hidden />
              <span className="line-clamp-2 text-center leading-tight">{label}</span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => onOpenUserProfile?.()}
          className="flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-medium text-gray-600 transition-colors touch-manipulation active:bg-gray-100 sm:text-[11px]"
          aria-label="Профиль"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F95700] text-[10px] font-bold text-white">
            {initials}
          </span>
          <span className="line-clamp-2 text-center leading-tight">Профиль</span>
        </button>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-medium text-gray-600 transition-colors touch-manipulation active:bg-red-50 sm:text-[11px]"
            aria-label="Выйти из аккаунта"
          >
            <LogOut className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden />
            <span className="line-clamp-2 text-center leading-tight text-red-700">Выйти</span>
          </button>
        )}
      </div>
    </nav>
  )
}
