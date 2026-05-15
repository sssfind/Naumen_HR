import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ClipboardList, PlusCircle, ShieldAlert, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useCreateHrEvent,
  useDeleteHrEvent,
  useHrEventDetails,
  useHrEvents,
  useSaveParticipantExperience,
} from '@/hooks/useHrEvents'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { HrEvent, HrEventParticipant, ParticipationRole, ResultLevel } from '@/types/hrEvents'

interface HrEventsViewProps {
  isHrMode: boolean
  onOpenSearch?: () => void
}

const PARTICIPATION_ROLE_LABELS: Record<ParticipationRole, string> = {
  SPEAKER: 'Спикер',
  MENTOR: 'Ментор',
  JURY: 'Жюри',
  PARTICIPANT: 'Участник',
  ORGANIZER: 'Организатор',
}

const RESULT_LEVEL_LABELS: Record<ResultLevel, string> = {
  NONE: 'Без результата',
  SHORTLIST: 'Шортлист',
  WINNER: 'Победитель',
}

const DEMO_PARTICIPANT_NAME_OVERRIDES: Record<number, string> = {
  43: 'Белкин Егор',
  44: 'Осипова Галина',
  45: 'Калинин Вадим',
  46: 'Уварова Алена',
  47: 'Грачев Олег',
  48: 'Кудрявцева София',
  49: 'Воронов Константин',
  50: 'Филатова Жанна',
}

function formatInvitationStatus(status?: string): string {
  switch (status) {
    case 'PENDING':
      return 'Приглашен'
    default:
      return status ?? 'Приглашен'
  }
}

function formatDate(value?: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    const message = response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

function getParticipantDisplayName(participant: Pick<HrEventParticipant, 'id' | 'fullName'>): string {
  return DEMO_PARTICIPANT_NAME_OVERRIDES[participant.id] ?? participant.fullName
}

function EventListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="h-4 w-2/3 rounded-full bg-gray-200" />
          <div className="mt-3 h-3 w-full rounded-full bg-gray-100" />
          <div className="mt-2 h-3 w-1/2 rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  )
}

function DeleteEventIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M9 3.75h6a1 1 0 0 1 1 1v1h3a.75.75 0 0 1 0 1.5h-.9l-.72 10.04A2.25 2.25 0 0 1 15.14 19.5H8.86a2.25 2.25 0 0 1-2.24-2.21L5.9 7.25H5a.75.75 0 0 1 0-1.5h3v-1a1 1 0 0 1 1-1Z"
        className="fill-current"
        opacity="0.14"
      />
      <path
        d="M9 5.75v-1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M4.75 7.25h14.5M9.75 10.25v5.5M14.25 10.25v5.5M7.4 7.25l.72 10.04a1.5 1.5 0 0 0 1.5 1.36h4.76a1.5 1.5 0 0 0 1.5-1.36l.72-10.04"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ParticipantProfileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 3.75a4.25 4.25 0 1 1 0 8.5 4.25 4.25 0 0 1 0-8.5Zm0 10.75c4.62 0 8.37 2.36 8.37 5.25 0 .28-.22.5-.5.5H4.13a.5.5 0 0 1-.5-.5c0-2.89 3.75-5.25 8.37-5.25Z"
        className="fill-current"
        opacity="0.14"
      />
      <path
        d="M12 4.25a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm0 10.75c4.22 0 7.72 2.02 7.85 4.57H4.15C4.28 17.02 7.78 15 12 15Zm5.25-7.5v3.25m0 0V14m0-3.25H14m3.25 0h3.25"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface ParticipantListProps {
  event: HrEvent
  onManageExperience: (participant: HrEventParticipant) => void
  savingParticipantId?: number | null
}

function ParticipantList({ event, onManageExperience, savingParticipantId }: ParticipantListProps) {
  if (event.participants.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-6 text-sm text-gray-600">
        Пока никто не приглашен. Выберите экспертов в поиске, чтобы наполнить событие участниками.
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {event.participants.map((participant) => (
        <div
          key={participant.id}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#252525]">{getParticipantDisplayName(participant)}</p>
              <p className="mt-1 text-sm text-gray-500">{participant.department}</p>
              {participant.email ? (
                <p className="mt-1 text-xs font-medium text-[#F95700]">{participant.email}</p>
              ) : null}
              {participant.profileEventSaved ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    Добавлено в профиль
                  </span>
                  {participant.participationRole ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-[#252525]">
                      {PARTICIPATION_ROLE_LABELS[participant.participationRole]}
                    </span>
                  ) : null}
                  {participant.resultLevel ? (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-[#F95700]">
                      {RESULT_LEVEL_LABELS[participant.resultLevel]}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:items-end">
              {participant.status ? (
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-[#F95700]">
                  {formatInvitationStatus(participant.status)}
                </span>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={savingParticipantId === participant.id}
                onClick={() => onManageExperience(participant)}
                className="min-h-11 w-full touch-manipulation rounded-xl border-[#FF6720]/25 text-[#252525] hover:bg-orange-50 sm:w-auto"
              >
                <ParticipantProfileIcon className="h-4 w-4 text-[#F95700]" />
                {savingParticipantId === participant.id
                  ? 'Сохраняем...'
                  : participant.profileEventSaved
                    ? 'Изменить запись'
                    : 'Добавить в профиль'}
              </Button>
            </div>
          </div>
          {participant.feedback ? (
            <p className="mt-3 line-clamp-2 text-sm text-gray-500">Отзыв: {participant.feedback}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function HrEventsView({ isHrMode, onOpenSearch }: HrEventsViewProps) {
  const eventsQuery = useHrEvents(isHrMode)
  const createEventMutation = useCreateHrEvent()
  const deleteEventMutation = useDeleteHrEvent()
  const saveParticipantExperienceMutation = useSaveParticipantExperience()

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [experienceDialogParticipant, setExperienceDialogParticipant] = useState<HrEventParticipant | null>(null)
  const [participationRole, setParticipationRole] = useState<ParticipationRole>('PARTICIPANT')
  const [resultLevel, setResultLevel] = useState<ResultLevel>('NONE')
  const [feedback, setFeedback] = useState('')

  const events = eventsQuery.data ?? []

  useEffect(() => {
    if (!events.length) {
      setSelectedEventId(null)
      return
    }

    const selectedStillExists = events.some((event) => event.id === selectedEventId)
    if (!selectedStillExists) {
      setSelectedEventId(events[0].id)
    }
  }, [events, selectedEventId])

  const selectedEventFromList = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  )

  const eventDetailsQuery = useHrEventDetails(selectedEventId, isHrMode && selectedEventId !== null)
  const selectedEvent = eventDetailsQuery.data ?? selectedEventFromList

  useEffect(() => {
    if (!experienceDialogParticipant) return
    setParticipationRole(experienceDialogParticipant.participationRole ?? 'PARTICIPANT')
    setResultLevel(experienceDialogParticipant.resultLevel ?? 'NONE')
    setFeedback(experienceDialogParticipant.feedback ?? '')
  }, [experienceDialogParticipant])

  async function handleCreateEvent() {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      toast.error('Укажите название события')
      return
    }

    try {
      const createdEvent = await createEventMutation.mutateAsync({
        title: trimmedTitle,
        description: trimmedDescription,
      })

      toast.success('Событие создано')
      setTitle('')
      setDescription('')
      if (createdEvent?.id) {
        setSelectedEventId(createdEvent.id)
      }
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Не удалось создать событие'))
    }
  }

  function requestDeleteEvent() {
    if (!selectedEvent) return
    setDeleteConfirmOpen(true)
  }

  async function handleDeleteEvent() {
    if (!selectedEvent) return
    try {
      await deleteEventMutation.mutateAsync(selectedEvent.id)
      setSelectedEventId(null)
      setDeleteConfirmOpen(false)
      toast.success('Событие удалено')
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Не удалось удалить событие'))
    }
  }

  function openParticipantExperienceDialog(participant: HrEventParticipant) {
    setExperienceDialogParticipant(participant)
  }

  function closeParticipantExperienceDialog() {
    if (saveParticipantExperienceMutation.isPending) return
    setExperienceDialogParticipant(null)
    setParticipationRole('PARTICIPANT')
    setResultLevel('NONE')
    setFeedback('')
  }

  async function handleSaveParticipantExperience() {
    if (!selectedEvent || !experienceDialogParticipant) return

    try {
      await saveParticipantExperienceMutation.mutateAsync({
        eventId: selectedEvent.id,
        userId: experienceDialogParticipant.id,
        participationRole,
        resultLevel,
        feedback,
      })
      toast.success(
        experienceDialogParticipant.profileEventSaved
          ? 'Запись об участии обновлена'
          : 'Участие добавлено в профиль'
      )
      closeParticipantExperienceDialog()
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Не удалось сохранить участие в профиле'))
    }
  }

  if (!isHrMode) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F5F5F5] p-6">
        <div className="w-full max-w-xl rounded-[28px] border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#F95700]">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-[#252525]">Раздел событий доступен HR</h2>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Здесь HR-специалисты создают мероприятия и собирают в них приглашенных экспертов.
          </p>
          {onOpenSearch ? (
            <Button
              type="button"
              onClick={onOpenSearch}
              className="mt-6 rounded-xl bg-[#FF6720] text-white hover:bg-[#FF6720]/90"
            >
              Перейти к поиску экспертов
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full overflow-x-hidden bg-[#F5F5F5] p-4 sm:p-6">
      {experienceDialogParticipant && selectedEvent ? (
        <div
          className="fixed inset-0 z-[121] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={closeParticipantExperienceDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="participant-experience-title"
            className="w-full max-w-2xl rounded-[28px] border border-gray-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FF6720]/12 text-[#F95700]">
                <ParticipantProfileIcon className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#F95700]">Профиль участника</p>
                <h2 id="participant-experience-title" className="mt-1 text-xl font-semibold text-[#252525]">
                  Участие в мероприятии
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Добавьте в профиль сотрудника информацию об участии и отзыв HR.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 rounded-[24px] bg-[#252525] p-5 text-white md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">Участник</p>
                <p className="mt-2 text-base font-semibold">
                  {getParticipantDisplayName(experienceDialogParticipant)}
                </p>
                <p className="mt-1 text-sm text-white/70">{experienceDialogParticipant.department}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">Событие</p>
                <p className="mt-2 text-base font-semibold">{selectedEvent.title}</p>
                <p className="mt-1 text-sm text-white/70">
                  {selectedEvent.eventType ?? 'Тип не указан'} · {formatDate(selectedEvent.eventDate) ?? 'Дата не указана'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#252525]">Роль участия</Label>
                <Select
                  value={participationRole}
                  onValueChange={(value) => setParticipationRole(value as ParticipationRole)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white text-[#252525] focus:ring-[#FF6720]/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PARTICIPATION_ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#252525]">Результат</Label>
                <Select
                  value={resultLevel}
                  onValueChange={(value) => setResultLevel(value as ResultLevel)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white text-[#252525] focus:ring-[#FF6720]/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RESULT_LEVEL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="participant-feedback" className="text-sm font-medium text-[#252525]">
                Отзыв HR
              </Label>
              <textarea
                id="participant-feedback"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                rows={6}
                placeholder="Например: уверенно выступал, хорошо отвечал на вопросы, рекомендован для следующих мероприятий."
                className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#252525] outline-none transition focus:border-[#FF6720] focus:ring-2 focus:ring-[#FF6720]/30"
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={saveParticipantExperienceMutation.isPending}
                className="rounded-xl border-gray-300 text-[#252525] hover:bg-gray-50"
                onClick={closeParticipantExperienceDialog}
              >
                Отмена
              </Button>
              <Button
                type="button"
                disabled={saveParticipantExperienceMutation.isPending}
                className="rounded-xl bg-[#FF6720] text-white hover:bg-[#FF6720]/90"
                onClick={() => void handleSaveParticipantExperience()}
              >
                <ParticipantProfileIcon className="mr-2 h-4 w-4" />
                {saveParticipantExperienceMutation.isPending ? 'Сохраняем...' : 'Сохранить в профиль'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteConfirmOpen && selectedEvent ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => {
            if (!deleteEventMutation.isPending) {
              setDeleteConfirmOpen(false)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
            className="w-full max-w-md rounded-[28px] border border-gray-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FF6720]/12 text-[#F95700]">
                <DeleteEventIcon className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#F95700]">Подтверждение удаления</p>
                <h2 id="delete-event-title" className="mt-1 text-xl font-semibold text-[#252525]">
                  Удалить событие?
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Событие <span className="font-medium text-[#252525]">"{selectedEvent.title}"</span> будет
                  удалено вместе со списком приглашенных участников.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-sm text-gray-600">
              Это действие нельзя отменить.
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={deleteEventMutation.isPending}
                className="rounded-xl border-gray-300 text-[#252525] hover:bg-gray-50"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Отмена
              </Button>
              <Button
                type="button"
                disabled={deleteEventMutation.isPending}
                className="rounded-xl bg-[#FF6720] text-white hover:bg-[#FF6720]/90"
                onClick={() => void handleDeleteEvent()}
              >
                <DeleteEventIcon className="mr-2 h-4 w-4" />
                {deleteEventMutation.isPending ? 'Удаляем...' : 'Подтвердить удаление'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#F95700]">HR Events</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#252525]">
                События и приглашенные эксперты
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                Создавайте события, выбирайте нужное и отслеживайте, кто уже приглашен из поиска экспертов.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-[#252525]">
                <p className="text-xs uppercase tracking-wide text-gray-500">Событий</p>
                <p className="mt-1 text-2xl font-semibold text-[#F95700]">{events.length}</p>
              </div>
              <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#252525]">
                <p className="text-xs uppercase tracking-wide text-gray-500">Приглашений</p>
                <p className="mt-1 text-2xl font-semibold">
                  {events.reduce((sum, event) => sum + event.participantsCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#F95700]">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#252525]">Новое событие</h2>
                  <p className="text-sm text-gray-500">Минимум данных, чтобы сразу начать приглашать.</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hr-event-title" className="text-sm font-medium text-[#252525]">
                    Название
                  </Label>
                  <Input
                    id="hr-event-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Например, День карьеры Naumen"
                    disabled={createEventMutation.isPending}
                    className="h-11 rounded-xl border-gray-200 focus-visible:border-[#FF6720] focus-visible:ring-[#FF6720]/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hr-event-description" className="text-sm font-medium text-[#252525]">
                    Описание
                  </Label>
                  <textarea
                    id="hr-event-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Кратко опишите цель события и кого вы хотите пригласить."
                    disabled={createEventMutation.isPending}
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#252525] outline-none transition focus:border-[#FF6720] focus:ring-2 focus:ring-[#FF6720]/30"
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => void handleCreateEvent()}
                  disabled={createEventMutation.isPending}
                  className="h-11 w-full rounded-xl bg-[#FF6720] text-white hover:bg-[#FF6720]/90"
                >
                  {createEventMutation.isPending ? 'Создаем...' : 'Создать событие'}
                </Button>
              </div>
            </section>

            <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-[#252525]">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#252525]">Созданные события</h2>
                  <p className="text-sm text-gray-500">Выберите событие, чтобы посмотреть детали и приглашенных.</p>
                </div>
              </div>

              <div className="mt-5">
                {eventsQuery.isLoading ? (
                  <EventListSkeleton />
                ) : eventsQuery.isError ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    Не удалось загрузить события.
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => void eventsQuery.refetch()}
                      className="ml-1 h-auto p-0 text-red-700"
                    >
                      Повторить
                    </Button>
                  </div>
                ) : events.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-5 text-sm text-gray-600">
                    Пока нет ни одного события. Создайте первое событие, и его можно будет сразу выбрать в приглашении.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => {
                      const isSelected = selectedEventId === event.id
                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => setSelectedEventId(event.id)}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? 'border-[#FF6720] bg-orange-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#252525]">{event.title}</p>
                              <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                                {event.description || 'Описание пока не добавлено'}
                              </p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#F95700]">
                              {event.participantsCount}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
            {!selectedEvent ? (
              <div className="flex h-full min-h-[440px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                  <CalendarDays className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-[#252525]">Выберите событие</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Здесь появятся описание и список приглашенных участников выбранного события.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[24px] bg-[#252525] p-6 text-white lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="text-sm font-medium text-orange-300">Выбранное событие</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight">{selectedEvent.title}</h2>
                    <p className="mt-4 text-sm leading-6 text-white/75">
                      {selectedEvent.description || 'Описание события пока не заполнено.'}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-white/60">Приглашено</p>
                      <p className="mt-1 text-2xl font-semibold">{selectedEvent.participantsCount}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-white/60">Создано</p>
                      <p className="mt-1 text-sm font-medium">
                        {formatDate(selectedEvent.createdAt) ?? 'Недавно'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={requestDeleteEvent}
                    disabled={deleteEventMutation.isPending}
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <DeleteEventIcon className="mr-2 h-4 w-4" />
                    {deleteEventMutation.isPending ? 'Удаляем...' : 'Удалить событие'}
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#252525]">
                      <Users className="h-4 w-4 text-[#F95700]" />
                      Участники
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-[#252525]">
                      {selectedEvent.participantsCount}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Приглашены через поиск экспертов</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#252525]">
                      <CalendarDays className="h-4 w-4 text-[#F95700]" />
                      Тип
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#252525]">
                      {selectedEvent.eventType ?? 'Не указан'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#252525]">
                      <ClipboardList className="h-4 w-4 text-[#F95700]" />
                      Дата
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#252525]">
                      {formatDate(selectedEvent.eventDate) ?? 'Не указана'}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-[#252525]">Приглашенные участники</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Список обновляется после приглашения экспертов из поиска.
                      </p>
                    </div>
                    {eventDetailsQuery.isFetching ? (
                      <span className="text-sm text-gray-400">Обновляем...</span>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <ParticipantList
                      event={selectedEvent}
                      onManageExperience={openParticipantExperienceDialog}
                      savingParticipantId={
                        saveParticipantExperienceMutation.isPending ? experienceDialogParticipant?.id ?? null : null
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
