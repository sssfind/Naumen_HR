import type { LucideIcon } from 'lucide-react'
import { CalendarDays, Search, Sparkles } from 'lucide-react'

export type AppNavView = 'search' | 'ai' | 'events'

export const APP_NAV_ITEMS: { id: AppNavView; icon: LucideIcon; label: string }[] = [
  { id: 'search', icon: Search, label: 'Поиск' },
  { id: 'ai', icon: Sparkles, label: 'Умный поиск' },
  { id: 'events', icon: CalendarDays, label: 'События' },
]
