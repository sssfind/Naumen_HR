import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bot, BookOpen, BookTemplate, GraduationCap, LogOut, User } from 'lucide-react'
import { NotificationPanel } from '@/components/hr/NotificationPanel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard/hr/trainees', label: 'Мои стажёры', icon: GraduationCap },
  { to: '/dashboard/hr/plan-templates', label: 'Шаблоны адаптации', icon: BookTemplate },
  { to: '/dashboard/hr/employees', label: 'Справочник сотрудников', icon: BookOpen },
  { to: '/dashboard/hr/chat', label: 'Чат-бот', icon: Bot },
  { to: '/dashboard/hr/profile', label: 'Мой профиль', icon: User },
]

export function HrLayout() {
  const navigate = useNavigate()
  const stored = localStorage.getItem('user')
  const user = stored ? JSON.parse(stored) : null

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-5">
          <p className="text-lg font-bold text-[#1A1A2E]">Naumen HR</p>
          <p className="mt-1 text-xs text-gray-500">Панель HR</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
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
        <div className="border-t border-gray-100 p-4">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <p className="text-sm text-gray-500">Добро пожаловать</p>
            <p className="font-semibold text-[#1A1A2E]">{user?.fullName ?? 'HR'}</p>
          </div>
          <NotificationPanel />
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
