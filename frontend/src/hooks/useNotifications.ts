import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Notification, UnreadCount } from '@/types/notification'

export function useNotifications(limit = 20) {
  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: async () => {
      const { data } = await api.get<Notification[]>('/notifications', { params: { limit } })
      return data
    },
    refetchInterval: 30_000,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get<UnreadCount>('/notifications/unread-count')
      return data.count
    },
    refetchInterval: 30_000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
