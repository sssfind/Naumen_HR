import { X, LogIn, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PEER_SKILL_MAX_TOTAL_STARS } from '@/lib/peerSkillStars'

export interface ExpertSearchCardSkill {
  userSkillId: number
  name: string
  stars: number
  category?: string
  /** Текущий пользователь уже поставил звезду за эту запись навыка */
  viewerPeerStarGiven?: boolean
}

export interface ExpertSearchCardData {
  id: number
  fullName: string
  department: string
  skills: ExpertSearchCardSkill[]
  events: string[]
  readiness: string[]
  /** Нижние ~30% по числу навыков + мероприятий в текущем списке */
  newcomer?: boolean
  /** Полная активность с бэкенда (все навыки + все мероприятия), если есть */
  activityScore?: number
  /** Сумма звёзд по выбранным дисциплинам для текущего запроса */
  selectedSkillStars?: number
  /** Демо-карточка: userId совпадает с сидом БД, «+★» только локально */
  isDemoMock?: boolean
}

interface ExpertCardProps {
  expert: ExpertSearchCardData
  theme: 'light' | 'dark'
  onClose?: (id: number) => void
  onInvite?: (id: number) => void | Promise<void>
  isInviting?: boolean
  /** Текущий пользователь (из localStorage); скрывает кнопку «звезда» на своей карточке */
  viewerUserId?: number | null
  /** Ключ `${expertId}-${userSkillId}` пока идёт запрос */
  peerStarLoadingKey?: string | null
  onPeerStar?: (
    expertId: number,
    userSkillId: number,
    isDemoMock?: boolean
  ) => void | Promise<void>
  /** Клик по имени — подробная карточка пользователя */
  onProfileClick?: (expertId: number) => void
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  const lastName = parts[0] ?? ''
  const firstName = parts[1] ?? ''
  return `${lastName.charAt(0)}${firstName.charAt(0)}`.toUpperCase()
}

export function ExpertCard({
  expert,
  theme,
  onClose,
  onInvite,
  isInviting = false,
  viewerUserId,
  peerStarLoadingKey,
  onPeerStar,
  onProfileClick,
}: ExpertCardProps) {
  const isDark = theme === 'dark'

  const parts = expert.fullName.trim().split(/\s+/)
  const lastName = parts[0] ?? ''
  const restName = parts.slice(1).join(' ')

  const isSelf =
    typeof viewerUserId === 'number' && expert.id > 0 && expert.id === viewerUserId
  const canReceivePeerStar = Boolean(onPeerStar) && expert.id !== 0 && !isSelf

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-[#FF6720] p-6 ${
        isDark ? 'bg-[#252525] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#252525]'
      }`}
    >
      <div className="absolute right-2 top-2 flex items-center gap-2 sm:right-3 sm:top-3">
        {expert.newcomer ? (
          <span
            className={`shrink-0 rounded-lg border-2 border-[#FF6720] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              isDark ? 'bg-[#FF6720]/20 text-[#FF6720]' : 'bg-[#FF6720]/10 text-[#F95700]'
            }`}
          >
            Новичок
          </span>
        ) : null}
        <button
          type="button"
          className={`inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl transition-opacity hover:opacity-100 active:bg-black/5 ${
            isDark ? 'text-[#FFFFFF]/70 hover:text-[#FFFFFF]' : 'text-[#252525]/50 hover:text-[#252525]'
          }`}
          onClick={() => onClose?.(expert.id)}
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>
      </div>

      <button
        type="button"
        className={`absolute left-2 top-2 inline-flex min-h-11 max-w-[calc(100%-5.5rem)] touch-manipulation flex-wrap items-center gap-2 rounded-xl border-2 border-[#FF6720] px-3 py-2 text-left text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6720]/50 disabled:cursor-not-allowed disabled:opacity-60 sm:left-3 sm:top-3 sm:max-w-none ${
          isDark
            ? 'bg-[#252525] text-[#FFFFFF] hover:bg-[#2f2f2f]'
            : 'bg-[#FFFFFF] text-[#252525] hover:bg-[#FF6720]/8'
        }`}
        onClick={() => onInvite?.(expert.id)}
        disabled={isInviting || !onInvite}
        aria-label="Пригласить"
      >
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#FF6720] ${
            isDark ? 'bg-[#FF6720] text-[#FFFFFF]' : 'bg-[#FF6720] text-[#FFFFFF]'
          }`}
        >
          <LogIn size={18} />
        </span>
        <span>{isInviting ? 'Отправка...' : 'Пригласить'}</span>
      </button>

      <button
        type="button"
        className={`group mx-auto mb-3 mt-20 block w-full max-w-full rounded-2xl px-1 pb-2 pt-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6720]/50 disabled:cursor-default sm:mt-14 md:mt-6 ${
          onProfileClick
            ? isDark
              ? 'hover:bg-[#FFFFFF]/5'
              : 'hover:bg-[#FF6720]/6'
            : ''
        }`}
        onClick={() => onProfileClick?.(expert.id)}
        disabled={!onProfileClick}
        aria-label={onProfileClick ? 'Открыть подробную карточку' : undefined}
      >
        <div
          className={`mx-auto mb-3 flex h-20 w-20 select-none items-center justify-center rounded-full border-4 border-[#FF6720] text-2xl font-bold ${
            isDark ? 'bg-[#FFFFFF]/10 text-[#FF6720]' : 'bg-[#FF6720]/10 text-[#FF6720]'
          }`}
        >
          {getInitials(expert.fullName)}
        </div>

        <p
          className={`text-center text-2xl font-bold transition-colors ${
            onProfileClick ? 'group-hover:text-[#FF6720]' : ''
          } ${isDark ? 'text-[#FFFFFF]' : 'text-[#252525]'}`}
        >
          {lastName}
        </p>
        {restName && (
          <p
            className={`text-center text-base transition-colors ${
              onProfileClick ? 'group-hover:text-[#FF6720]/90' : ''
            }`}
          >
            {restName}
          </p>
        )}
      </button>
      <p className={`mt-1 text-center text-sm ${isDark ? 'text-[#FFFFFF]/65' : 'text-[#252525]/55'}`}>
        {expert.department}
      </p>

      {expert.skills.length > 0 && (
        <div className="mt-4">
          <p
            className={`mb-2 text-xs font-semibold uppercase tracking-wide ${
              isDark ? 'text-[#FFFFFF]/45' : 'text-[#252525]/45'
            }`}
          >
            Навыки:
          </p>
          <div className="flex flex-wrap gap-2">
            {expert.skills.map((skill) => {
              const loading = peerStarLoadingKey === `${expert.id}-${skill.userSkillId}`
              const showStarBtn = canReceivePeerStar && skill.userSkillId !== 0
              return (
                <span
                  key={`${skill.userSkillId}-${skill.name}`}
                  className={`inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                    isDark
                      ? 'border border-[#FFFFFF]/15 bg-[#FFFFFF]/5 text-[#FFFFFF]/90'
                      : 'border border-[#252525]/10 bg-[#252525]/[0.06] text-[#252525]'
                  }`}
                >
                  <span className="min-w-0 truncate">{skill.name}</span>
                  {skill.stars > 0 && (
                    <span
                      className={`inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium ${
                        isDark ? 'text-amber-300' : 'text-amber-600'
                      }`}
                      title={`Звёзд: ${skill.stars} из ${PEER_SKILL_MAX_TOTAL_STARS}`}
                    >
                      <Star className="h-3 w-3 fill-current" strokeWidth={0} />
                      {skill.stars}
                    </span>
                  )}
                  {showStarBtn ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={
                        loading ||
                        skill.stars >= PEER_SKILL_MAX_TOTAL_STARS ||
                        Boolean(skill.viewerPeerStarGiven)
                      }
                      title={
                        skill.viewerPeerStarGiven
                          ? 'Вы уже поставили звезду за этот навык'
                          : skill.stars >= PEER_SKILL_MAX_TOTAL_STARS
                            ? 'У навыка уже максимум звёзд'
                            : 'Поставить звезду коллеге за этот навык'
                      }
                      className={`min-h-10 min-w-10 shrink-0 px-2 py-1 text-[11px] font-semibold touch-manipulation ${
                        isDark
                          ? 'text-amber-300 hover:bg-gray-600/80 hover:text-amber-200'
                          : 'text-[#F95700] hover:bg-orange-50'
                      }`}
                      onClick={() => void onPeerStar?.(expert.id, skill.userSkillId, expert.isDemoMock)}
                    >
                      {loading ? '…' : '+★'}
                    </Button>
                  ) : null}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {expert.events.length > 0 && (
        <div className="mt-4">
          <p
            className={`mb-2 text-xs font-semibold uppercase tracking-wide ${
              isDark ? 'text-[#FFFFFF]/45' : 'text-[#252525]/45'
            }`}
          >
            Мероприятия:
          </p>
          <div className="flex flex-wrap gap-2">
            {expert.events.map((event) => (
              <span
                key={event}
                className={`rounded-full border bg-transparent px-3 py-1 text-xs ${
                  isDark ? 'border-[#FFFFFF]/25 text-[#FFFFFF]/85' : 'border-[#252525]/20 text-[#252525]/80'
                }`}
              >
                {event}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
