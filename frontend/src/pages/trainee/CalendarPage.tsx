import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListChecks,
  TriangleAlert,
} from 'lucide-react'
import { useTraineeDashboard } from '@/hooks/useTrainee'
import { cn } from '@/lib/utils'
import type { TaskProgressBlock, TraineePlanTask } from '@/types/trainee'

type CalendarTask = TraineePlanTask & {
  blockTitle: string
  deadlineDate: Date
  dayKey: string
}

type MonthGroup = {
  key: string
  title: string
  year: number
  month: number
  tasks: CalendarTask[]
}

type TaskCalendarState = 'completed' | 'overdue' | 'dueSoon' | 'default'

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const taskStateStyles: Record<TaskCalendarState, string> = {
  completed: 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100',
  overdue: 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100',
  dueSoon: 'border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100',
  default: 'border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100',
}

const taskStateDotStyles: Record<TaskCalendarState, string> = {
  completed: 'bg-green-500',
  overdue: 'bg-red-500',
  dueSoon: 'bg-yellow-500',
  default: 'bg-violet-500',
}

function parseDeadline(deadline: string) {
  const dateOnly = deadline.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (dateOnly) {
    const [, year, month, day] = dateOnly
    return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999)
  }

  return new Date(deadline)
}

function dayKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function monthKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function formatMonthTitle(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })
}

function formatDeadline(date: Date) {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getTaskState(task: CalendarTask): TaskCalendarState {
  if (task.status === 'COMPLETED') return 'completed'

  const now = Date.now()
  const deadlineTime = task.deadlineDate.getTime()
  const oneDayMs = 24 * 60 * 60 * 1000

  if (deadlineTime < now) return 'overdue'
  if (deadlineTime - now <= oneDayMs) return 'dueSoon'
  return 'default'
}

function flattenTasks(blocks: TaskProgressBlock[] = []): CalendarTask[] {
  return blocks
    .flatMap((block) =>
      block.tasks.map((task) => {
        const deadlineDate = parseDeadline(task.deadline)

        return {
          ...task,
          blockTitle: block.title,
          deadlineDate,
          dayKey: dayKey(deadlineDate),
        }
      })
    )
    .filter((task) => !Number.isNaN(task.deadlineDate.getTime()))
    .sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime())
}

function groupByMonth(tasks: CalendarTask[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>()

  tasks.forEach((task) => {
    const key = monthKey(task.deadlineDate)
    const year = task.deadlineDate.getFullYear()
    const month = task.deadlineDate.getMonth()

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title: formatMonthTitle(year, month),
        year,
        month,
        tasks: [],
      })
    }

    groups.get(key)?.tasks.push(task)
  })

  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key))
}

function buildMonthDays(group: MonthGroup) {
  const firstDay = new Date(group.year, group.month, 1)
  const daysInMonth = new Date(group.year, group.month + 1, 0).getDate()
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7

  return [
    ...Array.from({ length: leadingEmptyDays }, (_, index) => ({ type: 'empty' as const, key: `empty-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(group.year, group.month, index + 1)
      return {
        type: 'day' as const,
        key: dayKey(date),
        date,
        day: index + 1,
      }
    }),
  ]
}

function TaskStatusLegend({
  hasOverdue,
  hasDueSoon,
}: {
  hasOverdue: boolean
  hasDueSoon: boolean
}) {
  const items = [
    { label: 'Выполнено', color: 'bg-green-500' },
    hasOverdue ? { label: 'Просрочено', color: 'bg-red-500' } : null,
    hasDueSoon ? { label: 'Меньше 1 дня до дедлайна', color: 'bg-yellow-500' } : null,
    { label: 'Остальные задачи', color: 'bg-violet-500' },
  ].filter(Boolean) as { label: string; color: string }[]

  return (
    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className={cn('h-2.5 w-2.5 rounded-full', item.color)} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function MonthCalendar({
  group,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: {
  group: MonthGroup
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
}) {
  const days = buildMonthDays(group)
  const tasksByDay = group.tasks.reduce<Record<string, CalendarTask[]>>((acc, task) => {
    acc[task.dayKey] = [...(acc[task.dayKey] ?? []), task]
    return acc
  }, {})

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold capitalize text-[#1A1A2E]">{group.title}</h2>
          <p className="text-sm text-gray-500">
            {group.tasks.length} {group.tasks.length === 1 ? 'задача' : 'задач'} с дедлайном
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canGoPrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Следующий месяц"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day) => {
          if (day.type === 'empty') {
            return <div key={day.key} className="min-h-[112px] rounded-xl bg-transparent" />
          }

          const dayTasks = tasksByDay[day.key] ?? []
          const isToday = day.key === dayKey(new Date())

          return (
            <div
              key={day.key}
              className={cn(
                'min-h-[112px] rounded-xl border bg-gray-50/70 p-2',
                dayTasks.length > 0 ? 'border-gray-200' : 'border-transparent',
                isToday && 'ring-2 ring-primary/30'
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                    isToday ? 'bg-primary text-white' : 'text-gray-600'
                  )}
                >
                  {day.day}
                </span>
              </div>

              <div className="space-y-1.5">
                {dayTasks.map((task) => {
                  const state = getTaskState(task)

                  return (
                    <Link
                      key={task.id}
                      to={`/dashboard/trainee/blocks/${task.blockId}?taskId=${task.id}`}
                      className={cn(
                        'block rounded-lg border px-2 py-1.5 text-left text-[11px] leading-tight transition-colors',
                        taskStateStyles[state]
                      )}
                      title={`${task.description} · ${task.blockTitle}`}
                    >
                      <span className="flex items-start gap-1.5">
                        <span
                          className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', taskStateDotStyles[state])}
                        />
                        <span className="min-w-0">
                          <span className="line-clamp-2 font-medium">{task.description}</span>
                          <span className="mt-0.5 block truncate opacity-75">{task.blockTitle}</span>
                        </span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function TraineeCalendarPage() {
  const { data, isLoading, isError } = useTraineeDashboard()
  const tasks = useMemo(() => flattenTasks(data?.taskBlocks), [data?.taskBlocks])
  const monthGroups = useMemo(() => groupByMonth(tasks), [tasks])
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0)
  const safeSelectedMonthIndex = Math.min(selectedMonthIndex, Math.max(monthGroups.length - 1, 0))
  const selectedMonth = monthGroups[safeSelectedMonthIndex]

  const completedCount = tasks.filter((task) => task.status === 'COMPLETED').length
  const overdueCount = tasks.filter((task) => getTaskState(task) === 'overdue').length
  const dueSoonCount = tasks.filter((task) => getTaskState(task) === 'dueSoon').length

  useEffect(() => {
    if (monthGroups.length === 0) return

    const currentMonthKey = monthKey(new Date())
    const currentMonthIndex = monthGroups.findIndex((group) => group.key === currentMonthKey)
    setSelectedMonthIndex(currentMonthIndex >= 0 ? currentMonthIndex : 0)
  }, [monthGroups])

  if (isLoading) {
    return <p className="text-gray-500">Загрузка календаря задач…</p>
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Не удалось загрузить календарь задач
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Календарь задач</h1>
          <p className="mt-1 text-sm text-gray-500">
            Все дедлайны по месяцам. Нажмите на задачу, чтобы перейти к ней в нужном блоке.
          </p>
        </div>
        <TaskStatusLegend hasOverdue={overdueCount > 0} hasDueSoon={dueSoonCount > 0} />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Выполнено</p>
              <p className="text-2xl font-bold text-[#1A1A2E]">{completedCount}</p>
            </div>
          </div>
        </div>
        {overdueCount > 0 && (
          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                <TriangleAlert className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Просрочено</p>
                <p className="text-2xl font-bold text-[#1A1A2E]">{overdueCount}</p>
              </div>
            </div>
          </div>
        )}
        {dueSoonCount > 0 && (
          <div className="rounded-2xl border border-yellow-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50">
                <Clock3 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Дедлайн меньше 1 дня</p>
                <p className="text-2xl font-bold text-[#1A1A2E]">{dueSoonCount}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {monthGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <ListChecks className="mx-auto h-10 w-10 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-[#1A1A2E]">Задач пока нет</h2>
          <p className="mt-1 text-sm text-gray-500">
            Когда HR добавит задачи в план адаптации, они появятся в календаре.
          </p>
        </div>
      ) : selectedMonth ? (
        <MonthCalendar
          group={selectedMonth}
          canGoPrev={safeSelectedMonthIndex > 0}
          canGoNext={safeSelectedMonthIndex < monthGroups.length - 1}
          onPrev={() => setSelectedMonthIndex((index) => Math.max(index - 1, 0))}
          onNext={() =>
            setSelectedMonthIndex((index) => Math.min(index + 1, monthGroups.length - 1))
          }
        />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Месяц не найден
        </div>
      )}
    </div>
  )
}
