import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Mail,
  Phone,
  Smile,
  Sparkles,
  Users,
} from 'lucide-react'
import { AdaptationPathTimeline } from '@/components/trainee/AdaptationPathTimeline'
import { TaskBlockDialog } from '@/components/trainee/TaskBlockDialog'
import { ProgressBar as TraineeProgressBar } from '@/components/trainee/ProgressBar'
import { formatDateTime } from '@/components/trainee/planTaskLabels'
import { AssignMentorPanel } from '@/components/hr/AssignMentorPanel'
import { FeedbackResponseCard } from '@/components/feedback/FeedbackResponseCard'
import { Button } from '@/components/ui/button'
import { useStaffDashboard } from '@/hooks/useStaffDashboard'
import { useTraineeFeedback } from '@/hooks/useFeedback'
import { useHrTraineeDashboard, useTraineeProfile } from '@/hooks/useTrainees'
import type { TaskProgressBlock, TraineePlanTask } from '@/types/trainee'
import { cn } from '@/lib/utils'

const RECENT_COMPLETED_TASKS_LIMIT = 5

const moodLabels: Record<number, string> = {
  1: 'Низкое',
  2: 'Ниже среднего',
  3: 'Нормальное',
  4: 'Хорошее',
  5: 'Отличное',
}

const blockIcons: Record<string, typeof Building2> = {
  onboarding: Building2,
  skills: Sparkles,
  work: Briefcase,
}

type CompletedTaskWithBlock = TraineePlanTask & { blockTitle: string }

function initials(firstName: string, lastName: string) {
  return `${lastName[0] ?? ''}${firstName[0] ?? ''}`.toUpperCase() || 'СТ'
}

export function TraineeProfilePage() {
  const { basePath, canEditPlans, canManageTrainees } = useStaffDashboard()
  const { traineeId } = useParams()
  const numericTraineeId = traineeId ? Number(traineeId) : undefined
  const { data: trainee, isLoading, isError } = useTraineeProfile(numericTraineeId)
  const { data: feedbackHistory = [], isLoading: feedbackLoading } =
    useTraineeFeedback(numericTraineeId)
  const { data: taskDashboard, isLoading: tasksLoading } = useHrTraineeDashboard(numericTraineeId)
  const [selectedBlock, setSelectedBlock] = useState<TaskProgressBlock | null>(null)

  const recentCompletedTasks = useMemo((): CompletedTaskWithBlock[] => {
    if (!taskDashboard) return []
    return taskDashboard.taskBlocks
      .flatMap((block) =>
        block.tasks
          .filter((task) => task.status === 'COMPLETED' && task.completedAt)
          .map((task) => ({ ...task, blockTitle: block.title }))
      )
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
      )
      .slice(0, RECENT_COMPLETED_TASKS_LIMIT)
  }, [taskDashboard])

  if (isLoading) {
    return <p className="text-gray-500">Загрузка профиля стажёра…</p>
  }

  if (isError || !trainee) {
    return (
      <div>
        <Button asChild variant="ghost" className="mb-4 gap-2">
          <Link to={`${basePath}/trainees`}>
            <ArrowLeft className="h-4 w-4" />
            Назад к стажёрам
          </Link>
        </Button>
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Не удалось загрузить профиль стажёра
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Button asChild variant="ghost" className="gap-2">
          <Link to={`${basePath}/trainees`}>
            <ArrowLeft className="h-4 w-4" />
            Назад к стажёрам
          </Link>
        </Button>
        {canEditPlans && (
          <Button asChild>
            <Link to={`${basePath}/trainees/${trainee.userId}/plan`}>
              Редактировать план стажёра
            </Link>
          </Button>
        )}
      </div>

      {canManageTrainees && numericTraineeId != null && (
        <div className="mb-6">
          <AssignMentorPanel
            traineeId={numericTraineeId}
            currentMentorId={trainee.mentorId}
            currentMentorName={trainee.mentorFullName}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {trainee.photoUrl ? (
              <img
                src={trainee.photoUrl}
                alt={trainee.fullName}
                className="h-32 w-32 rounded-full object-cover ring-4 ring-orange-50"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-orange-50 text-3xl font-bold text-primary ring-4 ring-orange-100">
                {initials(trainee.firstName, trainee.lastName)}
              </div>
            )}
            <h1 className="mt-5 text-2xl font-bold text-[#1A1A2E]">
              {trainee.lastName} {trainee.firstName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{trainee.team ?? 'Команда не указана'}</p>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Команда:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{trainee.team ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Почта:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{trainee.email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Телефон:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{trainee.phone ?? '—'}</span>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          {taskDashboard?.adaptationPath && (
            <AdaptationPathTimeline
              path={taskDashboard.adaptationPath}
              blockLinkPrefix={
                canEditPlans ? `${basePath}/trainees/${trainee.userId}/plan` : undefined
              }
              linkMilestones={canEditPlans}
              compact
            />
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-[#1A1A2E]">Прогресс стажировки</h2>
              <p className="text-sm text-gray-500">Общий прогресс и последние выполненные задачи</p>
            </div>
            <div className="mt-6">
              <TraineeProgressBar label="Общий прогресс" value={trainee.totalProgress} />
            </div>
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-[#1A1A2E]">Последние выполненные задачи</h3>
              {tasksLoading && (
                <p className="mt-4 text-sm text-gray-500">Загрузка задач…</p>
              )}
              {!tasksLoading && recentCompletedTasks.length === 0 && (
                <p className="mt-4 rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
                  Пока нет завершённых задач
                </p>
              )}
              {!tasksLoading && recentCompletedTasks.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {recentCompletedTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#1A1A2E]">{task.description}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {task.blockTitle}
                          {task.completedAt && (
                            <>
                              {' · '}
                              {formatDateTime(task.completedAt)}
                            </>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1A1A2E]">Наставник</h2>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Имя:</span>{' '}
                  <span className="font-medium text-[#1A1A2E]">
                    {trainee.mentorFullName ?? 'Не назначен'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Телефон:</span>{' '}
                  <span className="font-medium text-[#1A1A2E]">
                    {trainee.mentorPhone ?? '—'}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1A1A2E]">Уровень настроения</h2>
              <p className="mt-1 text-xs text-gray-500">По последнему еженедельному опросу</p>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    trainee.moodLevel >= 4 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-primary'
                  )}
                >
                  <Smile className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{trainee.moodLevel}/5</p>
                  <p className="text-sm text-gray-500">
                    {moodLabels[trainee.moodLevel] ?? 'Не указано'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1A1A2E]">Задачи стажёра</h2>
            <p className="mt-1 text-sm text-gray-500">
              Статусы, прогресс и комментарии по каждому блоку плана
            </p>
            {tasksLoading && <p className="mt-6 text-sm text-gray-500">Загрузка задач…</p>}
            {!tasksLoading && taskDashboard && (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {taskDashboard.taskBlocks.map((block) => {
                  const Icon = blockIcons[block.id] ?? Building2
                  const completedCount = block.tasks.filter((t) => t.status === 'COMPLETED').length
                  const inProgressCount = block.tasks.filter((t) => t.status === 'IN_PROGRESS').length
                  return (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => setSelectedBlock(block)}
                      className={cn(
                        'rounded-xl border border-gray-200 p-4 text-left transition-colors',
                        'hover:border-primary/30 hover:bg-orange-50/30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-[#1A1A2E]">{block.title}</p>
                            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {block.tasks.length === 0
                              ? 'Нет задач'
                              : `${completedCount} завершено · ${inProgressCount} в работе`}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <TraineeProgressBar label="Прогресс" value={block.progress} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <TaskBlockDialog
            block={
              selectedBlock && taskDashboard
                ? taskDashboard.taskBlocks.find((b) => b.id === selectedBlock.id) ?? selectedBlock
                : null
            }
            open={Boolean(selectedBlock)}
            onOpenChange={(open) => {
              if (!open) setSelectedBlock(null)
            }}
            readOnly
          />

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1A1A2E]">Еженедельная обратная связь</h2>
            <p className="mt-1 text-sm text-gray-500">
              Настроение, понятность задач и доступы — по неделям
            </p>
            {feedbackLoading && (
              <p className="mt-6 text-sm text-gray-500">Загрузка опросов…</p>
            )}
            {!feedbackLoading && feedbackHistory.length === 0 && (
              <p className="mt-6 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                Стажёр ещё не заполнял опросы
              </p>
            )}
            <div className="mt-6 space-y-3">
              {feedbackHistory.map((item) => (
                <FeedbackResponseCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

