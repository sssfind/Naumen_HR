import { Link } from 'react-router-dom'
import type { TraineeTaskProgressItem } from '@/types/hr'
import { cn } from '@/lib/utils'

const CHART_HEIGHT = 280
const Y_TICKS = [0, 25, 50, 75, 100]

function shortName(fullName: string, maxLength = 16) {
  if (fullName.length <= maxLength) return fullName
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) {
    const abbreviated = `${parts[0]} ${parts[1][0]}.`
    if (abbreviated.length <= maxLength) return abbreviated
  }
  return `${fullName.slice(0, maxLength - 1)}…`
}

interface TraineeProgressChartProps {
  items: TraineeTaskProgressItem[]
}

export function TraineeProgressChart({ items }: TraineeProgressChartProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-500">
        Нет стажёров для отображения графика
      </p>
    )
  }

  return (
    <div className="w-full">
      <div className="flex gap-4">
        <div
          className="flex shrink-0 flex-col justify-between text-right text-xs text-gray-400"
          style={{ height: CHART_HEIGHT }}
        >
          {[...Y_TICKS].reverse().map((tick) => (
            <span key={tick}>{tick}%</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between"
            style={{ height: CHART_HEIGHT }}
          >
            {Y_TICKS.map((tick) => (
              <div
                key={tick}
                className={cn(
                  'border-t',
                  tick === 0 ? 'border-gray-200' : 'border-dashed border-gray-100'
                )}
              />
            ))}
          </div>

          <div
            className="grid w-full gap-4 border-b border-gray-200"
            style={{
              height: CHART_HEIGHT,
              gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
            }}
          >
            {items.map((item) => {
              const barPercent = Math.max(0, Math.min(100, item.completionPercent))
              const barHeightPx = Math.max(
                barPercent > 0 ? 10 : 0,
                Math.round((barPercent / 100) * (CHART_HEIGHT - 56))
              )

              return (
                <div
                  key={item.traineeId}
                  className="flex min-w-0 flex-col items-center justify-end pb-3"
                >
                  <span className="mb-2 text-sm font-semibold text-primary">
                    {item.completionPercent}%
                  </span>
                  <Link
                    to={`/dashboard/hr/trainees/${item.traineeId}`}
                    title={`${item.fullName}: ${item.completedTasks} из ${item.totalTasks} задач`}
                    className={cn(
                      'block w-full max-w-[88px] rounded-t-lg bg-primary shadow-sm',
                      'transition-opacity hover:opacity-90',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                    )}
                    style={{ height: barHeightPx }}
                  />
                </div>
              )
            })}
          </div>

          <div
            className="mt-4 grid w-full gap-4"
            style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
          >
            {items.map((item) => (
              <div key={item.traineeId} className="min-w-0 text-center">
                <Link
                  to={`/dashboard/hr/trainees/${item.traineeId}`}
                  className="block truncate text-sm font-medium text-gray-700 hover:text-primary"
                  title={item.fullName}
                >
                  {shortName(item.fullName)}
                </Link>
                <p className="mt-1 text-xs text-gray-400">
                  {item.completedTasks}/{item.totalTasks} задач
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary" />
          Доля выполненных задач
        </span>
      </div>
    </div>
  )
}
