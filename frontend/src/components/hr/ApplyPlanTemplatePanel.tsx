import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApplyPlanTemplate, usePlanTemplates } from '@/hooks/usePlanTemplates'

interface ApplyPlanTemplatePanelProps {
  traineeId: number
}

export function ApplyPlanTemplatePanel({ traineeId }: ApplyPlanTemplatePanelProps) {
  const { data: templates = [], isLoading } = usePlanTemplates()
  const applyTemplate = useApplyPlanTemplate(traineeId)
  const [templateId, setTemplateId] = useState('')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [replaceExisting, setReplaceExisting] = useState(false)

  const selected = templates.find((t) => t.id === Number(templateId))

  async function handleApply() {
    if (!templateId) return
    await applyTemplate.mutateAsync({
      templateId: Number(templateId),
      request: {
        startDate,
        replaceExisting,
      },
    })
  }

  return (
    <section className="mb-6 rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
          <BookTemplate className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h2 className="font-semibold text-[#1A1A2E]">Применить шаблон плана</h2>
          <p className="mt-1 text-sm text-gray-600">
            Добавьте задачи из готового шаблона. Дедлайны считаются от даты старта.
          </p>
          <Link
            to="/dashboard/hr/plan-templates"
            className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
          >
            Все шаблоны →
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1 text-sm font-medium text-[#1A1A2E] lg:col-span-2">
          Шаблон
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            disabled={isLoading}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Выберите шаблон</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.taskCount} задач)
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-[#1A1A2E]">
          Дата старта
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={replaceExisting}
            onChange={(e) => setReplaceExisting(e.target.checked)}
            className="rounded border-gray-300"
          />
          Заменить текущий план
        </label>
      </div>

      {selected && (
        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{selected.description}</p>
      )}

      <Button
        type="button"
        className="mt-4"
        disabled={!templateId || applyTemplate.isPending}
        onClick={handleApply}
      >
        Применить шаблон
      </Button>
    </section>
  )
}
