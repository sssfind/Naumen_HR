import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EditTraineePlanPage() {
  const { traineeId } = useParams()

  return (
    <div>
      <Button asChild variant="ghost" className="mb-6 gap-2">
        <Link to={`/dashboard/hr/trainees/${traineeId}`}>
          <ArrowLeft className="h-4 w-4" />
          Назад к профилю стажёра
        </Link>
      </Button>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Редактирование плана стажера</h1>
        <p className="mt-2 text-gray-500">Страница пока пустая.</p>
      </div>
    </div>
  )
}
