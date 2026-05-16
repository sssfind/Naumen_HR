import { cn } from '@/lib/utils'
import {
  resourceIssueOptions,
  weekRatingOptions,
  type FeedbackResponse,
} from '@/types/feedback'

const clarityLabels: Record<number, string> = {
  1: 'Совсем не понимаю',
  2: 'Скорее непонятно',
  3: 'Частично понятно',
  4: 'В основном понятно',
  5: 'Полная ясность',
}

const mentorLabels: Record<number, string> = {
  1: 'Наставник недоступен',
  2: 'Мало поддержки',
  3: 'Нормально',
  4: 'Хорошая поддержка',
  5: 'Отличная поддержка',
}

function formatWeek(weekStart: string) {
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  return `${fmt(start)} — ${fmt(end)}`
}

function weekRatingLabel(rating: FeedbackResponse['weekRating']) {
  return weekRatingOptions.find((o) => o.value === rating)
}

function resourceLabels(issues: FeedbackResponse['resourceIssues']) {
  return issues
    .map((issue) => resourceIssueOptions.find((o) => o.value === issue)?.label ?? issue)
    .join('; ')
}

function isRisk(item: FeedbackResponse) {
  return (
    item.weekRating === 'STRESSED' ||
    item.weekRating === 'NEED_HELP' ||
    item.tasksClarity <= 2 ||
    item.mentorRating <= 2 ||
    item.resourceIssues.some((i) => i !== 'ALL_OK')
  )
}

interface FeedbackResponseCardProps {
  item: FeedbackResponse
  compact?: boolean
}

export function FeedbackResponseCard({ item, compact }: FeedbackResponseCardProps) {
  const risk = isRisk(item)
  const week = weekRatingLabel(item.weekRating)

  return (
    <article
      className={cn(
        'rounded-xl border p-4',
        risk ? 'border-amber-200 bg-amber-50/40' : 'border-gray-100 bg-gray-50'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#1A1A2E]">Неделя {formatWeek(item.weekStart)}</p>
          {!compact && (
            <p className="mt-0.5 text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleString('ru-RU')}
            </p>
          )}
        </div>
        {risk && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Внимание
          </span>
        )}
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-gray-500">Рабочая неделя</dt>
          <dd className="font-medium text-[#1A1A2E]">
            {week ? `${week.emoji} ${week.label}` : item.weekRating}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Понятность задач</dt>
          <dd className="font-medium text-[#1A1A2E]">
            {item.tasksClarity}/5 — {clarityLabels[item.tasksClarity]}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Доступы и ресурсы</dt>
          <dd className="font-medium text-[#1A1A2E]">{resourceLabels(item.resourceIssues)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Наставник</dt>
          <dd className="font-medium text-[#1A1A2E]">
            {item.mentorRating}/5 — {mentorLabels[item.mentorRating]}
          </dd>
        </div>
      </dl>

      {item.weekComment && (
        <p className="mt-3 text-sm text-gray-600">
          <span className="font-medium text-[#1A1A2E]">Отзыв о неделе: </span>
          {item.weekComment}
        </p>
      )}
    </article>
  )
}
