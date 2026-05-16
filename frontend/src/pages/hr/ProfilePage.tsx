import { Link } from 'react-router-dom'
import {
  Award,
  Briefcase,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Smile,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import { TraineeProgressChart } from '@/components/hr/TraineeProgressChart'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/useProfile'
import { useHrTeamStats } from '@/hooks/useTrainees'
import { cn } from '@/lib/utils'

const hrAchievements = [
  { title: 'HR-куратор', description: 'Сопровождает стажёров на стажировке' },
  { title: 'Команда в деле', description: 'Следит за прогрессом своей группы' },
  { title: 'Обратная связь', description: 'Анализирует еженедельные опросы' },
  { title: 'Наставник', description: 'Помогает новичкам адаптироваться' },
  { title: 'Организатор', description: 'Ведёт план и задачи стажёров' },
]

const moodLabels: Record<number, string> = {
  1: 'Низкое',
  2: 'Ниже среднего',
  3: 'Нормальное',
  4: 'Хорошее',
  5: 'Отличное',
}

function initials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'HR'
}

function moodLabelForAverage(value: number | null | undefined) {
  if (value == null) return 'Нет данных'
  const rounded = Math.round(value)
  return moodLabels[rounded] ?? 'Нет данных'
}

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const { data: stats, isLoading: statsLoading } = useHrTeamStats()

  if (isLoading) {
    return <p className="text-gray-500">Загрузка профиля…</p>
  }

  const moodRounded =
    stats?.averageMoodLevel != null
      ? Math.round(stats.averageMoodLevel * 10) / 10
      : null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Мой профиль</h1>
        <p className="mt-1 text-sm text-gray-500">Личные данные и сводка по стажёрам</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.fullName}
                className="h-32 w-32 rounded-full object-cover ring-4 ring-orange-50"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-orange-50 text-3xl font-bold text-primary ring-4 ring-orange-100">
                {initials(profile?.fullName ?? '')}
              </div>
            )}
            <h2 className="mt-5 text-2xl font-bold text-[#1A1A2E]">{profile?.fullName}</h2>
            <p className="mt-1 text-sm text-gray-500">{profile?.position ?? 'Должность не указана'}</p>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Отдел:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{profile?.department ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Должность:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{profile?.position ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Почта:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{profile?.email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Телефон:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{profile?.phone ?? '—'}</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-[#1A1A2E]">Ачивки</h2>
            </div>
            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {hrAchievements.map((achievement) => (
                <div
                  key={achievement.title}
                  className="flex min-h-24 w-full gap-3 rounded-lg border border-orange-100 bg-orange-50/60 px-3 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A2E]">{achievement.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#1A1A2E]">Мои стажёры</h2>
          {statsLoading ? (
            <p className="text-sm text-gray-500">Загрузка показателей…</p>
          ) : (
            <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-4 text-sm text-gray-500">Всего стажёров</p>
                <p className="mt-1 text-3xl font-bold text-[#1A1A2E]">{stats?.traineeCount ?? 0}</p>
                <p className="mt-2 text-xs text-gray-500">Закреплены за вами</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    moodRounded != null && moodRounded >= 4 ? 'bg-green-50' : 'bg-orange-50'
                  )}
                >
                  <Smile
                    className={cn(
                      'h-5 w-5',
                      moodRounded != null && moodRounded >= 4 ? 'text-green-600' : 'text-primary'
                    )}
                  />
                </div>
                <p className="mt-4 text-sm text-gray-500">Индекс настроения</p>
                <p className="mt-1 text-3xl font-bold text-[#1A1A2E]">
                  {moodRounded != null ? `${moodRounded}/5` : '—'}
                </p>
                <p className="mt-2 text-xs text-gray-500">{moodLabelForAverage(moodRounded)}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-4 text-sm text-gray-500">Средний прогресс</p>
                <p className="mt-1 text-3xl font-bold text-[#1A1A2E]">
                  {stats?.averageTaskCompletionPercent ?? 0}%
                </p>
                <p className="mt-2 text-xs text-gray-500">Доля выполненных задач</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1A1A2E]">Выполнение задач стажёров</h3>
              <p className="mt-1 text-sm text-gray-500">
                Процент завершённых задач по каждому стажёру
              </p>
              <div className="mt-8 min-h-[360px] w-full">
                <TraineeProgressChart items={stats?.traineeProgress ?? []} />
              </div>
            </div>
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <Button asChild className="gap-2">
          <Link to="/dashboard/hr/profile/edit">
            <Pencil className="h-4 w-4" />
            Редактировать данные
          </Link>
        </Button>
      </div>
    </div>
  )
}
