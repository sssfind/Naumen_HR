import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  ChevronRight,
  GraduationCap,
  Smile,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStaffDashboard } from '@/hooks/useStaffDashboard'
import { useHrAdaptationDashboard, useMyTrainees } from '@/hooks/useTrainees'
import type { HrAdaptationDashboard } from '@/types/hr'
import { cn } from '@/lib/utils'

const moodLabels: Record<number, string> = {
  1: 'Низкое',
  2: 'Ниже среднего',
  3: 'Нормальное',
  4: 'Хорошее',
  5: 'Отличное',
}

function moodLabelForAverage(value: number | null | undefined) {
  if (value == null) return 'Нет данных'
  return moodLabels[Math.round(value)] ?? 'Нет данных'
}

type ActionItem = {
  key: string
  label: string
  href: string
  tone: 'amber' | 'orange' | 'red'
}

function buildActionItems(data: HrAdaptationDashboard, basePath: string): ActionItem[] {
  const items: ActionItem[] = []

  for (const risk of data.atRisk.slice(0, 2)) {
    items.push({
      key: `risk-${risk.traineeId}`,
      label: `${risk.fullName}: ${risk.riskSummary}`,
      href: `${basePath}/trainees/${risk.traineeId}`,
      tone: 'amber',
    })
  }

  if (data.feedbackPendingCount > 0) {
    const names = data.feedbackPending
      .slice(0, 2)
      .map((t) => t.fullName)
      .join(', ')
    const suffix = data.feedbackPendingCount > 2 ? ` и ещё ${data.feedbackPendingCount - 2}` : ''
    items.push({
      key: 'feedback-pending',
      label: `Не сдали опрос за неделю: ${names}${suffix}`,
      href: `${basePath}/analytics`,
      tone: 'orange',
    })
  }

  if (data.traineesWithOverdueTasksCount > 0) {
    const first = data.overdueByTrainee[0]
    items.push({
      key: 'overdue',
      label: first
        ? `Просрочки у ${first.fullName} (${first.overdueCount} задач)`
        : `Просроченные задачи у ${data.traineesWithOverdueTasksCount} стажёров`,
      href: first ? `${basePath}/trainees/${first.traineeId}` : `${basePath}/analytics`,
      tone: 'red',
    })
  }

  return items.slice(0, 4)
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = 'orange',
}: {
  icon: typeof GraduationCap
  label: string
  value: string
  hint: string
  accent?: 'orange' | 'green' | 'amber' | 'neutral'
}) {
  const iconBg = {
    orange: 'bg-orange-50 text-primary',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    neutral: 'bg-gray-50 text-gray-600',
  }[accent]

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconBg)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-[#1A1A2E]">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  )
}

export function ProfileWorkSummary() {
  const { basePath, isMentor, canManageTrainees } = useStaffDashboard()
  const { data: dashboard, isLoading: dashboardLoading } = useHrAdaptationDashboard()
  const { data: trainees = [], isLoading: traineesLoading } = useMyTrainees()

  const isLoading = dashboardLoading || traineesLoading

  if (isLoading) {
    return <p className="text-sm text-gray-500">Загрузка сводки…</p>
  }

  if (!dashboard) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500">
        Не удалось загрузить сводку по стажёрам
      </p>
    )
  }

  const moodRounded =
    dashboard.averageMoodLevel != null
      ? Math.round(dashboard.averageMoodLevel * 10) / 10
      : null

  const progressByTraineeId = new Map(
    dashboard.traineeProgress.map((item) => [item.traineeId, item.completionPercent])
  )

  const actionItems = buildActionItems(dashboard, basePath)
  const attentionCount =
    dashboard.atRiskCount + dashboard.feedbackPendingCount + dashboard.traineesWithOverdueTasksCount

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A2E]">Сводка по команде</h2>
          <p className="mt-1 text-sm text-gray-500">
            {isMentor
              ? 'Краткий обзор ваших стажёров'
              : 'Краткий обзор закреплённых стажёров'}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 gap-1">
          <Link to={`${basePath}/analytics`}>
            <BarChart3 className="h-3.5 w-3.5" />
            Подробнее
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryCard
          icon={GraduationCap}
          label="Стажёров"
          value={String(dashboard.traineeCount)}
          hint="В программе адаптации"
        />
        <SummaryCard
          icon={Smile}
          label="Настроение"
          value={moodRounded != null ? `${moodRounded}/5` : '—'}
          hint={moodLabelForAverage(moodRounded)}
          accent={moodRounded != null && moodRounded >= 4 ? 'green' : 'orange'}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Прогресс задач"
          value={`${dashboard.averageTaskCompletionPercent}%`}
          hint="Среднее по команде"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Сигналы"
          value={String(attentionCount)}
          hint={
            attentionCount === 0
              ? 'Всё в порядке'
              : `${dashboard.atRiskCount} риск · ${dashboard.feedbackPendingCount} опрос · ${dashboard.traineesWithOverdueTasksCount} просроч.`
          }
          accent={attentionCount > 0 ? 'amber' : 'neutral'}
        />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-[#1A1A2E]">Нужно сделать</h3>
        {actionItems.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center text-sm text-gray-500">
            {dashboard.traineeCount === 0
              ? canManageTrainees
                ? 'Добавьте стажёров из справочника сотрудников'
                : 'Пока нет стажёров в программе'
              : 'Срочных действий нет — хорошая работа'}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {actionItems.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-start justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors hover:opacity-90',
                    item.tone === 'amber' && 'border-amber-100 bg-amber-50/60 text-amber-950',
                    item.tone === 'orange' && 'border-orange-100 bg-orange-50/50 text-[#1A1A2E]',
                    item.tone === 'red' && 'border-red-100 bg-red-50/50 text-red-900'
                  )}
                >
                  <span className="line-clamp-2">{item.label}</span>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {canManageTrainees && dashboard.traineeCount === 0 && (
          <Button asChild size="sm" className="mt-3 w-full">
            <Link to={`${basePath}/employees`}>Открыть справочник</Link>
          </Button>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-[#1A1A2E]">Мои стажёры</h3>
          {trainees.length > 0 && (
            <Link
              to={`${basePath}/trainees`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Все
            </Link>
          )}
        </div>
        {trainees.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Стажёры не назначены</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {trainees.slice(0, 5).map((trainee) => {
              const percent = progressByTraineeId.get(trainee.userId) ?? 0
              return (
                <li key={trainee.userId}>
                  <Link
                    to={`${basePath}/trainees/${trainee.userId}`}
                    className="block rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-orange-50/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-medium text-[#1A1A2E]">
                        <UserRound className="h-4 w-4 text-primary" />
                        {trainee.fullName}
                      </span>
                      <span className="text-sm font-semibold text-primary">{percent}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    {trainee.department && (
                      <p className="mt-1.5 text-xs text-gray-500">{trainee.department}</p>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
