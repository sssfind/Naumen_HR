import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Building2, Briefcase, Sparkles } from 'lucide-react'
import { TaskBlockTasksList } from '@/components/trainee/TaskBlockTasksList'
import { Button } from '@/components/ui/button'
import {
  useAddTraineeTaskComment,
  useCompleteTraineeTask,
  useStartTraineeTask,
  useTraineeDashboard,
} from '@/hooks/useTrainee'

const blockIcons: Record<string, typeof Building2> = {
  onboarding: Building2,
  skills: Sparkles,
  work: Briefcase,
}

const validBlockIds = new Set(['onboarding', 'skills', 'work'])

export function TraineeBlockTasksPage() {
  const { blockId } = useParams<{ blockId: string }>()
  const [searchParams] = useSearchParams()
  const { data, isLoading, isError } = useTraineeDashboard()
  const startTask = useStartTraineeTask()
  const completeTask = useCompleteTraineeTask()
  const addComment = useAddTraineeTaskComment()

  const [activeTaskId, setActiveTaskId] = useState<number | null>(null)
  const [activeAction, setActiveAction] = useState<'start' | 'complete' | 'comment' | null>(null)
  const highlightedTaskId = useMemo(() => {
    const rawTaskId = searchParams.get('taskId')
    if (!rawTaskId) return null
    const parsed = Number(rawTaskId)
    return Number.isFinite(parsed) ? parsed : null
  }, [searchParams])

  useEffect(() => {
    if (isLoading || highlightedTaskId == null) return

    const scrollTimer = window.setTimeout(() => {
      document
        .getElementById(`task-${highlightedTaskId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)

    return () => window.clearTimeout(scrollTimer)
  }, [highlightedTaskId, isLoading])

  if (!blockId || !validBlockIds.has(blockId)) {
    return <Navigate to="/dashboard/trainee" replace />
  }

  if (isLoading) {
    return <p className="text-gray-500">Загрузка задач…</p>
  }

  if (isError || !data) {
    return (
      <div>
        <Button asChild variant="ghost" className="mb-6 gap-2">
          <Link to="/dashboard/trainee">
            <ArrowLeft className="h-4 w-4" />
            Назад к задачам
          </Link>
        </Button>
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Не удалось загрузить задачи
        </div>
      </div>
    )
  }

  const block = data.taskBlocks.find((item) => item.id === blockId)
  if (!block) {
    return <Navigate to="/dashboard/trainee" replace />
  }

  const Icon = blockIcons[block.id] ?? Building2

  const handleStart = async (taskId: number) => {
    setActiveTaskId(taskId)
    setActiveAction('start')
    try {
      await startTask.mutateAsync(taskId)
    } finally {
      setActiveTaskId(null)
      setActiveAction(null)
    }
  }

  const handleComplete = async (taskId: number) => {
    setActiveTaskId(taskId)
    setActiveAction('complete')
    try {
      await completeTask.mutateAsync(taskId)
    } finally {
      setActiveTaskId(null)
      setActiveAction(null)
    }
  }

  const handleComment = async (taskId: number, text: string) => {
    setActiveTaskId(taskId)
    setActiveAction('comment')
    try {
      await addComment.mutateAsync({ taskId, text })
    } finally {
      setActiveTaskId(null)
      setActiveAction(null)
    }
  }

  return (
    <div className="w-full">
      <Button asChild variant="ghost" className="mb-6 gap-2">
        <Link to="/dashboard/trainee">
          <ArrowLeft className="h-4 w-4" />
          Назад к задачам
        </Link>
      </Button>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">{block.title}</h1>
          <p className="mt-1 text-sm text-gray-500">Все задачи блока</p>
        </div>
      </div>

      <div className="mt-8 w-full">
        <TaskBlockTasksList
          block={block}
          onStart={handleStart}
          onComplete={handleComplete}
          onComment={handleComment}
          activeTaskId={activeTaskId}
          activeAction={activeAction}
          highlightedTaskId={highlightedTaskId}
        />
      </div>
    </div>
  )
}
