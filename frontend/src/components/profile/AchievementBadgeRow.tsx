import { useState } from 'react'
import { cn } from '@/lib/utils'

export type AchievementItem = {
  id: string
  title: string
  description: string
  unlockHint: string
  imageSrc: string
  earned: boolean
}

interface AchievementBadgeRowProps {
  items: AchievementItem[]
  className?: string
}

const EXPANDED_WIDTH_RATIO = 2.75

export function AchievementBadgeRow({ items, className }: AchievementBadgeRowProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <div
      className={cn(
        'achievement-row relative grid grid-cols-3 gap-x-3 gap-y-4 overflow-visible',
        className
      )}
      role="list"
    >
      {items.map((item, index) => (
        <AchievementHoverBadge
          key={item.id}
          item={item}
          index={index}
          isActive={activeId === item.id}
          onActivate={() => setActiveId(item.id)}
          onDeactivate={() => setActiveId((current) => (current === item.id ? null : current))}
        />
      ))}
    </div>
  )
}

interface AchievementHoverBadgeProps {
  item: AchievementItem
  index: number
  isActive: boolean
  onActivate: () => void
  onDeactivate: () => void
}

function AchievementHoverBadge({
  item,
  index,
  isActive,
  onActivate,
  onDeactivate,
}: AchievementHoverBadgeProps) {
  const expandedWidth = `calc(var(--achievement-size) * ${EXPANDED_WIDTH_RATIO})`

  return (
    <div
      role="listitem"
      className="relative flex justify-center overflow-visible"
      style={{ height: 'var(--achievement-size)' }}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
    >
      <div
        className="relative"
        style={{
          width: 'var(--achievement-size)',
          height: 'var(--achievement-size)',
        }}
      >
        <div
          tabIndex={0}
          className={cn(
            'absolute left-0 top-0 flex items-center overflow-hidden',
            'border-2 transition-[width,box-shadow,border-color,background-color] duration-300 ease-out',
            'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            item.earned
              ? 'border-primary bg-[#FFF0E6]'
              : 'border-gray-300 bg-gray-100',
            isActive ? 'shadow-lg' : 'shadow-sm'
          )}
          style={{
            width: isActive ? expandedWidth : 'var(--achievement-size)',
            height: 'var(--achievement-size)',
            borderRadius: 'calc(var(--achievement-size) / 2)',
            zIndex: isActive ? 50 : 10 + index,
          }}
          onFocus={onActivate}
          onBlur={onDeactivate}
        >
          <div
            className="relative shrink-0 overflow-hidden rounded-full"
            style={{
              width: 'var(--achievement-size)',
              height: 'var(--achievement-size)',
            }}
            aria-hidden
          >
            <img
              src={item.imageSrc}
              alt=""
              className={cn(
                'h-full w-full object-cover',
                !item.earned && 'grayscale opacity-45'
              )}
              loading="lazy"
              draggable={false}
            />
          </div>

          <div
            className={cn(
              'min-w-0 flex-1 pr-4 transition-opacity duration-200 ease-out',
              isActive ? 'opacity-100 delay-100' : 'pointer-events-none opacity-0'
            )}
          >
            <p
              className={cn(
                'whitespace-nowrap text-sm font-bold leading-tight',
                item.earned ? 'text-[#1A1A2E]' : 'text-gray-500'
              )}
            >
              {item.earned ? item.title : 'Не получено'}
            </p>
            <p className="mt-0.5 max-w-[220px] text-xs leading-snug text-gray-500">
              {item.earned ? item.description : item.unlockHint}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
