import { useNavigate } from 'react-router-dom'
import { BarChart3, LogOut, Search, UserPlus } from 'lucide-react'
import { DashboardFeatureCards, type DashboardFeatureCard } from '@/components/dashboard/DashboardFeatureCards'
import { Button } from '@/components/ui/button'
import type { StoredUser } from '@/types/auth'

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as StoredUser) : null
  } catch {
    return null
  }
}

const HR_FEATURE_CARDS: DashboardFeatureCard[] = [
  {
    icon: Search,
    title: 'Поиск экспертов',
    description: 'Найдите нужных специалистов по навыкам',
    iconColorClassName: 'text-[#FF6720]',
    iconBackgroundClassName: 'bg-[#FF6720]/12',
  },
  {
    icon: UserPlus,
    title: 'Управление профилями',
    description: 'Редактируйте данные сотрудников',
    iconColorClassName: 'text-[#FFFFFF]',
    iconBackgroundClassName: 'bg-[#252525]',
  },
  {
    icon: BarChart3,
    title: 'Аналитика',
    description: 'Отчёты по экспертизе отделов',
    iconColorClassName: 'text-[#252525]',
    iconBackgroundClassName: 'bg-[#FF6720]/15',
  },
]

export function HrDashboard() {
  const navigate = useNavigate()
  const user = getStoredUser()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight text-[#C2410C]">NAUMEN</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-600">HR-панель</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.[0] ?? 'H'}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.fullName ?? 'HR-специалист'}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-[#C2410C] hover:bg-orange-50 gap-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">
            Добро пожаловать,{' '}
            <span className="text-[#C2410C]">{user?.fullName ?? 'HR-специалист'}</span>!
          </h1>
          <p className="text-gray-500 mt-1">
            Роль:{' '}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
              HR / Рекрутер
            </span>
          </p>
        </div>

        <DashboardFeatureCards items={HR_FEATURE_CARDS} />

        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-600">В разработке</span>
          </div>
          <p className="text-gray-400 text-sm">
            Полный функционал HR-панели появится в следующих версиях. Следите за обновлениями!
          </p>
        </div>
      </main>
    </div>
  )
}
