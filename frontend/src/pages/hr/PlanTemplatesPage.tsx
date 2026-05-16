import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookTemplate, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreatePlanTemplate, useDeletePlanTemplate, usePlanTemplates } from '@/hooks/usePlanTemplates'
import type { PlanTemplateSummary } from '@/types/template'

export function PlanTemplatesPage() {
  const { data: templates = [], isLoading, isError } = usePlanTemplates()
  const createTemplate = useCreatePlanTemplate()
  const deleteTemplate = useDeletePlanTemplate()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetPosition, setTargetPosition] = useState('')
  const [durationWeeks, setDurationWeeks] = useState('12')

  const systemTemplates = templates.filter((t) => t.system)
  const customTemplates = templates.filter((t) => !t.system)

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    const created = await createTemplate.mutateAsync({
      name: name.trim(),
      description: description.trim(),
      targetPosition: targetPosition.trim() || undefined,
      durationWeeks: Number(durationWeeks) || 12,
    })
    setShowCreate(false)
    setName('')
    setDescription('')
    setTargetPosition('')
    setDurationWeeks('12')
    window.location.href = `/dashboard/hr/plan-templates/${created.id}`
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Шаблоны адаптации</h1>
          <p className="mt-1 text-sm text-gray-500">
            Готовые планы по ролям и собственные шаблоны для назначения стажёрам.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreate((v) => !v)}>
          <Plus className="h-4 w-4" />
          Свой шаблон
        </Button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-[#1A1A2E]">Новый шаблон</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">
              Название
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Целевая должность
              <Input
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
                placeholder="Например, DevOps Engineer"
              />
            </label>
            <label className="md:col-span-2 grid gap-1 text-sm font-medium">
              Описание
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Длительность (недель)
              <Input
                type="number"
                min={1}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={createTemplate.isPending}>
              Создать
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Отмена
            </Button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-gray-500">Загрузка шаблонов…</p>}
      {isError && (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">
          Не удалось загрузить шаблоны
        </p>
      )}

      {!isLoading && !isError && (
        <>
          <TemplateSection title="Системные шаблоны" items={systemTemplates} />
          <TemplateSection
            title="Мои шаблоны"
            items={customTemplates}
            emptyText="Вы ещё не создали собственных шаблонов."
            onDelete={(id) => {
              if (window.confirm('Удалить шаблон?')) deleteTemplate.mutate(id)
            }}
            deleting={deleteTemplate.isPending}
          />
        </>
      )}
    </div>
  )
}

function TemplateSection({
  title,
  items,
  emptyText,
  onDelete,
  deleting,
}: {
  title: string
  items: PlanTemplateSummary[]
  emptyText?: string
  onDelete?: (id: number) => void
  deleting?: boolean
}) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-[#1A1A2E]">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyText ?? 'Нет шаблонов'}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((template) => (
            <article
              key={template.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-primary">
                    <BookTemplate className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#1A1A2E]">{template.name}</h3>
                    {template.targetPosition && (
                      <p className="text-xs text-primary">{template.targetPosition}</p>
                    )}
                  </div>
                </div>
                {template.system && (
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    Системный
                  </span>
                )}
              </div>
              <p className="mt-3 flex-1 text-sm text-gray-600 line-clamp-3">{template.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-gray-100 px-2 py-1">{template.taskCount} задач</span>
                <span className="rounded-full bg-gray-100 px-2 py-1">{template.durationWeeks} нед.</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <Link to={`/dashboard/hr/plan-templates/${template.id}`}>
                    Открыть
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                {onDelete && !template.system && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={deleting}
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
