import type { AcceptanceCheckType, TaskPriority, TaskStatus } from '@/types/trainee'

export const priorityLabels: Record<TaskPriority, string> = {
  LOW: 'Низкий',
  MEDIUM: 'Средний',
  HIGH: 'Высокий',
}

export const acceptanceLabels: Record<AcceptanceCheckType, string> = {
  MACHINE: 'Проверяется машиной',
  USER: 'Проверяется пользователем',
}

export const statusLabels: Record<TaskStatus, string> = {
  NOT_STARTED: 'Не начата',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершена',
}

export const statusBadgeClass: Record<TaskStatus, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
}

export function formatDateTime(value: string | null) {
  if (!value) return null
  return new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
