import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Smile,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { TraineeProgressChart } from '@/components/hr/TraineeProgressChart'
import { useStaffDashboard } from '@/hooks/useStaffDashboard'
import { useHrAdaptationDashboard } from '@/hooks/useTrainees'
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

function formatWeek(weekStart: string) {
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  return `${fmt(start)} — ${fmt(end)}`
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center text-sm text-gray-500">
      {message}
    </p>
  )
}

export function AdaptationAnalyticsPage() {
  const { basePath, isMentor } = useStaffDashboard()
  const { data, isLoading, isError } = useHrAdaptationDashboard()

  const moodRounded =
    data?.averageMoodLevel != null
      ? Math.round(data.averageMoodLevel * 10) / 10
      : null

  const sentimentRounded =
    data?.averageSentimentScore != null
      ? Math.round(data.averageSentimentScore * 10) / 10
      : null

  if (isLoading) {
    return <p className="text-gray-500">Загрузка аналитики…</p>
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Не удалось загрузить дашборд адаптации
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Аналитика адаптации</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isMentor
            ? 'Сводка по вашим стажёрам: настроение, риски, опросы и просроченные задачи'
            : 'Сводка по закреплённым стажёрам: настроение, риски, опросы и просроченные задачи'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SummaryCard
          icon={GraduationCap}
          label="Стажёров в программе"
          value={String(data.traineeCount)}
          hint="Закреплены за вами"
        />
        <SummaryCard
          icon={Smile}
          label="Среднее настроение"
          value={moodRounded != null ? `${moodRounded}/5` : '—'}
          hint={moodLabelForAverage(moodRounded)}
          accent={moodRounded != null && moodRounded >= 4 ? 'green' : 'orange'}
        />
        <SummaryCard
          icon={Sparkles}
          label="Индекс адаптации"
          value={sentimentRounded != null ? `${sentimentRounded}/100` : '—'}
          hint="По шкалам опроса и анализу комментариев"
          accent={
            sentimentRounded != null && sentimentRounded >= 75
              ? 'green'
              : sentimentRounded != null && sentimentRounded < 50
                ? 'amber'
                : 'neutral'
          }
        />
        <SummaryCard
          icon={TrendingUp}
          label="Средний прогресс задач"
          value={`${data.averageTaskCompletionPercent}%`}
          hint="Доля выполненных задач"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Требуют внимания"
          value={String(data.atRiskCount)}
          hint={`${data.feedbackPendingCount} без опроса · ${data.traineesWithOverdueTasksCount} с просрочками`}
          accent={data.atRiskCount > 0 ? 'amber' : 'neutral'}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1A1A2E]">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Риски по адаптации
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                По опросу, индексу адаптации и анализу комментариев (ИИ)
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
              {data.atRiskCount}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {data.atRisk.length === 0 ? (
              <EmptyBlock message="Сигналов риска нет — отличная динамика" />
            ) : (
              data.atRisk.map((item) => (
                <Link
                  key={item.traineeId}
                  to={`${basePath}/trainees/${item.traineeId}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/40 p-4 transition-colors hover:bg-amber-50"
                >
                  <div>
                    <p className="font-medium text-[#1A1A2E]">{item.fullName}</p>
                    <p className="mt-1 text-sm text-amber-900/80">{item.riskSummary}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      Настроение: {item.moodLevel}/5
                      {item.sentimentScore != null
                        ? ` · индекс ${item.sentimentScore}/100`
                        : ''}
                      {item.feedbackWeekStart
                        ? ` · опрос за ${formatWeek(item.feedbackWeekStart)}`
                        : ''}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1A1A2E]">
                <ClipboardList className="h-5 w-5 text-primary" />
                Не сдали опрос за неделю
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {formatWeek(data.currentWeekStart)}
              </p>
            </div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-primary">
              {data.feedbackPendingCount}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {data.feedbackPending.length === 0 ? (
              <EmptyBlock message="Все стажёры сдали опрос на этой неделе" />
            ) : (
              data.feedbackPending.map((item) => (
                <Link
                  key={item.traineeId}
                  to={`${basePath}/trainees/${item.traineeId}`}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 transition-colors hover:bg-orange-50/50"
                >
                  <p className="font-medium text-[#1A1A2E]">{item.fullName}</p>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1A1A2E]">
              <CalendarClock className="h-5 w-5 text-red-500" />
              Просроченные задачи
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Незавершённые задачи с истёкшим дедлайном
            </p>
          </div>
          <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
            {data.traineesWithOverdueTasksCount} стажёров
          </span>
        </div>
        <div className="mt-4 space-y-4">
          {data.overdueByTrainee.length === 0 ? (
            <EmptyBlock message="Просроченных задач нет" />
          ) : (
            data.overdueByTrainee.map((group) => (
              <div
                key={group.traineeId}
                className="rounded-xl border border-red-100 bg-red-50/30 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`${basePath}/trainees/${group.traineeId}`}
                    className="font-semibold text-[#1A1A2E] hover:text-primary"
                  >
                    {group.fullName}
                  </Link>
                  <span className="text-sm text-red-700">
                    {group.overdueCount}{' '}
                    {group.overdueCount === 1 ? 'задача' : 'задач'}
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {group.tasks.map((task) => (
                    <li
                      key={task.taskId}
                      className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm"
                    >
                      <span className="text-gray-800">{task.description}</span>
                      <span className="shrink-0 text-xs text-red-600">
                        до {formatDate(task.deadline)} · {task.daysOverdue} дн. просрочки
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">Выполнение задач стажёров</h2>
        <p className="mt-1 text-sm text-gray-500">Процент завершённых задач по каждому стажёру</p>
        <div className="mt-6">
          <TraineeProgressChart items={data.traineeProgress} />
        </div>
      </section>
    </div>
  )
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconBg)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#1A1A2E]">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{hint}</p>
    </div>
  )
}
