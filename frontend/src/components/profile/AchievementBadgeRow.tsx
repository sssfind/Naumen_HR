import { useEffect, useState } from 'react'
import { AchievementDetailDialog } from '@/components/profile/AchievementDetailDialog'
import { preloadImages } from '@/lib/imageCache'
import { cn } from '@/lib/utils'

export type AchievementItem = {
  id: string
  title: string
  description: string
  unlockHint: string
  imageSrc: string
  earned: boolean
  /** Доля сотрудников с этим достижением (для карточки) */
  ownershipPercent: number
  /** ISO-дата разблокировки с бэкенда (если есть) */
  unlockedAt?: string
  /** contain — для иконок с полями/чёрным фоном (например «Чемпион») */
  imageFit?: 'cover' | 'contain'
}

interface AchievementBadgeRowProps {
  items: AchievementItem[]
  className?: string
  userId?: number
}

export function AchievementBadgeRow({ items, className, userId }: AchievementBadgeRowProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dialogItem, setDialogItem] = useState<AchievementItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const activeItem = items.find((item) => item.id === activeId) ?? null

  useEffect(() => {
    preloadImages(items.map((item) => item.imageSrc))
  }, [items])

  return (
    <div className={cn('achievement-row', className)}>
      <div
        className="achievement-badges-grid"
        role="list"
        onMouseLeave={() => setActiveId(null)}
      >
        {items.map((item) => {
          const isActive = activeId === item.id

          return (
            <button
              key={item.id}
              type="button"
              role="listitem"
              className={cn(
                'achievement-badge relative mx-auto w-full max-w-full overflow-hidden rounded-full border-2 transition-all duration-200',
                'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                item.earned
                  ? 'border-primary bg-[#FFF0E6] hover:shadow-md'
                  : 'border-gray-300 bg-gray-100',
                isActive && 'scale-105 shadow-md ring-2 ring-primary/30'
              )}
              onClick={() => {
                setDialogItem(item)
                setDialogOpen(true)
              }}
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
              onBlur={() => setActiveId((current) => (current === item.id ? null : current))}
              aria-label={item.earned ? item.title : `Не получено: ${item.title}`}
            >
              <img
                src={item.imageSrc}
                alt=""
                className={cn(
                  'h-full w-full',
                  item.imageFit === 'contain' ? 'object-contain p-2' : 'object-cover',
                  !item.earned && 'grayscale opacity-45'
                )}
                loading="eager"
                decoding="async"
                draggable={false}
              />
            </button>
          )
        })}
      </div>

      <div
        className={cn(
          'mt-3 min-h-[3.25rem] rounded-xl border px-3 py-2.5 text-center text-sm transition-opacity duration-200',
          activeItem
            ? 'border-gray-200 bg-gray-50 opacity-100'
            : 'pointer-events-none border-transparent bg-transparent opacity-0'
        )}
        aria-live="polite"
      >
        {activeItem ? (
          <>
            <p
              className={cn(
                'font-semibold leading-tight',
                activeItem.earned ? 'text-[#1A1A2E]' : 'text-gray-500'
              )}
            >
              {activeItem.earned ? activeItem.title : 'Не получено'}
            </p>
            <p className="mt-1 text-xs leading-snug text-gray-500">
              {activeItem.earned ? activeItem.description : activeItem.unlockHint}
            </p>
          </>
        ) : (
          <span className="sr-only">Описание ачивки</span>
        )}
      </div>

      <AchievementDetailDialog
        item={dialogItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={userId}
      />
    </div>
  )
}
