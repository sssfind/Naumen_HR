import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Award, Mail, Pencil, Phone, Users } from 'lucide-react'
import { AchievementBadgeRow } from '@/components/profile/AchievementBadgeRow'
import { buildTraineeAchievements } from '@/components/profile/achievementItems'
import { Button } from '@/components/ui/button'
import { EmployeeProfileCard } from '@/components/employees/EmployeeProfileCard'
import { formatTraineeBlockLabel, TRAINEE_PLAN_BLOCKS } from '@/constants/traineePlanBlocks'
import { useProfile } from '@/hooks/useProfile'
import { mentorSummaryToDirectory } from '@/lib/mentorProfile'

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
  const achievements = useMemo(() => buildTraineeAchievements(profile), [profile])

  if (isLoading) {
    return <p className="text-gray-500">Загрузка профиля…</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Мой профиль</h1>
        <p className="mt-1 text-sm text-gray-500">Личные данные и прогресс стажировки</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,500px)_1fr] xl:grid-cols-[minmax(0,520px)_1fr]">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
            <AchievementBadgeRow
              items={achievements}
              userId={profile?.userId}
              className="mt-1"
            />
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A2E]">Прогресс стажировки</h2>
                <p className="text-sm text-gray-500">Прогресс по блокам программы адаптации</p>
              </div>
              <div className="rounded-full bg-orange-50 px-4 py-2 text-lg font-bold text-primary">
                {profile?.totalProgress ?? 0}%
              </div>
            </div>
            <div className="mt-6 space-y-5">
              {TRAINEE_PLAN_BLOCKS.map((block) => (
                <ProgressBar
                  key={block.id}
                  label={formatTraineeBlockLabel(block)}
                  value={profile?.[block.progressKey] ?? 0}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-[#1A1A2E]">Наставник</h2>
            {profile?.mentor ? (
              <EmployeeProfileCard
                employee={mentorSummaryToDirectory(profile.mentor)}
                hideHrField
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
                Наставник пока не назначен
              </div>
            )}
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

