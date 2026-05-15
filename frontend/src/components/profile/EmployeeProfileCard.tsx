import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Loader2, LogOut, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useUserMeCard } from '@/hooks/useUserMeCard'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  STAR_TIER_LABELS,
  getStarProficiencyTier,
  starTierBadgeClasses,
  starTierRowClasses,
} from '@/lib/starProficiencyTier'
import type {
  ParticipationRole,
  ProficiencyLevel,
  ReadinessEventType,
  ResultLevel,
  UserMeCardEvent,
  UserMeCardResponse,
  UserMeCardSkill,
} from '@/types/userMeCard'

interface EmployeeProfileCardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogout?: () => void
}

const PROFICIENCY_LABELS: Record<ProficiencyLevel, string> = {
  BASIC: 'Базовый',
  CONFIDENT: 'Уверенный',
  EXPERT: 'Эксперт',
}

const READINESS_LABELS: Record<ReadinessEventType, string> = {
  MENTORSHIP: 'Менторство',
  PUBLIC_SPEAKING: 'Публичные выступления',
  JURY_WORK: 'Работа в жюри',
  WORKSHOP_FACILITATION: 'Воркшопы',
  LECTURE_DELIVERY: 'Лекции',
  HACKATHON_PARTICIPATION: 'Хакатоны',
  EVENT_ORGANIZATION: 'Организация мероприятий',
}

const PARTICIPATION_LABELS: Record<ParticipationRole, string> = {
  SPEAKER: 'Спикер',
  MENTOR: 'Ментор',
  JURY: 'Жюри',
  PARTICIPANT: 'Участник',
  ORGANIZER: 'Организатор',
}

const RESULT_LABELS: Record<ResultLevel, string> = {
  NONE: 'Без результата',
  SHORTLIST: 'Шортлист',
  WINNER: 'Победитель',
}

function getRoleLabel(role: 'ROLE_EMPLOYEE' | 'ROLE_HR'): string {
  return role === 'ROLE_HR' ? 'HR / L&D' : 'Сотрудник'
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ИИ'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function StarRow({ stars }: { stars: number }) {
  const safe = Math.max(0, Math.min(5, Math.round(stars)))
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Оценка ${safe} из 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn('h-3.5 w-3.5', i < safe ? 'fill-[#FF6720] text-[#FF6720]' : 'text-gray-200')}
          strokeWidth={1.2}
        />
      ))}
    </span>
  )
}

type SkillDictionaryItem = { id: number; name: string }

type SkillDraft = {
  proficiencyLevel: ProficiencyLevel
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    const message = response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

function formatEventDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function EventRow({ row }: { row: UserMeCardEvent }) {
  const reviewHint = row.feedback?.trim() || 'Отзыв не заполнен'
  return (
    <li
      className="rounded-xl border border-[#252525]/10 bg-[#FFFFFF] px-3 py-2.5 text-sm shadow-sm"
      title={reviewHint}
    >
      <p className="font-medium text-gray-900">{row.title}</p>
      <p className="mt-0.5 text-xs text-gray-500">
        {formatEventDate(row.eventDate)}
        {row.eventType ? ` · ${row.eventType}` : ''}
      </p>
      <p className="mt-1 text-xs text-gray-600">
        <span className="font-medium text-gray-700">{PARTICIPATION_LABELS[row.participationRole]}</span>
        {' · '}
        <span>{RESULT_LABELS[row.resultLevel]}</span>
      </p>
      {row.feedback ? (
        <p className="mt-1 line-clamp-2 text-xs italic text-gray-500" title={row.feedback}>
          «{row.feedback}»
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-400">Отзыв по мероприятию не указан</p>
      )}
    </li>
  )
}

function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-5">
      <div className="flex gap-3">
        <div className="h-14 w-14 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full max-w-[12rem] rounded bg-gray-200" />
          <div className="h-3 w-full max-w-[8rem] rounded bg-gray-200" />
        </div>
      </div>
      <div className="h-20 rounded-xl bg-gray-100" />
      <div className="h-24 rounded-xl bg-gray-100" />
      <div className="h-32 rounded-xl bg-gray-100" />
    </div>
  )
}

function buildDrafts(skills: UserMeCardSkill[]): Record<number, SkillDraft> {
  return Object.fromEntries(
    skills.map((s) => [s.userSkillId, { proficiencyLevel: s.proficiencyLevel }]),
  )
}

function SkillsEditor({
  title,
  skills,
  editMode,
  drafts,
  onDraftChange,
  onRequestConfirm,
  onSave,
  onDelete,
  isBusy,
  addSkillId,
  onAddSkillIdChange,
  availableSkillsToAdd,
  onAddSkill,
}: {
  title: string
  skills: UserMeCardSkill[]
  editMode: boolean
  drafts: Record<number, SkillDraft>
  onDraftChange: (userSkillId: number, patch: Partial<SkillDraft>) => void
  onRequestConfirm: (skill: UserMeCardSkill) => void
  onSave: (skill: UserMeCardSkill) => void
  onDelete: (skill: UserMeCardSkill) => void
  isBusy: boolean
  addSkillId: string
  onAddSkillIdChange: (skillId: string) => void
  availableSkillsToAdd: SkillDictionaryItem[]
  onAddSkill: () => void
}) {
  if (skills.length === 0 && !editMode) {
    return (
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h3>
        <p className="text-sm text-gray-500">Нет навыков в этой категории</p>
      </section>
    )
  }

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h3>

      {skills.length === 0 && editMode ? (
        <p className="text-sm text-gray-500">Пока пусто — добавьте навык ниже</p>
      ) : null}

      <ul className="space-y-2">
        {skills.map((s) => {
          const draft = drafts[s.userSkillId] ?? {
            proficiencyLevel: s.proficiencyLevel,
          }
          const starTier = getStarProficiencyTier(s.stars)

          return (
            <li
              key={s.userSkillId}
              className={cn(
                'rounded-xl border px-3 py-2.5 transition-colors hover:border-[#FF6720]/35 hover:bg-[#FF6720]/6',
                editMode
                  ? 'border-[#252525]/10 bg-[#252525]/5'
                  : starTierRowClasses(starTier),
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{s.name}</p>

                  {!editMode ? (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StarRow stars={s.stars} />
                      <span
                        className={cn(
                          'rounded-md px-2 py-0.5 text-[11px]',
                          starTierBadgeClasses(starTier),
                        )}
                        title="Уровень по звёздам: 0–5 базовый, 6–10 уверенный, 11–15 эксперт"
                      >
                        {STAR_TIER_LABELS[starTier]}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-[11px] text-gray-500">
                        Звёзды ставят коллеги в поиске экспертов; здесь можно изменить только уровень владения.
                      </p>
                      <label className="mt-2 block">
                        <span className="text-[11px] font-medium text-gray-500">Уровень</span>
                        <select
                          value={draft.proficiencyLevel}
                          disabled={isBusy}
                          onChange={(e) =>
                            onDraftChange(s.userSkillId, {
                              proficiencyLevel: e.target.value as ProficiencyLevel,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-[#252525]/12 bg-white px-2 py-1 text-sm text-[#252525] outline-none focus:ring-2 focus:ring-[#FF6720]/40"
                        >
                          <option value="BASIC">{PROFICIENCY_LABELS.BASIC}</option>
                          <option value="CONFIDENT">{PROFICIENCY_LABELS.CONFIDENT}</option>
                          <option value="EXPERT">{PROFICIENCY_LABELS.EXPERT}</option>
                        </select>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {!editMode ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      title="Запросить подтверждение навыка"
                      className="max-w-[7.5rem] whitespace-normal border-[#FF6720]/40 px-2 text-center text-[11px] leading-tight text-[#FF6720] hover:bg-[#FF6720]/10"
                      onClick={() => onRequestConfirm(s)}
                    >
                      Запросить подтверждение
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="bg-[#FF6720] text-[#FFFFFF] hover:bg-[#EA580C]"
                        disabled={isBusy}
                        onClick={() => onSave(s)}
                      >
                        Сохранить
                      </Button>
                      <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={() => onDelete(s)}>
                        Удалить
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {editMode ? (
        <div className="rounded-xl border border-dashed border-[#FF6720]/40 bg-[#FF6720]/8 p-3">
          <p className="text-xs font-semibold text-gray-700">Добавить навык</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={addSkillId}
              disabled={isBusy || availableSkillsToAdd.length === 0}
              onChange={(e) => onAddSkillIdChange(e.target.value)}
              className="w-full rounded-lg border border-[#252525]/12 bg-white px-2 py-2 text-sm text-[#252525] outline-none focus:ring-2 focus:ring-[#FF6720]/40 sm:flex-1"
            >
              <option value="">
                {availableSkillsToAdd.length === 0 ? 'Нет доступных навыков' : 'Выберите навык…'}
              </option>
              {availableSkillsToAdd.map((opt) => (
                <option key={opt.id} value={String(opt.id)}>
                  {opt.name}
                </option>
              ))}
            </select>
            <Button type="button" className="sm:w-40" disabled={isBusy || !addSkillId} onClick={onAddSkill}>
              Добавить
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function ReadinessEditor({
  title,
  readinessKeys,
  editMode,
  isBusy,
  onRequestConfirm,
  onSave,
  onDelete,
  addReadinessKey,
  onAddReadinessKeyChange,
  availableToAdd,
  onAdd,
  getLabel,
}: {
  title: string
  readinessKeys: ReadinessEventType[]
  editMode: boolean
  isBusy: boolean
  onRequestConfirm: (key: ReadinessEventType) => void
  onSave: (key: ReadinessEventType) => void
  onDelete: (key: ReadinessEventType) => void
  addReadinessKey: string
  onAddReadinessKeyChange: (key: string) => void
  availableToAdd: { key: string; label: string }[]
  onAdd: () => void
  getLabel: (key: ReadinessEventType) => string
}) {
  if (readinessKeys.length === 0 && !editMode) {
    return (
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h3>
        <p className="text-sm text-gray-500">Не указано</p>
      </section>
    )
  }

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h3>

      {readinessKeys.length === 0 && editMode ? (
        <p className="text-sm text-gray-500">Пока пусто — добавьте формат ниже</p>
      ) : null}

      <ul className="space-y-2">
        {readinessKeys.map((r) => (
          <li
            key={r}
            className="rounded-xl border border-[#252525]/10 bg-[#252525]/5 px-3 py-2.5 transition-colors hover:border-[#FF6720]/35 hover:bg-[#FF6720]/6"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{getLabel(r)}</p>

                {!editMode ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-100">
                      Готовность к формату
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-gray-500">
                    Нажмите «Сохранить», чтобы зафиксировать формат в профиле на сервере, или «Удалить», чтобы убрать
                    его.
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                {!editMode ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    title="Запросить подтверждение готовности"
                    className="max-w-[7.5rem] whitespace-normal border-[#FF6720]/40 px-2 text-center text-[11px] leading-tight text-[#FF6720] hover:bg-[#FF6720]/10"
                    onClick={() => onRequestConfirm(r)}
                  >
                    Запросить подтверждение
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[#FF6720] text-[#FFFFFF] hover:bg-[#EA580C]"
                      disabled={isBusy}
                      onClick={() => onSave(r)}
                    >
                      Сохранить
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={() => onDelete(r)}>
                      Удалить
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editMode ? (
        <div className="rounded-xl border border-dashed border-[#FF6720]/40 bg-[#FF6720]/8 p-3">
          <p className="text-xs font-semibold text-gray-700">Добавить формат</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={addReadinessKey}
              disabled={isBusy || availableToAdd.length === 0}
              onChange={(e) => onAddReadinessKeyChange(e.target.value)}
              className="w-full rounded-lg border border-[#252525]/12 bg-white px-2 py-2 text-sm text-[#252525] outline-none focus:ring-2 focus:ring-[#FF6720]/40 sm:flex-1"
            >
              <option value="">
                {availableToAdd.length === 0 ? 'Нет доступных форматов' : 'Выберите формат…'}
              </option>
              {availableToAdd.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button type="button" className="sm:w-40" disabled={isBusy || !addReadinessKey} onClick={onAdd}>
              Добавить
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export function EmployeeProfileCard({ open, onOpenChange, onLogout }: EmployeeProfileCardProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error, refetch, isFetching } = useUserMeCard(open)

  const [skillsEdit, setSkillsEdit] = useState(false)
  const [drafts, setDrafts] = useState<Record<number, SkillDraft>>({})
  const [addProfessionalSkillId, setAddProfessionalSkillId] = useState('')
  const [addExpertSkillId, setAddExpertSkillId] = useState('')
  const [addReadinessKey, setAddReadinessKey] = useState('')

  useEffect(() => {
    if (!open) {
      setSkillsEdit(false)
      setDrafts({})
      setAddProfessionalSkillId('')
      setAddExpertSkillId('')
      setAddReadinessKey('')
    }
  }, [open])

  useEffect(() => {
    if (!data || skillsEdit) return
    const nextDrafts = {
      ...buildDrafts(data.professionalSkills),
      ...buildDrafts(data.expertSkills),
    }
    setDrafts(nextDrafts)
  }, [data, skillsEdit])

  const hardSkillsQuery = useQuery({
    queryKey: ['dictionaries', 'hard-skills'],
    queryFn: async () => {
      const res = await api.get<SkillDictionaryItem[]>('/dictionaries/hard-skills')
      return res.data
    },
    enabled: open && skillsEdit,
    staleTime: 5 * 60_000,
  })

  const expertSkillsQuery = useQuery({
    queryKey: ['dictionaries', 'expert-skills'],
    queryFn: async () => {
      const res = await api.get<SkillDictionaryItem[]>('/dictionaries/expert-skills')
      return res.data
    },
    enabled: open && skillsEdit,
    staleTime: 5 * 60_000,
  })

  const readinessDictionaryQuery = useQuery({
    queryKey: ['dictionaries', 'readiness-statuses'],
    queryFn: async () => {
      const res = await api.get<{ key: string; label: string }[]>('/dictionaries/readiness-statuses')
      return res.data
    },
    enabled: open && skillsEdit,
    staleTime: 5 * 60_000,
  })

  const upsertSkillMutation = useMutation({
    mutationFn: async (payload: { skillId: number; proficiencyLevel: ProficiencyLevel }) => {
      const res = await api.post<UserMeCardResponse>('/me/skills', payload)
      return res.data
    },
    onSuccess: (card) => {
      queryClient.setQueryData(['userMeCard'], card)
      setDrafts({
        ...buildDrafts(card.professionalSkills),
        ...buildDrafts(card.expertSkills),
      })
    },
  })

  const updateSkillMutation = useMutation({
    mutationFn: async (payload: { userSkillId: number; proficiencyLevel: ProficiencyLevel }) => {
      const res = await api.put<UserMeCardResponse>(`/me/skills/${payload.userSkillId}`, {
        proficiencyLevel: payload.proficiencyLevel,
      })
      return res.data
    },
    onSuccess: (card) => {
      queryClient.setQueryData(['userMeCard'], card)
      setDrafts({
        ...buildDrafts(card.professionalSkills),
        ...buildDrafts(card.expertSkills),
      })
    },
  })

  const deleteSkillMutation = useMutation({
    mutationFn: async (userSkillId: number) => {
      await api.delete(`/me/skills/${userSkillId}`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userMeCard'] })
    },
  })

  const addReadinessMutation = useMutation({
    mutationFn: async (readinessEventType: ReadinessEventType) => {
      const res = await api.post<UserMeCardResponse>('/me/readiness', { readinessEventType })
      return res.data
    },
    onSuccess: (card) => {
      queryClient.setQueryData(['userMeCard'], card)
    },
  })

  const deleteReadinessMutation = useMutation({
    mutationFn: async (readinessEventType: ReadinessEventType) => {
      await api.delete(`/me/readiness/${readinessEventType}`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userMeCard'] })
    },
  })

  const skillsMutationPending =
    upsertSkillMutation.isPending || updateSkillMutation.isPending || deleteSkillMutation.isPending

  const readinessMutationPending =
    addReadinessMutation.isPending || deleteReadinessMutation.isPending

  const profileEditPending = skillsMutationPending || readinessMutationPending

  const ownedSkillIds = useMemo(() => {
    if (!data) return new Set<number>()
    return new Set<number>([
      ...data.professionalSkills.map((s) => s.id),
      ...data.expertSkills.map((s) => s.id),
    ])
  }, [data])

  const availableProfessionalToAdd = useMemo(() => {
    const dict = hardSkillsQuery.data ?? []
    return dict.filter((s) => !ownedSkillIds.has(s.id))
  }, [hardSkillsQuery.data, ownedSkillIds])

  const availableExpertToAdd = useMemo(() => {
    const dict = expertSkillsQuery.data ?? []
    return dict.filter((s) => !ownedSkillIds.has(s.id))
  }, [expertSkillsQuery.data, ownedSkillIds])

  const ownedReadinessKeys = useMemo(() => {
    if (!data) return new Set<string>()
    return new Set(data.readiness)
  }, [data])

  const availableReadinessToAdd = useMemo(() => {
    const dict = readinessDictionaryQuery.data ?? []
    return dict.filter((row) => !ownedReadinessKeys.has(row.key))
  }, [readinessDictionaryQuery.data, ownedReadinessKeys])

  useEffect(() => {
    if (!open || !skillsEdit) return
    if (addProfessionalSkillId && !availableProfessionalToAdd.some((s) => String(s.id) === addProfessionalSkillId)) {
      setAddProfessionalSkillId('')
    }
    if (addExpertSkillId && !availableExpertToAdd.some((s) => String(s.id) === addExpertSkillId)) {
      setAddExpertSkillId('')
    }
    if (addReadinessKey && !availableReadinessToAdd.some((r) => r.key === addReadinessKey)) {
      setAddReadinessKey('')
    }
  }, [
    open,
    skillsEdit,
    addProfessionalSkillId,
    addExpertSkillId,
    addReadinessKey,
    availableProfessionalToAdd,
    availableExpertToAdd,
    availableReadinessToAdd,
  ])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const handleConfirmSkill = (skill: UserMeCardSkill) => {
    toast.success(`Запрос на подтверждение навыка «${skill.name}» отправлен`)
  }

  const handleConfirmReadiness = (key: ReadinessEventType) => {
    const label = READINESS_LABELS[key] ?? key
    toast.success(`Запрос на подтверждение готовности «${label}» отправлен`)
  }

  const handleDraftChange = (userSkillId: number, patch: Partial<SkillDraft>) => {
    setDrafts((prev) => {
      const current = prev[userSkillId]
      if (!current) return prev
      return { ...prev, [userSkillId]: { ...current, ...patch } }
    })
  }

  const handleSaveSkill = async (skill: UserMeCardSkill) => {
    const draft = drafts[skill.userSkillId]
    if (!draft) return
    try {
      await updateSkillMutation.mutateAsync({
        userSkillId: skill.userSkillId,
        proficiencyLevel: draft.proficiencyLevel,
      })
      toast.success(`Навык «${skill.name}» обновлён`)
    } catch (e) {
      toast.error(extractApiErrorMessage(e, 'Не удалось обновить навык'))
    }
  }

  const handleDeleteSkill = async (skill: UserMeCardSkill) => {
    const ok = window.confirm(`Удалить навык «${skill.name}» из профиля?`)
    if (!ok) return
    try {
      await deleteSkillMutation.mutateAsync(skill.userSkillId)
      toast.success(`Навык «${skill.name}» удалён`)
    } catch (e) {
      toast.error(extractApiErrorMessage(e, 'Не удалось удалить навык'))
    }
  }

  const handleAddSkill = async (category: 'PROFESSIONAL' | 'EXPERT') => {
    const selectedId = category === 'PROFESSIONAL' ? addProfessionalSkillId : addExpertSkillId
    if (!selectedId) {
      toast.error('Выберите навык из списка')
      return
    }

    try {
      await upsertSkillMutation.mutateAsync({
        skillId: Number(selectedId),
        proficiencyLevel: 'CONFIDENT',
      })
      toast.success('Навык добавлен')
      if (category === 'PROFESSIONAL') setAddProfessionalSkillId('')
      else setAddExpertSkillId('')
    } catch (e) {
      toast.error(extractApiErrorMessage(e, 'Не удалось добавить навык'))
    }
  }

  const handleAddReadiness = async () => {
    if (!addReadinessKey) {
      toast.error('Выберите формат из списка')
      return
    }
    try {
      await addReadinessMutation.mutateAsync(addReadinessKey as ReadinessEventType)
      toast.success('Готовность добавлена')
      setAddReadinessKey('')
    } catch (e) {
      toast.error(extractApiErrorMessage(e, 'Не удалось добавить готовность'))
    }
  }

  const handleSaveReadiness = async (readinessEventType: ReadinessEventType) => {
    const label = READINESS_LABELS[readinessEventType] ?? readinessEventType
    try {
      await addReadinessMutation.mutateAsync(readinessEventType)
      toast.success(`Формат «${label}» сохранён`)
    } catch (e) {
      toast.error(extractApiErrorMessage(e, 'Не удалось сохранить формат'))
    }
  }

  const handleDeleteReadiness = async (readinessEventType: ReadinessEventType) => {
    const label = READINESS_LABELS[readinessEventType] ?? readinessEventType
    const ok = window.confirm(`Убрать из профиля «${label}»?`)
    if (!ok) return
    try {
      await deleteReadinessMutation.mutateAsync(readinessEventType)
      toast.success('Готовность удалена')
    } catch (e) {
      toast.error(extractApiErrorMessage(e, 'Не удалось удалить готовность'))
    }
  }

  return (
    <>
      <div
        role="presentation"
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-[100] bg-black/25 backdrop-blur-[1px] transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => onOpenChange(false)}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-profile-card-title"
        className={cn(
          'fixed z-[101] flex flex-col overflow-hidden rounded-2xl border border-[#252525]/12 bg-[#FFFFFF] shadow-2xl shadow-[#252525]/10 transition-all duration-300 ease-out',
          'bottom-3 left-3 w-[min(calc(100vw-1.5rem),28rem)] max-h-[min(88vh,calc(100dvh-4.5rem))]',
          'sm:left-[5.25rem]',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-2 border-b border-[#252525]/10 bg-gradient-to-r from-[#FF6720]/12 to-[#FFFFFF] px-4 py-3">
          <div className="min-w-0">
            <h2 id="employee-profile-card-title" className="text-base font-bold text-gray-900">
              Моя карточка
            </h2>
            <p className="text-xs text-gray-500">Профиль и экспертиза</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-gray-500 hover:text-gray-900"
            onClick={() => onOpenChange(false)}
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {isLoading && <CardSkeleton />}

          {isError && (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" aria-hidden />
              <p className="text-sm text-gray-700">
                Не удалось загрузить карточку
                {error instanceof Error && error.message ? `: ${error.message}` : ''}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                Повторить
              </Button>
            </div>
          )}

          {!isLoading && !isError && data && (
            <div className="space-y-6 p-4 pb-6">
              {isFetching && !isLoading && (
                <div className="flex items-center justify-end gap-2 text-xs text-gray-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Обновление…
                </div>
              )}

              <section className="flex gap-3 rounded-xl border border-[#252525]/10 bg-[#252525]/5 p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF6720] text-sm font-bold text-[#FFFFFF]">
                  {data.initials || getInitials(data.fullName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{data.fullName}</p>
                  <p className="text-xs text-gray-600">{getRoleLabel(data.role)}</p>
                  {data.department ? (
                    <p className="mt-0.5 truncate text-xs text-gray-500">{data.department}</p>
                  ) : (
                    <p className="mt-0.5 text-xs text-gray-400">Отдел не указан</p>
                  )}
                  <a
                    href={`mailto:${data.email}`}
                    className="mt-1 block truncate text-xs font-medium text-[#FF6720] hover:underline"
                  >
                    {data.email}
                  </a>
                </div>
              </section>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Навыки</h3>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant={skillsEdit ? 'default' : 'outline'}
                    size="sm"
                    className={skillsEdit ? 'bg-[#FF6720] text-[#FFFFFF] hover:bg-[#EA580C]' : ''}
                    disabled={profileEditPending}
                    onClick={() => setSkillsEdit((v) => !v)}
                  >
                    {skillsEdit ? 'Закончить редактирование' : 'Редактировать навыки'}
                  </Button>
                </div>
              </div>

              {(hardSkillsQuery.isError || expertSkillsQuery.isError || readinessDictionaryQuery.isError) &&
              skillsEdit ? (
                <p className="text-xs text-red-600">
                  Не удалось загрузить справочник. Проверьте соединение и попробуйте снова.
                </p>
              ) : null}

              <SkillsEditor
                title="Профессиональные навыки"
                skills={data.professionalSkills}
                editMode={skillsEdit}
                drafts={drafts}
                onDraftChange={handleDraftChange}
                onRequestConfirm={handleConfirmSkill}
                onSave={handleSaveSkill}
                onDelete={handleDeleteSkill}
                isBusy={profileEditPending}
                addSkillId={addProfessionalSkillId}
                onAddSkillIdChange={setAddProfessionalSkillId}
                availableSkillsToAdd={availableProfessionalToAdd}
                onAddSkill={() => void handleAddSkill('PROFESSIONAL')}
              />

              <SkillsEditor
                title="Экспертные навыки"
                skills={data.expertSkills}
                editMode={skillsEdit}
                drafts={drafts}
                onDraftChange={handleDraftChange}
                onRequestConfirm={handleConfirmSkill}
                onSave={handleSaveSkill}
                onDelete={handleDeleteSkill}
                isBusy={profileEditPending}
                addSkillId={addExpertSkillId}
                onAddSkillIdChange={setAddExpertSkillId}
                availableSkillsToAdd={availableExpertToAdd}
                onAddSkill={() => void handleAddSkill('EXPERT')}
              />

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Опыт и мероприятия
                </h3>
                {data.events.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет записей о мероприятиях</p>
                ) : (
                  <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {data.events.map((ev) => (
                      <EventRow key={`${ev.title}-${ev.eventDate}-${ev.participationRole}`} row={ev} />
                    ))}
                  </ul>
                )}
              </section>

              <ReadinessEditor
                title="Готовность к форматам"
                readinessKeys={data.readiness}
                editMode={skillsEdit}
                isBusy={profileEditPending}
                onRequestConfirm={handleConfirmReadiness}
                onSave={(r) => void handleSaveReadiness(r)}
                onDelete={(r) => void handleDeleteReadiness(r)}
                addReadinessKey={addReadinessKey}
                onAddReadinessKeyChange={setAddReadinessKey}
                availableToAdd={availableReadinessToAdd}
                onAdd={() => void handleAddReadiness()}
                getLabel={(k) => READINESS_LABELS[k] ?? k}
              />

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Похожие люди</h3>
                {data.similarPeople.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет подходящих коллег для подборки</p>
                ) : (
                  <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5">
                    {data.similarPeople.map((p) => (
                      <div
                        key={p.id}
                        className="min-w-[9.5rem] shrink-0 rounded-xl border border-[#252525]/10 bg-[#FFFFFF] px-3 py-2 shadow-sm transition hover:border-[#FF6720]/45 hover:shadow-md"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                            {getInitials(p.fullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-gray-900">{p.fullName}</p>
                            <p className="truncate text-[11px] text-gray-500">{p.department ?? '—'}</p>
                            {p.topSkills.length > 0 && (
                              <p className="truncate text-[11px] text-gray-400">{p.topSkills.join(', ')}</p>
                            )}
                            <p className="text-[10px] text-[#FF6720]">Совпадений: {p.overlapCount}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="flex justify-end border-t border-gray-100 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500"
                  onClick={async () => {
                    try {
                      await refetch()
                      toast.success('Данные обновлены')
                    } catch (e) {
                      toast.error(extractApiErrorMessage(e, 'Не удалось обновить данные'))
                    }
                  }}
                >
                  Обновить данные
                </Button>
              </div>
            </div>
          )}
        </div>

        {onLogout && (
          <footer className="shrink-0 border-t border-[#252525]/10 bg-[#FFFFFF] p-3">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Выйти из аккаунта
            </Button>
          </footer>
        )}
      </aside>
    </>
  )
}
