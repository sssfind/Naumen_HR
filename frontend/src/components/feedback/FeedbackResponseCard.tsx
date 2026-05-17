import { cn } from '@/lib/utils'
import {
  commentRiskFlagText,
  isFeedbackRisk,
  sentimentLabelText,
  sentimentScoreColor,
} from '@/lib/feedbackSentiment'
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

interface FeedbackResponseCardProps {
  item: FeedbackResponse
  compact?: boolean
}

export function FeedbackResponseCard({ item, compact }: FeedbackResponseCardProps) {
  const risk = isFeedbackRisk(item)
  const week = weekRatingLabel(item.weekRating)

  return (
    <article
      className={cn(
        'rounded-xl border p-4',
        risk ? 'border-amber-200 bg-amber-50/40' : 'border-gray-100 bg-gray-50'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <HeaderTitle item={item} compact={compact} />
        <HeaderBadges risk={risk} commentAnalyzedAt={item.commentAnalyzedAt} />
      </div>

      {(item.sentimentScore != null || item.sentimentLabel) && <SentimentRow item={item} />}

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
        <SurveyFieldMentor item={item} />
      </dl>

      {item.commentSummary && (
        <p className="mt-3 rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2 text-sm text-violet-950">
          <span className="font-medium">Анализ комментария: </span>
          {item.commentSummary}
        </p>
      )}

      {item.weekComment && (
        <p className="mt-3 text-sm text-gray-600">
          <span className="font-medium text-[#1A1A2E]">Отзыв о неделе: </span>
          {item.weekComment}
        </p>
      )}
    </article>
  )
}

function HeaderTitle({ item, compact }: { item: FeedbackResponse; compact?: boolean }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#1A1A2E]">Неделя {formatWeek(item.weekStart)}</p>
      {!compact && (
        <p className="mt-0.5 text-xs text-gray-500">
          {new Date(item.createdAt).toLocaleString('ru-RU')}
        </p>
      )}
    </div>
  )
}

function HeaderBadges({
  risk,
  commentAnalyzedAt,
}: {
  risk: boolean
  commentAnalyzedAt: string | null
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {risk && (
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
          Внимание
        </span>
      )}
      {commentAnalyzedAt && (
        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800">
          ИИ-анализ
        </span>
      )}
    </div>
  )
}

function SentimentRow({ item }: { item: FeedbackResponse }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200/80 bg-white/80 px-3 py-2 text-sm">
      {item.sentimentScore != null && (
        <span className={cn('font-semibold', sentimentScoreColor(item.sentimentScore))}>
          Индекс адаптации: {item.sentimentScore}/100
        </span>
      )}
      {item.sentimentLabel && (
        <span className="text-gray-600">{sentimentLabelText[item.sentimentLabel]}</span>
      )}
      {(item.commentRiskFlags ?? []).map((flag) => (
        <span
          key={flag}
          className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900"
        >
          {commentRiskFlagText[flag]}
        </span>
      ))}
    </div>
  )
}

function SurveyFieldMentor({ item }: { item: FeedbackResponse }) {
  return (
    <div>
      <dt className="text-gray-500">Наставник</dt>
      <dd className="font-medium text-[#1A1A2E]">
        {item.mentorRating}/5 — {mentorLabels[item.mentorRating]}
      </dd>
    </div>
  )
}
