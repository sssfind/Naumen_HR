import { Users } from 'lucide-react'
import type { AchievementItem } from '@/components/profile/AchievementBadgeRow'
import {
  formatAchievementUnlockDate,
  resolveAchievementUnlockDate,
} from '@/components/profile/achievementUnlockDates'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface AchievementDetailDialogProps {
  item: AchievementItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: number
}

export function AchievementDetailDialog({
  item,
  open,
  onOpenChange,
  userId,
}: AchievementDetailDialogProps) {
  if (!item) return null

  const unlockIso =
    item.unlockedAt ??
    resolveAchievementUnlockDate(userId, item.id, item.earned)
  const unlockLabel = unlockIso ? formatAchievementUnlockDate(unlockIso) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(340px,calc(100vw-2rem))] overflow-visible border-0 bg-transparent p-0 shadow-none"
        onClose={() => onOpenChange(false)}
      >
        <article
          className="overflow-hidden rounded-2xl border-2 border-primary bg-white shadow-xl"
          aria-labelledby="achievement-detail-title"
        >
          <div className="relative flex min-h-[200px] items-center justify-center bg-gradient-to-b from-[#FFD9C4] via-[#FFE8D9] to-white px-6 pb-8 pt-8">
            <div className="relative flex h-[7.5rem] w-[7.5rem] items-center justify-center rounded-full border-2 border-primary bg-white/40 p-1.5 shadow-sm">
              <div className="h-full w-full overflow-hidden rounded-full bg-white">
                <img
                  src={item.imageSrc}
                  alt=""
                  className={cn(
                    'h-full w-full',
                    item.imageFit === 'contain' ? 'object-contain p-1.5' : 'object-cover',
                    !item.earned && 'grayscale opacity-55'
                  )}
                  draggable={false}
                />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-2 text-center">
            <h2
              id="achievement-detail-title"
              className="text-2xl font-bold leading-tight text-[#1A1A2E]"
            >
              {item.title}
            </h2>
            <p className="mt-2 text-base leading-snug text-[#1A1A2E]/90">
              {item.earned ? item.description : item.unlockHint}
            </p>

            <div className="mx-auto mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-[#F3F4F6] px-4 py-2 text-sm text-[#1A1A2E]">
              <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="leading-snug">
                Есть у{' '}
                <span className="font-semibold text-primary">{item.ownershipPercent}%</span> сотрудников
              </span>
            </div>

            <hr className="mx-auto mt-5 w-full max-w-[280px] border-t border-gray-200" />

            <p className="mt-4 text-sm text-gray-500">
              {item.earned ? (
                unlockLabel ? (
                  <>
                    Разблокировано{' '}
                    <span className="text-[#1A1A2E]/80">{unlockLabel}</span>
                  </>
                ) : (
                  'Разблокировано'
                )
              ) : (
                'Ещё не разблокировано'
              )}
            </p>
          </div>
        </article>
      </DialogContent>
    </Dialog>
  )
}
