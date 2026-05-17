import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskBlockTasksList } from '@/components/trainee/TaskBlockTasksList'
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
  activeAction?: 'start' | 'complete' | 'comment' | 'approve' | 'reject' | null
  reviewMode?: boolean
  onApprove?: (taskId: number) => Promise<unknown>
  onReject?: (taskId: number, comment: string) => Promise<unknown>
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
  reviewMode = false,
  onApprove,
  onReject,
}: TaskBlockDialogProps) {
  if (!block) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{block.title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <TaskBlockTasksList
            block={block}
            readOnly={readOnly}
            onStart={onStart}
            onComplete={onComplete}
            onComment={onComment}
            activeTaskId={activeTaskId}
            activeAction={activeAction}
            reviewMode={reviewMode}
            onApprove={onApprove}
            onReject={onReject}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
