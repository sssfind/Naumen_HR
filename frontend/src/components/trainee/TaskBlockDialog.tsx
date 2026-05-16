import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlanTaskCard } from '@/components/trainee/PlanTaskCard'
import { ProgressBar } from '@/components/trainee/ProgressBar'
import type { TaskProgressBlock } from '@/types/trainee'

interface TaskBlockDialogProps {
  block: TaskProgressBlock | null
  open: boolean
  onOpenChange: (open: boolean) => void
  readOnly?: boolean
  onStart?: (taskId: number) => Promise<unknown>
  onComplete?: (taskId: number) => Promise<unknown>
  onComment?: (taskId: number, text: string) => Promise<unknown>
  activeTaskId?: number | null
  activeAction?: 'start' | 'complete' | 'comment' | null
}

export function TaskBlockDialog({
  block,
  open,
  onOpenChange,
  readOnly = false,
  onStart,
  onComplete,
  onComment,
  activeTaskId,
  activeAction,
}: TaskBlockDialogProps) {
  if (!block) return null

  const completedCount = block.tasks.filter((task) => (task.status ?? 'NOT_STARTED') === 'COMPLETED').length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{block.title}</DialogTitle>
          <DialogDescription>
            {block.tasks.length === 0
              ? 'В этом блоке пока нет задач'
              : `Выполнено ${completedCount} из ${block.tasks.length} · прогресс ${block.progress}%`}
          </DialogDescription>
          <div className="mt-4">
            <ProgressBar label="Прогресс блока" value={block.progress} />
          </div>
        </DialogHeader>
        <DialogBody className="space-y-3">
          {block.tasks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              Задачи появятся после того, как HR добавит их в ваш план.
            </p>
          ) : (
            block.tasks.map((task) => (
              <PlanTaskCard
                key={task.id}
                task={task}
                readOnly={readOnly}
                onStart={onStart}
                onComplete={onComplete}
                onComment={onComment}
                isStarting={activeAction === 'start' && activeTaskId === task.id}
                isCompleting={activeAction === 'complete' && activeTaskId === task.id}
                isCommenting={activeAction === 'comment' && activeTaskId === task.id}
              />
            ))
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
