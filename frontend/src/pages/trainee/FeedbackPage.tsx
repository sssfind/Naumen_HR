import { FormEvent, useState } from 'react'
import { ClipboardList, Loader2 } from 'lucide-react'
import { FeedbackResponseCard } from '@/components/feedback/FeedbackResponseCard'
import { ScaleSelector } from '@/components/feedback/ScaleSelector'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  useFeedbackHistory,
  useFeedbackStatus,
  useSubmitFeedback,
} from '@/hooks/useFeedback'
import { cn } from '@/lib/utils'
import {
  mentorRatingLabels,
  resourceIssueOptions,
  tasksClarityLabels,
  weekRatingOptions,
  type ResourceIssue,
  type WeekRating,
} from '@/types/feedback'

export function TraineeFeedbackPage() {
  const { data: status, isLoading: statusLoading } = useFeedbackStatus()
  const { data: history = [], isLoading: historyLoading } = useFeedbackHistory()
  const submit = useSubmitFeedback()

  const [weekRating, setWeekRating] = useState<WeekRating | null>(null)
  const [tasksClarity, setTasksClarity] = useState<number | null>(null)
  const [resourceIssues, setResourceIssues] = useState<ResourceIssue[]>([])
  const [mentorRating, setMentorRating] = useState<number | null>(null)
  const [weekComment, setWeekComment] = useState('')

  function toggleResourceIssue(issue: ResourceIssue) {
    if (issue === 'ALL_OK') {
      setResourceIssues((prev) => (prev.includes('ALL_OK') ? [] : ['ALL_OK']))
      return
    }
    setResourceIssues((prev) => {
      const withoutAllOk = prev.filter((i) => i !== 'ALL_OK')
      if (withoutAllOk.includes(issue)) {
        return withoutAllOk.filter((i) => i !== issue)
      }
      return [...withoutAllOk, issue]
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (
      weekRating == null ||
      tasksClarity == null ||
      resourceIssues.length === 0 ||
      mentorRating == null
    ) {
      return
    }
    submit.mutate(
      {
        weekRating,
        tasksClarity,
        resourceIssues,
        mentorRating,
        weekComment: weekComment.trim() || undefined,
      },
      {
        onSuccess: () => {
          setWeekRating(null)
          setTasksClarity(null)
          setResourceIssues([])
          setMentorRating(null)
          setWeekComment('')
        },
      }
    )
  }

  const canSubmit = status?.canSubmitThisWeek ?? false
  const formValid =
    weekRating != null &&
    tasksClarity != null &&
    resourceIssues.length > 0 &&
    mentorRating != null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Еженедельный опрос</h1>
          <p className="mt-1 text-sm text-gray-500">
            Пять коротких вопросов — около двух минут. Ответы видит HR и помогают на адаптации.
          </p>
        </div>
      </div>

      {statusLoading && <p className="mt-8 text-gray-500">Загрузка…</p>}

      {!statusLoading && status && (
        <>
          {status.currentWeekResponse ? (
            <section className="mt-8 space-y-3">
              <div
                className={cn(
                  'rounded-xl border px-4 py-3 text-sm',
                  status.currentWeekResponse.weekRating === 'NEED_HELP'
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                    : 'border-green-200 bg-green-50/50 text-green-800'
                )}
              >
                Вы уже заполнили опрос на эту неделю. Следующий — с понедельника.
              </div>
              <FeedbackResponseCard item={status.currentWeekResponse} />
            </section>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-[#1A1A2E]">
                  1. Как ты оцениваешь свою рабочую неделю?
                </legend>
                <p className="text-xs text-gray-500">Выбери один вариант</p>
                <div className="space-y-2">
                  {weekRatingOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setWeekRating(option.value)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                        weekRating === option.value
                          ? 'border-primary bg-orange-50 text-[#1A1A2E]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200'
                      )}
                    >
                      <span className="text-lg leading-none">{option.emoji}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <ScaleSelector
                label="2. Насколько понятны были твои задачи на этой неделе?"
                hint="Шкала от 1 до 5"
                minHint={tasksClarityLabels[1]}
                maxHint={tasksClarityLabels[5]}
                value={tasksClarity}
                onChange={setTasksClarity}
              />

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-[#1A1A2E]">
                  3. Все ли необходимые доступы и ресурсы у тебя есть?
                </legend>
                <p className="text-xs text-gray-500">Можно выбрать несколько вариантов</p>
                <div className="space-y-2">
                  {resourceIssueOptions.map((option) => {
                    const checked = resourceIssues.includes(option.value)
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors',
                          checked
                            ? 'border-primary bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-orange-200'
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={checked}
                          onChange={() => toggleResourceIssue(option.value)}
                        />
                        <span className="text-[#1A1A2E]">{option.label}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <ScaleSelector
                label="4. Оцени работу своего наставника на этой неделе"
                hint="Шкала от 1 до 5"
                minHint={mentorRatingLabels[1]}
                maxHint={mentorRatingLabels[5]}
                value={mentorRating}
                onChange={setMentorRating}
              />

              <div className="space-y-2">
                <Label htmlFor="week-comment" className="text-sm font-medium text-[#1A1A2E]">
                  5. Отзыв о прошедшей неделе в свободной форме
                </Label>
                <textarea
                  id="week-comment"
                  rows={4}
                  maxLength={2000}
                  placeholder="Что получилось хорошо, что было сложно, чего не хватало..."
                  value={weekComment}
                  onChange={(e) => setWeekComment(e.target.value)}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={!canSubmit || !formValid || submit.isPending}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {submit.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Отправка…
                  </>
                ) : (
                  'Отправить опрос'
                )}
              </Button>
            </form>
          )}
        </>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">Прошлые недели</h2>
        {historyLoading && <p className="mt-4 text-sm text-gray-500">Загрузка истории…</p>}
        {!historyLoading && history.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            История опросов пока пуста
          </p>
        )}
        <div className="mt-4 space-y-3">
          {history
            .filter((item) => item.id !== status?.currentWeekResponse?.id)
            .map((item) => (
              <FeedbackResponseCard key={item.id} item={item} compact />
            ))}
        </div>
      </section>
    </div>
  )
}
