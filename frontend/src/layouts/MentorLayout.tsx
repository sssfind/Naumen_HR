import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, Bot, BookOpen, BookTemplate, GraduationCap, User } from 'lucide-react'
import { DashboardLogoutButton } from '@/components/layout/DashboardLogoutButton'
import { NotificationPanel } from '@/components/hr/NotificationPanel'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard/mentor/analytics', label: 'Аналитика адаптации', icon: BarChart3 },
  { to: '/dashboard/mentor/trainees', label: 'Стажёры', icon: GraduationCap },
  { to: '/dashboard/mentor/plan-templates', label: 'Шаблоны адаптации', icon: BookTemplate },
  { to: '/dashboard/mentor/employees', label: 'Справочник сотрудников', icon: BookOpen },
  { to: '/dashboard/mentor/chat', label: 'Чат-бот', icon: Bot },
  { to: '/dashboard/mentor/profile', label: 'Мой профиль', icon: User },
]

export function MentorLayout() {
  const stored = localStorage.getItem('user')
  const user = stored ? JSON.parse(stored) : null

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#F5F5F5]">
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="shrink-0 border-b border-gray-100 px-6 py-5">
          <p className="text-lg font-bold text-[#1A1A2E]">Naumen HR</p>
          <p className="mt-1 text-xs text-gray-500">Кабинет наставника</p>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4 pb-20">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange-50 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#1A1A2E]'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <p className="text-sm text-gray-500">Добро пожаловать</p>
            <p className="font-semibold text-[#1A1A2E]">{user?.fullName ?? 'Наставник'}</p>
          </div>
          <NotificationPanel />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>

      <DashboardLogoutButton />
    </div>
  )
}
