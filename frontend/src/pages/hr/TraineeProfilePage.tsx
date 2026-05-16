import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Smile, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTraineeProfile } from '@/hooks/useTrainees'
import { cn } from '@/lib/utils'

const moodLabels: Record<number, string> = {
  1: 'Низкое',
  2: 'Ниже среднего',
  3: 'Нормальное',
  4: 'Хорошее',
  5: 'Отличное',
}

const progressBlocks = [
  { key: 'progressBlockOne', label: 'Блок 1' },
  { key: 'progressBlockTwo', label: 'Блок 2' },
  { key: 'progressBlockThree', label: 'Блок 3' },
] as const

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-[#1A1A2E]">{label}</span>
        <span className="text-gray-500">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}

function initials(firstName: string, lastName: string) {
  return `${lastName[0] ?? ''}${firstName[0] ?? ''}`.toUpperCase() || 'СТ'
}

export function TraineeProfilePage() {
  const { traineeId } = useParams()
  const numericTraineeId = traineeId ? Number(traineeId) : undefined
  const { data: trainee, isLoading, isError } = useTraineeProfile(numericTraineeId)

  if (isLoading) {
    return <p className="text-gray-500">Загрузка профиля стажёра…</p>
  }

  if (isError || !trainee) {
    return (
      <div>
        <Button asChild variant="ghost" className="mb-4 gap-2">
          <Link to="/dashboard/hr/trainees">
            <ArrowLeft className="h-4 w-4" />
            Назад к стажёрам
          </Link>
        </Button>
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Не удалось загрузить профиль стажёра
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Button asChild variant="ghost" className="gap-2">
          <Link to="/dashboard/hr/trainees">
            <ArrowLeft className="h-4 w-4" />
            Назад к стажёрам
          </Link>
        </Button>
        <Button asChild>
          <Link to={`/dashboard/hr/trainees/${trainee.userId}/plan`}>
            Редактировать план стажера
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {trainee.photoUrl ? (
              <img
                src={trainee.photoUrl}
                alt={trainee.fullName}
                className="h-32 w-32 rounded-full object-cover ring-4 ring-orange-50"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-orange-50 text-3xl font-bold text-primary ring-4 ring-orange-100">
                {initials(trainee.firstName, trainee.lastName)}
              </div>
            )}
            <h1 className="mt-5 text-2xl font-bold text-[#1A1A2E]">
              {trainee.lastName} {trainee.firstName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{trainee.team ?? 'Команда не указана'}</p>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Команда:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{trainee.team ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Почта:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{trainee.email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Телефон:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{trainee.phone ?? '—'}</span>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A2E]">Прогресс стажировки</h2>
                <p className="text-sm text-gray-500">Три блока и общий прогресс</p>
              </div>
              <div className="rounded-full bg-orange-50 px-4 py-2 text-lg font-bold text-primary">
                {trainee.totalProgress}%
              </div>
            </div>
            <div className="mt-6 space-y-5">
              {progressBlocks.map((block) => (
                <ProgressBar key={block.key} label={block.label} value={trainee[block.key]} />
              ))}
              <ProgressBar label="Общий прогресс" value={trainee.totalProgress} />
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1A1A2E]">Наставник</h2>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Имя:</span>{' '}
                  <span className="font-medium text-[#1A1A2E]">
                    {trainee.mentorFullName ?? 'Не назначен'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Телефон:</span>{' '}
                  <span className="font-medium text-[#1A1A2E]">
                    {trainee.mentorPhone ?? '—'}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1A1A2E]">Уровень настроения</h2>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    trainee.moodLevel >= 4 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-primary'
                  )}
                >
                  <Smile className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{trainee.moodLevel}/5</p>
                  <p className="text-sm text-gray-500">
                    {moodLabels[trainee.moodLevel] ?? 'Не указано'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
