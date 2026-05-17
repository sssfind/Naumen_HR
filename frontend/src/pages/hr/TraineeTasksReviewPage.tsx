import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, ExternalLink } from 'lucide-react'
import { PlanTaskCard } from '@/components/trainee/PlanTaskCard'
import { Button } from '@/components/ui/button'
import { useStaffDashboard } from '@/hooks/useStaffDashboard'
import { usePendingReviewTasks } from '@/hooks/useTrainees'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { PendingReviewTask, TraineePlanTask } from '@/types/trainee'

const t = {
  title: '\u0417\u0430\u0434\u0430\u0447\u0438 \u0441\u0442\u0430\u0436\u0451\u0440\u043e\u0432',
  subtitle:
    '\u0417\u0430\u0434\u0430\u0447\u0438, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u0441\u0442\u0430\u0436\u0451\u0440\u044b \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u043b\u0438 \u043d\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0443. \u041f\u0440\u0438\u043c\u0438\u0442\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435 \u0438\u043b\u0438 \u0432\u0435\u0440\u043d\u0438\u0442\u0435 \u043d\u0430 \u0434\u043e\u0440\u0430\u0431\u043e\u0442\u043a\u0443 \u0441 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0435\u043c.',
  loading: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0437\u0430\u0434\u0430\u0447\u2026',
  loadError: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0441\u043f\u0438\u0441\u043e\u043a \u0437\u0430\u0434\u0430\u0447',
  empty: '\u041d\u0435\u0442 \u0437\u0430\u0434\u0430\u0447, \u043e\u0436\u0438\u0434\u0430\u044e\u0449\u0438\u0445 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438',
  team: '\u041a\u043e\u043c\u0430\u043d\u0434\u0430',
  profile: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u0441\u0442\u0430\u0436\u0451\u0440\u0430',
  approved: '\u0417\u0430\u0434\u0430\u0447\u0430 \u043f\u0440\u0438\u043d\u044f\u0442\u0430',
  approveError: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c \u0437\u0430\u0434\u0430\u0447\u0443',
  rejected: '\u0417\u0430\u0434\u0430\u0447\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0430 \u043d\u0430 \u0434\u043e\u0440\u0430\u0431\u043e\u0442\u043a\u0443',
  rejectError: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043a\u043b\u043e\u043d\u0438\u0442\u044c \u0437\u0430\u0434\u0430\u0447\u0443',
} as const

export function TraineeTasksReviewPage() {
  const { basePath } = useStaffDashboard()
  const queryClient = useQueryClient()
  const { data: items = [], isLoading, isError } = usePendingReviewTasks()
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null)
  const [activeAction, setActiveAction] = useState<'approve' | 'reject' | null>(null)

  async function invalidateAfterReview(traineeId: number) {
    await queryClient.invalidateQueries({ queryKey: ['hr', 'tasks', 'pending-review'] })
    await queryClient.invalidateQueries({ queryKey: ['hr', 'trainees', traineeId, 'dashboard'] })
    await queryClient.invalidateQueries({ queryKey: ['hr', 'trainees', traineeId] })
    await queryClient.invalidateQueries({ queryKey: ['hr', 'stats'] })
    await queryClient.invalidateQueries({ queryKey: ['trainee', 'dashboard'] })
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  async function handleApprove(traineeId: number, taskId: number) {
    setActiveTaskId(taskId)
    setActiveAction('approve')
    try {
      await api.post<TraineePlanTask>(`/hr/trainees/${traineeId}/tasks/${taskId}/approve`)
      await invalidateAfterReview(traineeId)
      toast.success(t.approved)
    } catch {
      toast.error(t.approveError)
    } finally {
      setActiveTaskId(null)
      setActiveAction(null)
    }
  }

  async function handleReject(traineeId: number, taskId: number, comment?: string) {
    setActiveTaskId(taskId)
    setActiveAction('reject')
    try {
      await api.post<TraineePlanTask>(`/hr/trainees/${traineeId}/tasks/${taskId}/reject`, {
        comment: comment?.trim() || undefined,
      })
      await invalidateAfterReview(traineeId)
      toast.success(t.rejected)
    } catch {
      toast.error(t.rejectError)
    } finally {
      setActiveTaskId(null)
      setActiveAction(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1A1A2E]">
          <CheckSquare className="h-7 w-7 text-primary" />
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{t.subtitle}</p>
      </div>

      {isLoading && <p className="text-gray-500">{t.loading}</p>}

      {isError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-800">
          {t.loadError}
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          {t.empty}
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <ul className="space-y-6">
          {items.map((item: PendingReviewTask) => (
            <li key={item.task.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-[#1A1A2E]">{item.traineeFullName}</p>
                  {item.traineeTeam && (
                    <p className="text-xs text-gray-500">
                      {t.team}: {item.traineeTeam}
                    </p>
                  )}
                </div>
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link to={`${basePath}/trainees/${item.traineeId}`}>
                    {t.profile}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <PlanTaskCard
                task={item.task}
                reviewMode
                onApprove={() => handleApprove(item.traineeId, item.task.id)}
                onReject={(_taskId, comment) =>
                  handleReject(item.traineeId, item.task.id, comment)
                }
                isApproving={activeTaskId === item.task.id && activeAction === 'approve'}
                isRejecting={activeTaskId === item.task.id && activeAction === 'reject'}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
