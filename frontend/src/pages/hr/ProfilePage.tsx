import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Briefcase,
  Mail,
  Pencil,
  Phone,
  Users,
} from 'lucide-react'
import { ProfileWorkSummary } from '@/components/hr/ProfileWorkSummary'
import { buildHrAchievements } from '@/components/profile/achievementItems'
import { AchievementBadgeRow } from '@/components/profile/AchievementBadgeRow'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/useProfile'
import { useStaffDashboard } from '@/hooks/useStaffDashboard'
import { useHrAdaptationDashboard } from '@/hooks/useTrainees'
import { usePlanTemplates } from '@/hooks/usePlanTemplates'

function initials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'HR'
}

export function ProfilePage() {
  const { basePath, isMentor } = useStaffDashboard()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: dashboard } = useHrAdaptationDashboard()
  const { data: templates = [] } = usePlanTemplates()

  const achievements = useMemo(() => {
    const maxCompletion = dashboard?.traineeProgress.length
      ? Math.max(...dashboard.traineeProgress.map((t) => t.completionPercent), 0)
      : 0
    return buildHrAchievements({
      traineeCount: dashboard?.traineeCount ?? 0,
      averageMoodLevel: dashboard?.averageMoodLevel ?? null,
      maxTraineeCompletionPercent: maxCompletion,
      hasCustomTemplate: templates.some((t) => !t.system),
    })
  }, [dashboard, templates])

  if (profileLoading) {
    return <p className="text-gray-500">Загрузка профиля…</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Мой профиль</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isMentor
            ? 'Личные данные и сводка по вашим стажёрам'
            : 'Личные данные и сводка по закреплённым стажёрам'}
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,400px)_1fr] xl:grid-cols-[minmax(0,420px)_1fr]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {profile?.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-orange-50"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-orange-50 text-2xl font-bold text-primary ring-4 ring-orange-100">
                  {initials(profile?.fullName ?? '')}
                </div>
              )}
              <h2 className="mt-4 text-xl font-bold text-[#1A1A2E]">{profile?.fullName}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {profile?.position ?? 'Должность не указана'}
              </p>
              {profile?.team && (
                <p className="mt-1 text-xs text-gray-400">Команда: {profile.team}</p>
              )}
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <Users className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-gray-600">Отдел</span>
                <span className="ml-auto font-medium text-[#1A1A2E]">
                  {profile?.department ?? '—'}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <Briefcase className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-gray-600">Должность</span>
                <span className="ml-auto font-medium text-[#1A1A2E]">
                  {profile?.position ?? '—'}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-gray-600">Почта</span>
                <span className="ml-auto truncate font-medium text-[#1A1A2E]">
                  {profile?.email}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-gray-600">Телефон</span>
                <span className="ml-auto font-medium text-[#1A1A2E]">
                  {profile?.phone ?? '—'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-[#1A1A2E]">Ачивки</h3>
              </div>
              <AchievementBadgeRow items={achievements} className="mt-1" />
            </div>
          </section>

          <div className="flex justify-end">
            <Button asChild className="gap-2">
              <Link to={`${basePath}/profile/edit`}>
                <Pencil className="h-4 w-4" />
                Редактировать данные
              </Link>
            </Button>
          </div>
        </div>

        <ProfileWorkSummary />
      </div>
    </div>
  )
}
