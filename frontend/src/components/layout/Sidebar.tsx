import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAV_ITEMS, type AppNavView } from './appNav'

interface SidebarProps {
  activeView: AppNavView
  onNavigate: (view: AppNavView) => void
  userFullName: string
  userRoleLabel: string
  onOpenUserProfile?: () => void
  onLogout?: () => void
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ИИ'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function Sidebar({
  activeView,
  onNavigate,
  userFullName,
  userRoleLabel,
  onOpenUserProfile,
  onLogout,
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const initials = getInitials(userFullName)

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        'hidden h-screen shrink-0 flex-col overflow-hidden border-r border-gray-100 bg-white py-4 transition-all duration-300 lg:flex',
        isExpanded ? 'w-64' : 'w-20',
      )}
    >
      <div
        className={cn(
          'mb-4 px-4 transition-all duration-300',
          isExpanded ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <span className="text-lg font-black tracking-tight text-[#F95700]">NAUMEN</span>
      </div>

      <nav className="flex w-full flex-col gap-3">
        {APP_NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeView === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              title={!isExpanded ? label : undefined}
              className={cn(
                'mx-2 flex h-12 min-h-12 items-center rounded-xl transition-all duration-150',
                isExpanded ? 'justify-start gap-3 px-4' : 'mx-auto w-12 min-w-12 justify-center',
                isActive
                  ? 'bg-orange-50 text-[#F95700]'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              )}
            >
              <Icon size={24} className="shrink-0" aria-hidden />
              {isExpanded && (
                <span
                  className={cn(
                    'whitespace-nowrap text-base font-medium transition-all duration-200',
                    isActive ? 'text-[#F95700]' : 'text-gray-700',
                  )}
                >
                  {label}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto flex w-full flex-col gap-2 pb-1">
        <button
          type="button"
          title="Открыть карточку профиля"
          className={cn(
            'mx-2 flex w-[calc(100%-1rem)] min-h-12 items-center gap-3 rounded-xl border border-transparent py-2 text-left outline-none transition-colors hover:border-orange-100 hover:bg-orange-50/50 focus-visible:ring-2 focus-visible:ring-[#F95700]/40',
            isExpanded ? 'px-3' : 'justify-center',
          )}
          onClick={() => onOpenUserProfile?.()}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F95700] text-sm font-bold text-white">
            {initials}
          </div>
          {isExpanded && (
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <span className="truncate text-base font-medium text-gray-900">{userFullName}</span>
              <span className="truncate text-sm text-gray-500">{userRoleLabel}</span>
              <span className="truncate text-xs text-gray-400">Карточка сотрудника</span>
            </div>
          )}
        </button>

        {onLogout && (
          <button
            type="button"
            title="Выйти из аккаунта"
            onClick={onLogout}
            className={cn(
              'mx-2 flex min-h-12 items-center rounded-xl text-gray-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30',
              isExpanded ? 'w-[calc(100%-1rem)] justify-start gap-3 px-4' : 'mx-auto w-12 justify-center',
            )}
          >
            <LogOut size={22} className="shrink-0" aria-hidden />
            {isExpanded && <span className="text-base font-medium">Выйти</span>}
          </button>
        )}
      </div>
    </aside>
  )
}
