import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'

interface FilterItem {
  id: string
  label: string
}

interface FilterTabGroupProps {
  title: string
  icon: React.ReactNode
  items: FilterItem[]
  selectedItems: string[]
  onChange: (selected: string[]) => void
  isActive: boolean
  onToggle: () => void
  /**
   * `start` — панель к левому краю кнопки (вправо).
   * `end` — к правому краю кнопки (влево), чтобы не уезжать за экран справа.
   */
  panelSide?: 'start' | 'end'
}

export function FilterTabGroup({
  title,
  icon,
  items,
  selectedItems,
  onChange,
  isActive,
  onToggle,
  panelSide = 'start',
}: FilterTabGroupProps) {
  const [innerSearch, setInnerSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node) && isActive) {
        onToggle()
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [isActive, onToggle])

  useEffect(() => {
    if (!isActive) setInnerSearch('')
  }, [isActive])

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(innerSearch.toLowerCase())
  )

  function toggleItem(id: string) {
    if (selectedItems.includes(id)) {
      onChange(selectedItems.filter((s) => s !== id))
    } else {
      onChange([...selectedItems, id])
    }
  }

  const hasSelected = selectedItems.length > 0

  return (
    <div ref={ref} className="relative self-end">
      {/* Tab button */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={title}
        aria-expanded={isActive}
        className={[
          'relative flex min-h-11 min-w-11 touch-manipulation items-center justify-center gap-2 transition-all duration-200',
          isActive
            ? 'z-20 min-h-11 rounded-t-2xl bg-white px-4 py-2 text-gray-800 shadow-none'
            : [
                'z-10 mb-4 h-12 w-12 rounded-xl bg-white text-gray-500 shadow-sm hover:bg-gray-50',
                hasSelected ? 'border-2 border-[#FF6720]' : '',
              ].join(' '),
        ].join(' ')}
      >
        {icon}
        {isActive && (
          <span className="text-sm font-semibold whitespace-nowrap">{title}</span>
        )}
        {!isActive && hasSelected && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6720] text-[10px] font-bold text-[#FFFFFF]">
            {selectedItems.length}
          </span>
        )}
      </button>

      {/* Мобильные: нижний sheet в пределах экрана (над нижней навигацией). От sm: выпадашка под табом. */}
      {isActive && (
        <>
          <button
            type="button"
            aria-label="Закрыть фильтр"
            className="fixed inset-0 z-[55] bg-black/35 sm:hidden"
            onClick={onToggle}
          />
          <div
            className={[
              'overflow-y-auto bg-white p-4 shadow-xl',
              'fixed inset-x-0 z-[56] max-h-[min(72dvh,28rem)] rounded-t-2xl border-t border-gray-200 pb-[env(safe-area-inset-bottom)]',
              'bottom-[calc(4.5rem+env(safe-area-inset-bottom))]',
              'max-sm:shadow-[0_-8px_30px_rgba(0,0,0,0.12)]',
              'sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:z-10 sm:max-h-[min(70vh,24rem)] sm:rounded-t-none sm:border-t-0 sm:pb-4',
              'sm:w-max sm:min-w-[min(380px,calc(100vw-3rem))]',
              panelSide === 'end'
                ? 'sm:right-0 sm:left-auto sm:rounded-b-2xl sm:rounded-tl-2xl'
                : 'sm:left-0 sm:right-auto sm:rounded-b-2xl sm:rounded-tr-2xl',
            ].join(' ')}
          >
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={innerSearch}
              onChange={(e) => setInnerSearch(e.target.value)}
              placeholder="Поиск..."
              className="min-h-11 w-full rounded-full bg-gray-100 py-2 pl-9 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6720]/40"
            />
          </div>

          <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <span className="text-sm text-gray-400">Ничего не найдено</span>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItems.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={[
                      'min-h-9 touch-manipulation rounded-full px-3 py-2 text-sm transition-all duration-150',
                      isSelected
                        ? 'border border-[#FF6720] bg-[#FF6720]/10 text-[#FF6720]'
                        : 'cursor-pointer bg-gray-200 text-gray-700 hover:bg-gray-300',
                    ].join(' ')}
                  >
                    {item.label}
                  </button>
                )
              })
            )}
          </div>
        </div>
        </>
      )}
    </div>
  )
}
