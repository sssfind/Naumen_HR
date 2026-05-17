import { FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStaffDashboard } from '@/hooks/useStaffDashboard'
import {
  useCreatePlanTemplateTask,
  useDeletePlanTemplateTask,
  usePlanTemplate,
} from '@/hooks/usePlanTemplates'
import type {
  AcceptanceCheckType,
  TaskPriority,
  TraineePlanBlockType,
} from '@/types/trainee'
import type { PlanTemplateBlock, PlanTemplateTaskRequest } from '@/types/template'

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
  MACHINE: 'Машина',
  USER: 'Пользователь',
}

const emptyTaskForm = (block: TraineePlanBlockType): PlanTemplateTaskRequest => ({
  block,
  description: '',
  acceptanceCriteria: '',
  priority: 'MEDIUM',
  acceptanceCheckType: 'USER',
  daysFromStart: 7,
})

export function PlanTemplateDetailPage() {
  const { basePath } = useStaffDashboard()
  const { templateId } = useParams()
  const numericId = templateId ? Number(templateId) : undefined
  const { data, isLoading, isError } = usePlanTemplate(numericId)
  const createTask = useCreatePlanTemplateTask(numericId)
  const deleteTask = useDeletePlanTemplateTask(numericId)

  if (isLoading) return <p className="text-gray-500">Загрузка шаблона…</p>
  if (isError || !data) {
    return (
      <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">
        Шаблон не найден
      </p>
    )
  }

  return (
    <div>
      <Button asChild variant="ghost" className="mb-6 gap-2">
        <Link to={`${basePath}/plan-templates`}>
          <ArrowLeft className="h-4 w-4" />
          К списку шаблонов
        </Link>
      </Button>

      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E]">{data.name}</h1>
            {data.targetPosition && (
              <p className="mt-1 text-sm text-primary">{data.targetPosition}</p>
            )}
            <p className="mt-3 text-sm text-gray-600">{data.description}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {data.system && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">Системный</span>
            )}
            <span className="rounded-full bg-orange-50 px-3 py-1 text-primary">
              {data.durationWeeks} недель
            </span>
          </div>
        </div>
        {data.system && (
          <p className="mt-4 text-sm text-gray-500">
            Системный шаблон доступен только для просмотра и применения к стажёрам.
          </p>
        )}
      </div>

      <div className="space-y-6">
        {data.blocks.map((block) => (
          <TemplateBlockSection
            key={block.id}
            block={block}
            editable={!data.system}
            isSaving={createTask.isPending}
            isDeleting={deleteTask.isPending}
            onCreate={(request) => createTask.mutateAsync(request)}
            onDelete={(taskId) => deleteTask.mutate(taskId)}
          />
        ))}
      </div>
    </div>
  )
}

function TemplateBlockSection({
  block,
  editable,
  isSaving,
  isDeleting,
  onCreate,
  onDelete,
}: {
  block: PlanTemplateBlock
  editable: boolean
  isSaving: boolean
  isDeleting: boolean
  onCreate: (request: PlanTemplateTaskRequest) => Promise<unknown>
  onDelete: (taskId: number) => void
}) {
  const blockType = blockTypeById[block.id]
  const [form, setForm] = useState<PlanTemplateTaskRequest>(() => emptyTaskForm(blockType))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await onCreate({ ...form, block: blockType })
    setForm(emptyTaskForm(blockType))
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1A1A2E]">{block.title}</h2>
      <p className="text-sm text-gray-500">Задач: {block.tasks.length}</p>

      {editable && (
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={2}
            placeholder="Описание задачи"
            className="rounded-md border border-input bg-white px-3 py-2 text-sm"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-xs font-medium">
              День от старта
              <Input
                type="number"
                min={0}
                value={form.daysFromStart}
                onChange={(e) => setForm({ ...form, daysFromStart: Number(e.target.value) })}
                required
              />
            </label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
              className="h-10 rounded-md border border-input bg-white px-2 text-sm"
            >
              {Object.entries(priorityLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={form.acceptanceCheckType}
              onChange={(e) =>
                setForm({ ...form, acceptanceCheckType: e.target.value as AcceptanceCheckType })
              }
              className="h-10 rounded-md border border-input bg-white px-2 text-sm"
            >
              {Object.entries(acceptanceLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={form.acceptanceCriteria}
            onChange={(e) => setForm({ ...form, acceptanceCriteria: e.target.value })}
            required
            rows={2}
            placeholder="Критерии приёмки"
            className="rounded-md border border-input bg-white px-3 py-2 text-sm"
          />
          <Button type="submit" size="sm" disabled={isSaving} className="w-fit gap-1">
            <Plus className="h-4 w-4" />
            Добавить задачу
          </Button>
        </form>
      )}

      <ul className="mt-4 space-y-3">
        {block.tasks.length === 0 ? (
          <li className="text-sm text-gray-500">Нет задач в блоке</li>
        ) : (
          block.tasks.map((task) => (
            <li key={task.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:justify-between">
                <div>
                  <p className="font-medium text-[#1A1A2E]">{task.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      День {task.daysFromStart}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      {priorityLabels[task.priority]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{task.acceptanceCriteria}</p>
                </div>
                {editable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => onDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
