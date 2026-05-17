import { Link, useParams } from 'react-router-dom'
import { useStaffDashboard } from '@/hooks/useStaffDashboard'
import { FormEvent, useState } from 'react'
import { ArrowLeft, CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import { statusBadgeClass, statusLabels } from '@/components/trainee/planTaskLabels'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { ApplyPlanTemplatePanel } from '@/components/hr/ApplyPlanTemplatePanel'
import {
  useCreateTraineePlanTask,
  useDeleteTraineePlanTask,
  useTraineePlan,
  useUpdateTraineePlanTask,
} from '@/hooks/useTrainees'
import type {
  AcceptanceCheckType,
  TaskPriority,
  TraineePlanBlock,
  TraineePlanBlockType,
  TraineePlanTask,
  TraineePlanTaskRequest,
} from '@/types/trainee'

const blockTypeById: Record<string, TraineePlanBlockType> = {
  onboarding: 'ONBOARDING',
  skills: 'SKILLS',
  work: 'WORK',
}

const priorityLabels: Record<TaskPriority, string> = {
  LOW: 'Низкий',
  MEDIUM: 'Средний',
  HIGH: 'Высокий',
}

const acceptanceLabels: Record<AcceptanceCheckType, string> = {
  MACHINE: 'Проверяется машиной',
  USER: 'Проверяется пользователем',
}

const emptyForm = (block: TraineePlanBlockType): TraineePlanTaskRequest => ({
  block,
  description: '',
  deadline: '',
  priority: 'MEDIUM',
  acceptanceCriteria: '',
  acceptanceCheckType: 'USER',
})

export function EditTraineePlanPage() {
  const { basePath } = useStaffDashboard()
  const { traineeId } = useParams()
  const numericTraineeId = traineeId ? Number(traineeId) : undefined
  const { data, isLoading, isError } = useTraineePlan(numericTraineeId)
  const createTask = useCreateTraineePlanTask(numericTraineeId)
  const updateTask = useUpdateTraineePlanTask(numericTraineeId)
  const deleteTask = useDeleteTraineePlanTask(numericTraineeId)

  return (
    <div>
      <Button asChild variant="ghost" className="mb-6 gap-2">
        <Link to={`${basePath}/trainees/${traineeId}`}>
          <ArrowLeft className="h-4 w-4" />
          Назад к профилю стажёра
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Редактирование плана стажёра</h1>
        <p className="mt-1 text-sm text-gray-500">
          Создавайте и обновляйте задачи отдельно в каждом блоке плана.
        </p>
      </div>

      {isLoading && <p className="text-gray-500">Загрузка плана…</p>}

      {isError && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Не удалось загрузить план стажёра
        </div>
      )}

      {numericTraineeId && !isError && (
        <ApplyPlanTemplatePanel traineeId={numericTraineeId} />
      )}

      {data && (
        <div className="space-y-6">
          {data.blocks.map((block) => (
            <PlanBlockEditor
              key={block.id}
              block={block}
              isSaving={createTask.isPending || updateTask.isPending}
              isDeleting={deleteTask.isPending}
              onCreate={(request) => createTask.mutateAsync(request)}
              onUpdate={(taskId, request) => updateTask.mutateAsync({ taskId, request })}
              onDelete={(taskId) => deleteTask.mutate(taskId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PlanBlockEditorProps {
  block: TraineePlanBlock
  isSaving: boolean
  isDeleting: boolean
  onCreate: (request: TraineePlanTaskRequest) => Promise<TraineePlanTask>
  onUpdate: (taskId: number, request: TraineePlanTaskRequest) => Promise<TraineePlanTask>
  onDelete: (taskId: number) => void
}

function PlanBlockEditor({
  block,
  isSaving,
  isDeleting,
  onCreate,
  onUpdate,
  onDelete,
}: PlanBlockEditorProps) {
  const blockType = blockTypeById[block.id]
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [form, setForm] = useState<TraineePlanTaskRequest>(() => emptyForm(blockType))

  const resetForm = () => {
    setEditingTaskId(null)
    setForm(emptyForm(blockType))
  }

  const startEdit = (task: TraineePlanTask) => {
    setEditingTaskId(task.id)
    setForm({
      block: task.block,
      description: task.description,
      deadline: task.deadline,
      priority: task.priority,
      acceptanceCriteria: task.acceptanceCriteria,
      acceptanceCheckType: task.acceptanceCheckType,
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (editingTaskId) {
      await onUpdate(editingTaskId, form)
    } else {
      await onCreate(form)
    }
    resetForm()
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A2E]">{block.title}</h2>
          <p className="text-sm text-gray-500">Задач в блоке: {block.tasks.length}</p>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-primary">
          {editingTaskId ? 'Редактирование задачи' : 'Новая задача'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 rounded-xl bg-gray-50 p-4">
        <label className="grid gap-1 text-sm font-medium text-[#1A1A2E]">
          Описание задачи
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
            rows={3}
            className="min-h-24 rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Что нужно сделать стажёру"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-medium text-[#1A1A2E]">
            Дедлайн
            <Input
              type="date"
              value={form.deadline}
              onChange={(event) => setForm({ ...form, deadline: event.target.value })}
              required
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-[#1A1A2E]">
            Приоритет
            <select
              value={form.priority}
              onChange={(event) =>
                setForm({ ...form, priority: event.target.value as TaskPriority })
              }
              className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-medium text-[#1A1A2E]">
            Проверка приемки
            <select
              value={form.acceptanceCheckType}
              onChange={(event) =>
                setForm({
                  ...form,
                  acceptanceCheckType: event.target.value as AcceptanceCheckType,
                })
              }
              className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.entries(acceptanceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-sm font-medium text-[#1A1A2E]">
          Критерии приемки
          <textarea
            value={form.acceptanceCriteria}
            onChange={(event) => setForm({ ...form, acceptanceCriteria: event.target.value })}
            required
            rows={2}
            className="min-h-20 rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Как понять, что задача выполнена"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSaving} className="gap-2">
            <Plus className="h-4 w-4" />
            {editingTaskId ? 'Сохранить задачу' : 'Создать задачу'}
          </Button>
          {editingTaskId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Отменить
            </Button>
          )}
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {block.tasks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
            В этом блоке пока нет задач.
          </p>
        ) : (
          block.tasks.map((task) => (
            <article key={task.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[#1A1A2E]">{task.description}</p>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        statusBadgeClass[task.status ?? 'NOT_STARTED']
                      )}
                    >
                      {statusLabels[task.status ?? 'NOT_STARTED']}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {task.deadline}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      {priorityLabels[task.priority]}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      {acceptanceLabels[task.acceptanceCheckType]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    <span className="font-medium text-[#1A1A2E]">Критерии:</span>{' '}
                    {task.acceptanceCriteria}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => startEdit(task)}>
                    <Pencil className="h-4 w-4" />
                    Изменить
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => onDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Удалить
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
