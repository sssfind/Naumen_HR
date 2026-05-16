export type NotificationType =
  | 'TRAINEE_ASSIGNED'
  | 'TRAINEE_UNASSIGNED'
  | 'PROFILE_UPDATED'
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
