import { PlanTaskCard } from '@/components/trainee/PlanTaskCard'
import { ProgressBar } from '@/components/trainee/ProgressBar'
import type { TaskProgressBlock } from '@/types/trainee'

interface TaskBlockTasksListProps {
  block: TaskProgressBlock
  readOnly?: boolean
  onStart?: (taskId: number) => Promise<unknown>
  onComplete?: (taskId: number) => Promise<unknown>
  onComment?: (taskId: number, text: string) => Promise<unknown>
  activeTaskId?: number | null
  activeAction?: 'start' | 'complete' | 'comment' | 'approve' | 'reject' | null
  highlightedTaskId?: number | null
  reviewMode?: boolean
  onApprove?: (taskId: number) => Promise<unknown>
  onReject?: (taskId: number, comment: string) => Promise<unknown>
}

export function TaskBlockTasksList({
  block,
  readOnly = false,
  onStart,
  onComplete,
  onComment,
  activeTaskId,
  activeAction,
  highlightedTaskId,
  reviewMode = false,
  onApprove,
  onReject,
}: TaskBlockTasksListProps) {
  const completedCount = block.tasks.filter(
    (task) => (task.status ?? 'NOT_STARTED') === 'COMPLETED'
  ).length

  return (
    <>
      <p className="text-sm text-gray-500">
        {block.tasks.length === 0
          ? 'В этом блоке пока нет задач'
          : `Выполнено ${completedCount} из ${block.tasks.length} · прогресс ${block.progress}%`}
      </p>
      <div className="mt-4 w-full">
        <ProgressBar label="Прогресс блока" value={block.progress} />
      </div>
      <div className="mt-8 w-full space-y-4">
        {block.tasks.length === 0 ? (
          <p className="w-full rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Задачи появятся после того, как HR добавит их в ваш план.
          </p>
        ) : (
          block.tasks.map((task) => (
            <PlanTaskCard
              key={task.id}
              task={task}
              readOnly={readOnly}
              reviewMode={reviewMode}
              onStart={onStart}
              onComplete={onComplete}
              onComment={onComment}
              onApprove={onApprove}
              onReject={onReject}
              isStarting={activeAction === 'start' && activeTaskId === task.id}
              isCompleting={activeAction === 'complete' && activeTaskId === task.id}
              isCommenting={activeAction === 'comment' && activeTaskId === task.id}
              isApproving={activeAction === 'approve' && activeTaskId === task.id}
              isRejecting={activeAction === 'reject' && activeTaskId === task.id}
              isHighlighted={highlightedTaskId === task.id}
            />
          ))
        )}
      </div>
    </>
  )
}
