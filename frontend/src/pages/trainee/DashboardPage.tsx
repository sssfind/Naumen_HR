import { Link } from 'react-router-dom'
import { Building2, Briefcase, ChevronRight, ClipboardList, Sparkles } from 'lucide-react'
import { AdaptationPathTimeline } from '@/components/trainee/AdaptationPathTimeline'
import { ProgressBar } from '@/components/trainee/ProgressBar'
import { Button } from '@/components/ui/button'
import { useFeedbackStatus } from '@/hooks/useFeedback'
import { useTraineeDashboard } from '@/hooks/useTrainee'
import { cn } from '@/lib/utils'

const blockIcons: Record<string, typeof Building2> = {
  onboarding: Building2,
  skills: Sparkles,
  work: Briefcase,
}

export function TraineeDashboardPage() {
  const { data, isLoading, isError } = useTraineeDashboard()
  const { data: feedbackStatus } = useFeedbackStatus()

  if (isLoading) {
    return <p className="text-gray-500">Загрузка…</p>
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Не удалось загрузить задачи
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E]">Мои задачи</h1>
      <p className="mt-1 text-sm text-gray-500">
        Путь адаптации на испытательный срок и задачи по этапам. Нажмите на блок, чтобы открыть список.
      </p>

      {data.adaptationPath && (
        <div className="mt-6">
          <AdaptationPathTimeline path={data.adaptationPath} />
        </div>
      )}

      {feedbackStatus?.canSubmitThisWeek && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-orange-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-[#1A1A2E]">Еженедельный опрос</p>
              <p className="text-sm text-gray-600">Займёт около минуты — помогите нам поддержать вас</p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
            <Link to="/dashboard/trainee/feedback">Заполнить опрос</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 px-6 py-4">
        <div className="rounded-full bg-white px-4 py-2 text-2xl font-bold text-primary shadow-sm">
          {data.totalProgress}%
        </div>
        <div>
          <p className="font-semibold text-[#1A1A2E]">Общий прогресс</p>
          <p className="text-sm text-gray-500">Среднее по всем блокам задач</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {data.taskBlocks.map((block) => {
          const Icon = blockIcons[block.id] ?? Building2
          const completedCount = block.tasks.filter((task) => task.status === 'COMPLETED').length
          const inProgressCount = block.tasks.filter((task) => task.status === 'IN_PROGRESS').length

          return (
            <Link
              key={block.id}
              to={`/dashboard/trainee/blocks/${block.id}`}
              className={cn(
                'block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors',
                'hover:border-primary/30 hover:bg-orange-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
            >
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-[#1A1A2E]">{block.title}</h2>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {block.tasks.length === 0
                      ? 'Нет задач'
                      : `${completedCount} завершено · ${inProgressCount} в работе · ${block.tasks.length} всего`}
                  </p>
                </div>
              </div>
              <ProgressBar label="Прогресс" value={block.progress} />
              <p className="mt-4 text-sm font-medium text-primary">Открыть список задач</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
