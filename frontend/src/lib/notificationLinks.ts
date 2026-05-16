import type { NotificationType } from '@/types/notification'

/** Deep link for trainee notifications; HR types return null. */
export function traineeNotificationLink(type: NotificationType): string | null {
  switch (type) {
    case 'FEEDBACK_DUE':
      return '/dashboard/trainee/feedback'
    case 'TASK_DUE_SOON':
    case 'TASK_OVERDUE':
    case 'NEXT_STEP_REMINDER':
      return '/dashboard/trainee'
    default:
      return null
  }
}
