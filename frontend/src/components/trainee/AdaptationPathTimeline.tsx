import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, Flag, MapPin, PlayCircle } from 'lucide-react'
import type { AdaptationPath, AdaptationPathMilestone } from '@/types/adaptationPath'
import { cn } from '@/lib/utils'

const phaseColors: Record<string, { bar: string }> = {
  onboarding: { bar: 'bg-sky-500' },
  skills: { bar: 'bg-violet-500' },
  work: { bar: 'bg-emerald-500' },
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

function MilestoneStatusIcon({ milestone }: { milestone: AdaptationPathMilestone }) {
  if (milestone.status === 'COMPLETED') {
    return <CheckCircle2 className="h-4 w-4 text-green-600" />
  }
  if (milestone.overdue) {
    return <Flag className="h-4 w-4 text-red-500" />
  }
  if (milestone.status === 'IN_PROGRESS') {
    return <PlayCircle className="h-4 w-4 text-primary" />
  }
  return <Circle className="h-4 w-4 text-gray-400" />
}

function MilestoneStatusLabel({ milestone }: { milestone: AdaptationPathMilestone }) {
  if (milestone.status === 'COMPLETED') {
    return <span className="text-green-600">Выполнено</span>
  }
  if (milestone.status === 'IN_PROGRESS') {
    return <span className="text-primary">В работе</span>
  }
  if (milestone.overdue) {
    return <span className="text-red-600">Просрочено</span>
  }
  return <span className="text-gray-500">Впереди</span>
}

interface AdaptationPathTimelineProps {
  path: AdaptationPath
  blockLinkPrefix?: string
  compact?: boolean
}

export function AdaptationPathTimeline({
  path,
  blockLinkPrefix = '/dashboard/trainee/blocks',
  compact = false,
}: AdaptationPathTimelineProps) {
  const { totalWeeks, currentWeek, phases, milestones, startDate, endDate } = path

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={cn('font-semibold text-[#1A1A2E]', compact ? 'text-base' : 'text-lg')}>
            Путь адаптации
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {formatDate(startDate)} — {formatDate(endDate)} · {totalWeeks} нед.
          </p>
        </div>
        <div className="rounded-xl bg-orange-50 px-4 py-2 text-center">
          <p className="text-xs font-medium text-gray-500">Текущая неделя</p>
          <p className="text-xl font-bold text-primary">
            {currentWeek}
            <span className="text-sm font-normal text-gray-400"> / {totalWeeks}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        {phases.map((phase) => {
          const colors = phaseColors[phase.id] ?? phaseColors.onboarding
          return (
            <div key={phase.id} className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', colors.bar)} />
              <span className="text-gray-600">
                {phase.title}
                <span className="text-gray-400">
                  {' '}
                  (нед. {phase.weekFrom}–{phase.weekTo}, {phase.progress}%)
                </span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="relative min-w-[640px]">
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
            {phases.map((phase) => {
              const widthPercent = ((phase.weekTo - phase.weekFrom + 1) / totalWeeks) * 100
              const colors = phaseColors[phase.id] ?? phaseColors.onboarding
              return (
                <div
                  key={phase.id}
                  title={`${phase.title}: ${phase.progress}%`}
                  className={cn(
                    colors.bar,
                    'h-full opacity-90',
                    phase.status === 'UPCOMING' && 'opacity-40',
                    phase.status === 'CURRENT' && 'ring-2 ring-primary/30 ring-offset-1'
                  )}
                  style={{ width: `${widthPercent}%` }}
                />
              )
            })}
          </div>

          <div
            className="absolute top-1/2 z-10 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-md"
            style={{
              left: `calc(${((currentWeek - 0.5) / totalWeeks) * 100}% - 10px)`,
            }}
            title={`Сейчас: неделя ${currentWeek}`}
          />

          <div className="mt-3 flex justify-between text-[10px] font-medium text-gray-400">
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
              const hasMilestone = milestones.some((m) => m.weekNumber === week)
              return (
                <span
                  key={week}
                  className={cn(
                    'flex flex-col items-center gap-0.5',
                    week === currentWeek && 'font-bold text-primary',
                    hasMilestone && week !== currentWeek && 'text-amber-600'
                  )}
                  title={hasMilestone ? 'Контрольная точка' : undefined}
                >
                  {hasMilestone && <MapPin className="h-2.5 w-2.5" />}
                  {week}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {!compact && milestones.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-[#1A1A2E]">Контрольные точки</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Ключевые вехи испытательного срока — отмечайте выполнение в задачах
          </p>
          <ul className="mt-4 space-y-3">
            {milestones.map((milestone) => (
              <li key={milestone.taskId}>
                <Link
                  to={`${blockLinkPrefix}/${milestone.blockId}`}
                  className={cn(
                    'flex gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-gray-50',
                    milestone.status === 'COMPLETED'
                      ? 'border-green-100 bg-green-50/40'
                      : milestone.overdue
                        ? 'border-red-100 bg-red-50/30'
                        : 'border-gray-100 bg-gray-50/50'
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    <MilestoneStatusIcon milestone={milestone} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1A1A2E]">{milestone.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Неделя {milestone.weekNumber} · {milestone.blockTitle} · до{' '}
                      {formatDate(milestone.deadline)}
                    </p>
                    <p className="mt-1 text-xs font-medium">
                      <MilestoneStatusLabel milestone={milestone} />
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {compact && milestones.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {milestones.map((m) => (
            <span
              key={m.taskId}
              title={m.title}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                m.status === 'COMPLETED'
                  ? 'bg-green-50 text-green-700'
                  : m.overdue
                    ? 'bg-red-50 text-red-700'
                    : 'bg-gray-100 text-gray-600'
              )}
            >
              <MapPin className="h-3 w-3" />
              Н{m.weekNumber}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
