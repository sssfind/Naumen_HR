export type NotificationType =
  | 'TRAINEE_ASSIGNED'
  | 'TRAINEE_UNASSIGNED'
  | 'PROFILE_UPDATED'
  | 'FEEDBACK_SUBMITTED'
  | 'FEEDBACK_RISK'
  | 'TASK_STARTED'
  | 'TASK_COMPLETED'
  | 'TASK_COMMENT'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE'
  | 'FEEDBACK_DUE'
  | 'NEXT_STEP_REMINDER'
  | 'SYSTEM'

export interface Notification {
  id: number
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
}

export interface UnreadCount {
  count: number
}
