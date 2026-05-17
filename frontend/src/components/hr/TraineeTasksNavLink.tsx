import { NavLink } from 'react-router-dom'
import { CheckSquare } from 'lucide-react'
import { usePendingReviewTasks } from '@/hooks/useTrainees'
import { cn } from '@/lib/utils'

export function TraineeTasksNavLink({ to }: { to: string }) {
  const { data: items = [] } = usePendingReviewTasks()
  const pendingCount = items.length
  const label =
    pendingCount > 0 ? `Задачи стажёров (${pendingCount})` : 'Задачи стажёров'

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-orange-50 text-primary'
            : 'text-gray-600 hover:bg-gray-50 hover:text-[#1A1A2E]'
        )
      }
    >
      <CheckSquare className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 leading-snug">{label}</span>
    </NavLink>
  )
}
