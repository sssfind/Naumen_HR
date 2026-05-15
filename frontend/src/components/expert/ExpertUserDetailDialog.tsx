import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Loader2, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExpertSearchCardData } from '@/components/cards/ExpertCard'
import { api } from '@/lib/api'
import { PEER_SKILL_MAX_TOTAL_STARS } from '@/lib/peerSkillStars'
import {
  STAR_TIER_LABELS,
  getStarProficiencyTier,
  starTierBadgeClasses,
  starTierRowClasses,
} from '@/lib/starProficiencyTier'
import { cn } from '@/lib/utils'
import type {
  ParticipationRole,
  ReadinessEventType,
  ResultLevel,
  UserMeCardEvent,
  UserMeCardResponse,
  UserMeCardRole,
  UserMeCardSkill,
} from '@/types/userMeCard'

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

function getRoleLabel(role: UserMeCardRole): string {
  return role === 'ROLE_HR' ? 'HR / L&D' : 'Сотрудник'
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ИИ'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
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

function SkillReadOnlyRow({ skill }: { skill: UserMeCardSkill }) {
  const stars = typeof skill.stars === 'number' ? skill.stars : 0
  const tier = getStarProficiencyTier(stars)
  return (
    <li
      className={`rounded-xl border px-3 py-2.5 transition-colors ${starTierRowClasses(tier)}`}
      title="Уровень по количеству звёзд: 0–5 базовый, 6–10 уверенный, 11–15 эксперт"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{skill.name}</p>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] ${starTierBadgeClasses(tier)}`}
        >
          {STAR_TIER_LABELS[tier]}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[#FF6720]">
        <Star className="h-4 w-4 fill-current" strokeWidth={0} aria-hidden />
        <span className="text-sm font-bold tabular-nums">
          {stars}
          <span className="text-xs font-semibold text-gray-500"> / {PEER_SKILL_MAX_TOTAL_STARS}</span>
        </span>
      </div>
    </li>
  )
}

function MockSkillRow({ name, stars }: { name: string; stars: number }) {
  const tier = getStarProficiencyTier(stars)
  return (
    <li
      className={`rounded-xl border px-3 py-2.5 ${starTierRowClasses(tier)}`}
      title="Уровень по количеству звёзд: 0–5 базовый, 6–10 уверенный, 11–15 эксперт"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm font-medium text-gray-900">{name}</p>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] ${starTierBadgeClasses(tier)}`}>
          {STAR_TIER_LABELS[tier]}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[#FF6720]">
        <Star className="h-4 w-4 fill-current" strokeWidth={0} aria-hidden />
        <span className="text-sm font-bold tabular-nums">{stars}</span>
      </div>
    </li>
  )
}

async function fetchUserCard(userId: number): Promise<UserMeCardResponse> {
  const { data } = await api.get<UserMeCardResponse>(`/users/by-id/${userId}/card`)
  return data
}

export interface ExpertUserDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Реальный пользователь из поиска */
  userId: number | null
  /** Демо-карточка: данные только с клиента */
  mockExpert: ExpertSearchCardData | null
}

export function ExpertUserDetailDialog({ open, onOpenChange, userId, mockExpert }: ExpertUserDetailDialogProps) {
  const isMock = Boolean(mockExpert?.isDemoMock)
  const effectiveUserId = !isMock && userId !== null && userId > 0 ? userId : null

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['userProfileCard', effectiveUserId],
    queryFn: () => fetchUserCard(effectiveUserId!),
    enabled: open && Boolean(effectiveUserId) && !isMock,
    staleTime: 30_000,
  })

  const showApiContent = !isMock && data
  const showMockContent = isMock && mockExpert

  return (
    <>
      <div
        role="presentation"
        className={cn(
          'fixed inset-0 z-[100] bg-black/45 transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="expert-detail-title"
        className={cn(
          'fixed z-[101] flex flex-col overflow-hidden border-2 border-[#FF6720] bg-[#FFFFFF] shadow-2xl transition-all duration-200',
          'max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:max-h-[min(92dvh,900px)] max-lg:w-full max-lg:translate-x-0 max-lg:rounded-b-none max-lg:rounded-t-3xl',
          'lg:left-1/2 lg:top-1/2 lg:max-h-[min(90vh,900px)] lg:w-[min(calc(100vw-2rem),32rem)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl',
          open
            ? 'max-lg:translate-y-0 opacity-100 lg:scale-100'
            : 'pointer-events-none opacity-0 max-lg:translate-y-full lg:scale-95',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#252525]/10 bg-gradient-to-r from-[#FF6720]/12 to-[#FFFFFF] px-3 py-3 sm:px-4">
          <div className="min-w-0">
            <h2 id="expert-detail-title" className="text-base font-bold text-[#252525]">
              Карточка эксперта
            </h2>
            <p className="text-xs text-gray-500">Все навыки, мероприятия и звёзды</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 touch-manipulation text-gray-500 hover:text-[#252525]"
            onClick={() => onOpenChange(false)}
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-6 sm:p-4">
          {!isMock && open && effectiveUserId && isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF6720]" />
              <p className="text-sm">Загрузка…</p>
            </div>
          )}

          {!isMock && isError && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="text-sm text-gray-700">
                Не удалось загрузить карточку
                {error instanceof Error ? `: ${error.message}` : ''}
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-[#FF6720]/40 text-[#252525] hover:bg-[#FF6720]/10"
                onClick={() => void refetch()}
              >
                Повторить
              </Button>
            </div>
          )}

          {showApiContent && (
            <div className="space-y-6">
              <section className="flex gap-3 rounded-xl border border-[#252525]/10 bg-[#252525]/5 p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#FF6720] bg-[#FF6720]/10 text-lg font-bold text-[#FF6720]">
                  {data.initials || getInitials(data.fullName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-[#252525]">{data.fullName}</p>
                  <p className="text-xs text-gray-600">{getRoleLabel(data.role)}</p>
                  {data.department ? (
                    <p className="mt-1 text-xs text-gray-500">{data.department}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">Отдел не указан</p>
                  )}
                  <a
                    href={`mailto:${data.email}`}
                    className="mt-1 block truncate text-xs font-medium text-[#FF6720] hover:underline"
                  >
                    {data.email}
                  </a>
                </div>
              </section>

              {data.readiness.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Готовность к форматам</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.readiness.map((k) => (
                      <span
                        key={k}
                        className="rounded-full border border-[#FF6720]/35 bg-[#FF6720]/10 px-3 py-1 text-xs font-medium text-[#252525]"
                      >
                        {READINESS_LABELS[k] ?? k}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Профессиональные навыки</h3>
                {data.professionalSkills.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет записей</p>
                ) : (
                  <ul className="space-y-2">
                    {data.professionalSkills.map((s) => (
                      <SkillReadOnlyRow key={s.userSkillId} skill={s} />
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Экспертные навыки</h3>
                {data.expertSkills.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет записей</p>
                ) : (
                  <ul className="space-y-2">
                    {data.expertSkills.map((s) => (
                      <SkillReadOnlyRow key={s.userSkillId} skill={s} />
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Мероприятия</h3>
                {data.events.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет записей о мероприятиях</p>
                ) : (
                  <ul className="space-y-2">
                    {data.events.map((ev) => (
                      <EventRow key={`${ev.title}-${ev.eventDate}-${ev.participationRole}`} row={ev} />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}

          {showMockContent && (
            <div className="space-y-6">
              <section className="flex gap-3 rounded-xl border border-[#252525]/10 bg-[#252525]/5 p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#FF6720] bg-[#FF6720]/10 text-lg font-bold text-[#FF6720]">
                  {getInitials(mockExpert.fullName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-[#252525]">{mockExpert.fullName}</p>
                  <p className="text-xs text-gray-600">Демо-профиль</p>
                  <p className="mt-1 text-xs text-gray-500">{mockExpert.department}</p>
                </div>
              </section>

              {mockExpert.readiness.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Готовность к форматам</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockExpert.readiness.map((k) => (
                      <span
                        key={k}
                        className="rounded-full border border-[#FF6720]/35 bg-[#FF6720]/10 px-3 py-1 text-xs font-medium text-[#252525]"
                      >
                        {(READINESS_LABELS as Record<string, string>)[k] ?? k}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Навыки (демо)</h3>
                <ul className="space-y-2">
                  {mockExpert.skills.map((s) => (
                    <MockSkillRow key={s.userSkillId} name={s.name} stars={s.stars} />
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Мероприятия (демо)</h3>
                {mockExpert.events.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет записей</p>
                ) : (
                  <ul className="space-y-2">
                    {mockExpert.events.map((title) => (
                      <li
                        key={title}
                        className="rounded-xl border border-[#252525]/10 bg-[#FFFFFF] px-3 py-2.5 text-sm text-gray-900 shadow-sm"
                      >
                        {title}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
