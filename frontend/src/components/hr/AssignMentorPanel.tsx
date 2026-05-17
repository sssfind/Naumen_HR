import { useState } from 'react'
import { UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAssignMentor, useMentors } from '@/hooks/useTrainees'

type AssignMentorPanelProps = {
  traineeId: number
  currentMentorId?: number | null
  currentMentorName?: string | null
}

export function AssignMentorPanel({
  traineeId,
  currentMentorId,
  currentMentorName,
}: AssignMentorPanelProps) {
  const { data: mentors = [], isLoading } = useMentors()
  const assignMentor = useAssignMentor()
  const [selectedId, setSelectedId] = useState<string>(
    currentMentorId != null ? String(currentMentorId) : ''
  )

  function handleAssign() {
    const mentorId = Number(selectedId)
    if (!mentorId) return
    assignMentor.mutate({ traineeId, mentorId })
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 font-semibold text-[#1A1A2E]">
        <UserCheck className="h-4 w-4 text-primary" />
        Наставник
      </h3>
      {currentMentorName && (
        <p className="mt-2 text-sm text-gray-600">
          Сейчас: <span className="font-medium text-[#1A1A2E]">{currentMentorName}</span>
        </p>
      )}
      <p className="mt-1 text-sm text-gray-500">
        Назначьте наставника, который будет сопровождать стажёра и получать опросы.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="mentor-select" className="mb-1 block text-xs font-medium text-gray-600">
            Выберите наставника
          </label>
          <select
            id="mentor-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={isLoading || mentors.length === 0}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1A1A2E] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">— не выбран —</option>
            {mentors.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.fullName}
                {m.department ? ` · ${m.department}` : ''}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          onClick={handleAssign}
          disabled={!selectedId || assignMentor.isPending}
          className="shrink-0"
        >
          {assignMentor.isPending ? 'Сохранение…' : 'Назначить'}
        </Button>
      </div>
      {!isLoading && mentors.length === 0 && (
        <p className="mt-2 text-xs text-amber-700">
          В системе пока нет пользователей с ролью «Наставник». Зарегистрируйте наставника на странице входа.
        </p>
      )}
    </section>
  )
}
