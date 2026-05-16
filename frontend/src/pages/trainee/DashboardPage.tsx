import { Building2, Briefcase, Sparkles } from 'lucide-react'
import { ProgressBar } from '@/components/trainee/ProgressBar'
import { useTraineeDashboard } from '@/hooks/useTrainee'

const blockIcons: Record<string, typeof Building2> = {
  onboarding: Building2,
  skills: Sparkles,
  work: Briefcase,
}

export function TraineeDashboardPage() {
  const { data, isLoading, isError } = useTraineeDashboard()

  if (isLoading) {
    return <p className="text-gray-500">Загрузка…</p>
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Не удалось загрузить задачи
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E]">Мои задачи</h1>
      <p className="mt-1 text-sm text-gray-500">
        Прогресс по трём направлениям стажировки
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 px-6 py-4">
        <div className="rounded-full bg-white px-4 py-2 text-2xl font-bold text-primary shadow-sm">
          {data.totalProgress}%
        </div>
        <div>
          <p className="font-semibold text-[#1A1A2E]">Общий прогресс</p>
          <p className="text-sm text-gray-500">Среднее по всем блокам задач</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {data.taskBlocks.map((block) => {
          const Icon = blockIcons[block.id] ?? Building2
          return (
            <section
              key={block.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#1A1A2E]">{block.title}</h2>
                  <p className="mt-0.5 text-xs text-gray-500">Выполнено {block.progress}%</p>
                </div>
              </div>
              <ProgressBar label="Прогресс" value={block.progress} />
            </section>
          )
        })}
      </div>
    </div>
  )
}
