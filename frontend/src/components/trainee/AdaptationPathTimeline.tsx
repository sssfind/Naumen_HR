import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, Flag, MapPin, PlayCircle } from 'lucide-react'
import type {
  AdaptationPath,
  AdaptationPathMilestone,
  AdaptationPathWeekSlice,
} from '@/types/adaptationPath'
import { cn } from '@/lib/utils'

const blockBarColors: Record<
  string,
  { completed: string; inProgress: string; pending: string }
> = {
  onboarding: {
    completed: 'bg-sky-500',
    inProgress: 'bg-sky-300',
    pending: 'bg-sky-100',
  },
  skills: {
    completed: 'bg-violet-500',
    inProgress: 'bg-violet-300',
    pending: 'bg-violet-100',
  },
  work: {
    completed: 'bg-emerald-500',
    inProgress: 'bg-emerald-300',
    pending: 'bg-emerald-100',
  },
}

const defaultBlockColors = blockBarColors.onboarding

function sliceColor(slice: AdaptationPathWeekSlice) {
  const palette = blockBarColors[slice.blockId] ?? defaultBlockColors
  if (slice.status === 'COMPLETED') {
    return palette.completed
  }
  if (slice.overdue) {
    return 'bg-red-400'
  }
  if (slice.status === 'IN_PROGRESS') {
    return palette.inProgress
  }
  return palette.pending
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
  /** Если false, контрольные точки без ссылки на редактирование (режим наставника) */
  linkMilestones?: boolean
  compact?: boolean
}

export function AdaptationPathTimeline({
  path,
  blockLinkPrefix = '/dashboard/trainee/blocks',
  linkMilestones = true,
  compact = false,
}: AdaptationPathTimelineProps) {
  const { totalWeeks, currentWeek, phases, milestones, startDate, endDate, weeks } = path
  const weekSegments = weeks?.length === totalWeeks ? weeks : buildFallbackWeeks(totalWeeks, phases)

  const completedSlices = weekSegments.reduce(
    (n, w) => n + w.slices.filter((s) => s.status === 'COMPLETED').length,
    0
  )
  const totalSlices = weekSegments.reduce((n, w) => n + w.slices.length, 0)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={cn('font-semibold text-[#1A1A2E]', compact ? 'text-base' : 'text-lg')}>
            Путь адаптации
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {formatDate(startDate)} — {formatDate(endDate)} · {totalWeeks} нед.
            {totalSlices > 0 && (
              <span className="text-gray-400">
                {' '}
                · выполнено {completedSlices} из {totalSlices} задач на шкале
              </span>
            )}
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

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-sm bg-sky-500" />
          Знакомство — сделано
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-sm bg-violet-500" />
          Навыки — сделано
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-sm bg-emerald-500" />
          Работа — сделано
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-sm bg-sky-100 ring-1 ring-sky-200" />
          Запланировано
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-sm bg-red-400" />
          Просрочено
        </span>
      </div>

      <div className="mt-4 overflow-x-auto pb-2">
        <div className="relative min-w-[640px]">
          <div className="flex h-4 gap-0.5 overflow-hidden rounded-full bg-gray-100 p-0.5">
            {weekSegments.map((week) => (
              <div
                key={week.weekNumber}
                className={cn(
                  'flex min-w-0 flex-1 gap-px',
                  week.weekNumber === currentWeek && 'ring-2 ring-primary/40 ring-offset-1 rounded-sm'
                )}
                title={`Неделя ${week.weekNumber}`}
              >
                {week.slices.length === 0 ? (
                  <div
                    className="h-full w-full rounded-sm bg-gray-200/80"
                    title={`Неделя ${week.weekNumber}: нет задач`}
                  />
                ) : (
                  week.slices.map((slice) => (
                    <div
                      key={slice.taskId}
                      className={cn(
                        'h-full min-w-[3px] flex-1 rounded-sm transition-colors duration-300',
                        sliceColor(slice)
                      )}
                      title={`${slice.blockTitle}: ${
                        slice.status === 'COMPLETED'
                          ? 'выполнено'
                          : slice.overdue
                            ? 'просрочено'
                            : slice.status === 'IN_PROGRESS'
                              ? 'в работе'
                              : 'запланировано'
                      }`}
                    />
                  ))
                )}
              </div>
            ))}
          </div>

          <div
            className="absolute top-1/2 z-10 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-md"
            style={{
              left: `calc(${((currentWeek - 0.5) / totalWeeks) * 100}% - 10px)`,
            }}
            title={`Сейчас: неделя ${currentWeek}`}
          />

          <div className="mt-3 flex justify-between text-[10px] font-medium text-gray-400">
            {weekSegments.map((week) => {
              const hasMilestone = milestones.some((m) => m.weekNumber === week.weekNumber)
              const anyCompleted = week.slices.some((s) => s.status === 'COMPLETED')
              return (
                <span
                  key={week.weekNumber}
                  className={cn(
                    'flex flex-col items-center gap-0.5',
                    week.weekNumber === currentWeek && 'font-bold text-primary',
                    hasMilestone && week.weekNumber !== currentWeek && 'text-amber-600',
                    anyCompleted && week.weekNumber !== currentWeek && !hasMilestone && 'text-gray-600'
                  )}
                  title={
                    week.slices.length
                      ? `Неделя ${week.weekNumber}: ${week.slices.filter((s) => s.status === 'COMPLETED').length}/${week.slices.length} задач`
                      : undefined
                  }
                >
                  {hasMilestone && <MapPin className="h-2.5 w-2.5" />}
                  {week.weekNumber}
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
            {milestones.map((milestone) => {
              const rowClass = cn(
                'flex gap-3 rounded-xl border px-4 py-3',
                linkMilestones && 'transition-colors hover:bg-gray-50',
                milestone.status === 'COMPLETED'
                  ? 'border-green-100 bg-green-50/40'
                  : milestone.overdue
                    ? 'border-red-100 bg-red-50/30'
                    : 'border-gray-100 bg-gray-50/50'
              )
              const content = (
                <>
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
                </>
              )
              return (
                <li key={milestone.taskId}>
                  {linkMilestones && blockLinkPrefix ? (
                    <Link to={`${blockLinkPrefix}/${milestone.blockId}`} className={rowClass}>
                      {content}
                    </Link>
                  ) : (
                    <div className={rowClass}>{content}</div>
                  )}
                </li>
              )
            })}
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

function buildFallbackWeeks(
  totalWeeks: number,
  phases: AdaptationPath['phases']
): AdaptationPath['weeks'] {
  return Array.from({ length: totalWeeks }, (_, i) => {
    const weekNumber = i + 1
    const phase = phases.find((p) => weekNumber >= p.weekFrom && weekNumber <= p.weekTo)
    if (!phase || phase.progress === 0) {
      return { weekNumber, slices: [] }
    }
    return {
      weekNumber,
      slices: [
        {
          taskId: -weekNumber,
          blockId: phase.id,
          blockTitle: phase.title,
          status: phase.progress >= 100 ? 'COMPLETED' : 'NOT_STARTED',
          overdue: false,
        } as AdaptationPathWeekSlice,
      ],
    }
  })
}
