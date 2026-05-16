import { useState } from 'react'
import { Flag, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  acceptanceLabels,
  formatDateTime,
  priorityLabels,
  statusBadgeClass,
  statusLabels,
} from '@/components/trainee/planTaskLabels'
import { cn } from '@/lib/utils'
import type { TraineePlanTask } from '@/types/trainee'

interface PlanTaskCardProps {
  task: TraineePlanTask
  readOnly?: boolean
  onStart?: (taskId: number) => Promise<unknown>
  onComplete?: (taskId: number) => Promise<unknown>
  onComment?: (taskId: number, text: string) => Promise<unknown>
  isStarting?: boolean
  isCompleting?: boolean
  isCommenting?: boolean
}

export function PlanTaskCard({
  task,
  readOnly = false,
  onStart,
  onComplete,
  onComment,
  isStarting,
  isCompleting,
  isCommenting,
}: PlanTaskCardProps) {
  const status = task.status ?? 'NOT_STARTED'
  const comments = task.comments ?? []
  const [commentText, setCommentText] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)

  const handleComment = async () => {
    if (!onComment || !commentText.trim()) return
    await onComment(task.id, commentText.trim())
    setCommentText('')
    setShowCommentForm(false)
  }

  return (
    <article className="w-full rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {task.milestone && (
            <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
              <Flag className="h-3 w-3" />
              Контрольная точка
            </span>
          )}
          <p className="font-medium text-[#1A1A2E]">{task.description}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
            statusBadgeClass[status]
          )}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="rounded-full bg-white px-2 py-1">Дедлайн: {task.deadline}</span>
        <span className="rounded-full bg-white px-2 py-1">{priorityLabels[task.priority]}</span>
        <span className="rounded-full bg-white px-2 py-1">
          {acceptanceLabels[task.acceptanceCheckType]}
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-600">
        <span className="font-medium text-[#1A1A2E]">Критерии:</span> {task.acceptanceCriteria}
      </p>

      {task.startedAt && (
        <p className="mt-2 text-xs text-gray-500">Взята в работу: {formatDateTime(task.startedAt)}</p>
      )}
      {task.completedAt && (
        <p className="mt-1 text-xs text-gray-500">Завершена: {formatDateTime(task.completedAt)}</p>
      )}

      {!readOnly && (
        <div className="mt-4 flex flex-wrap gap-2">
          {status === 'NOT_STARTED' && onStart && (
            <Button type="button" size="sm" disabled={isStarting} onClick={() => onStart(task.id)}>
              {isStarting && <Loader2 className="h-4 w-4 animate-spin" />}
              Взять в работу
            </Button>
          )}
          {status === 'IN_PROGRESS' && onComplete && (
            <Button
              type="button"
              size="sm"
              disabled={isCompleting}
              onClick={() => onComplete(task.id)}
            >
              {isCompleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Завершить задачу
            </Button>
          )}
          {onComment && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCommentForm((value) => !value)}
            >
              <MessageSquare className="h-4 w-4" />
              Комментарий
            </Button>
          )}
        </div>
      )}

      {showCommentForm && onComment && (
        <div className="mt-3 flex w-full gap-2">
          <Input
            className="min-w-0 flex-1"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Ваш комментарий для наставника и HR"
            maxLength={2000}
          />
          <Button
            type="button"
            size="sm"
            disabled={isCommenting || !commentText.trim()}
            onClick={handleComment}
          >
            {isCommenting && <Loader2 className="h-4 w-4 animate-spin" />}
            Отправить
          </Button>
        </div>
      )}

      {comments.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-xs font-medium text-gray-500">Комментарии</p>
          <ul className="mt-2 space-y-2">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-lg bg-white px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                  <span className="font-medium text-[#1A1A2E]">{comment.authorFullName}</span>
                  <span>{formatDateTime(comment.createdAt)}</span>
                </div>
                <p className="mt-1 text-gray-700">{comment.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
