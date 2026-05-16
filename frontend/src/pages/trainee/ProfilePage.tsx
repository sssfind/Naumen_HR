import { Link } from 'react-router-dom'
import { Award, Mail, Pencil, Phone, Trophy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/useProfile'

const progressBlocks = [
  { key: 'progressBlockOne', label: 'Блок 1' },
  { key: 'progressBlockTwo', label: 'Блок 2' },
  { key: 'progressBlockThree', label: 'Блок 3' },
] as const

const achievements = [
  { title: 'Первый день', description: 'Познакомился с командой' },
  { title: 'В ритме', description: 'Выполняет задачи по плану' },
  { title: 'Командный игрок', description: 'Нашёл коллег из своей команды' },
  { title: 'Прокачка', description: 'Развивает рабочие навыки' },
  { title: 'Финишер', description: 'Закрывает задачи стажировки' },
]

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-[#1A1A2E]">{label}</span>
        <span className="text-gray-500">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}

function initials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'СТ'
}

export function TraineeProfilePage() {
  const { data: profile, isLoading } = useProfile()

  if (isLoading) {
    return <p className="text-gray-500">Загрузка профиля…</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Мой профиль</h1>
        <p className="mt-1 text-sm text-gray-500">Личные данные и прогресс стажировки</p>
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
            <p className="mt-1 text-sm text-gray-500">{profile?.team ?? 'Команда не указана'}</p>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Команда:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{profile?.team ?? '—'}</span>
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
            <div
              className="max-h-52 space-y-3 overflow-y-auto pr-1"
            >
              {achievements.map((achievement) => (
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

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A2E]">Прогресс стажировки</h2>
                <p className="text-sm text-gray-500">Три блока программы</p>
              </div>
              <div className="rounded-full bg-orange-50 px-4 py-2 text-lg font-bold text-primary">
                {profile?.totalProgress ?? 0}%
              </div>
            </div>
            <div className="mt-6 space-y-5">
              {progressBlocks.map((block) => (
                <ProgressBar key={block.key} label={block.label} value={profile?.[block.key] ?? 0} />
              ))}
            </div>
          </section>

          <section>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1A1A2E]">Наставник</h2>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Имя:</span>{' '}
                  <span className="font-medium text-[#1A1A2E]">
                    {profile?.mentorFullName ?? 'Не назначен'}
                  </span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button asChild className="gap-2">
          <Link to="/dashboard/trainee/profile/edit">
            <Pencil className="h-4 w-4" />
            Редактировать данные
          </Link>
        </Button>
      </div>
    </div>
  )
}
