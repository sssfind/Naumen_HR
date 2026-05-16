import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { FeedbackResponse, FeedbackStatus, SubmitFeedbackRequest } from '@/types/feedback'

export function useFeedbackStatus() {
  return useQuery({
    queryKey: ['trainee', 'feedback', 'status'],
    queryFn: async () => {
      const { data } = await api.get<FeedbackStatus>('/trainee/feedback/status')
      return data
    },
  })
}

export function useFeedbackHistory(limit = 8) {
  return useQuery({
    queryKey: ['trainee', 'feedback', 'history', limit],
    queryFn: async () => {
      const { data } = await api.get<FeedbackResponse[]>('/trainee/feedback', {
        params: { limit },
      })
      return data
    },
  })
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: SubmitFeedbackRequest) => {
      const { data } = await api.post<FeedbackResponse>('/trainee/feedback', request)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainee', 'feedback'] })
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainees'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Спасибо! Опрос сохранён')
    },
    onError: (error: { response?: { status?: number; data?: { message?: string } } }) => {
      const message =
        error.response?.status === 409
          ? 'Опрос за эту неделю уже отправлен'
          : error.response?.data?.message ?? 'Не удалось отправить опрос'
      toast.error(message)
    },
  })
}

export function useTraineeFeedback(traineeId?: number, limit = 12) {
  return useQuery({
    queryKey: ['hr', 'trainees', traineeId, 'feedback', limit],
    enabled: Boolean(traineeId),
    queryFn: async () => {
      const { data } = await api.get<FeedbackResponse[]>(
        `/hr/trainees/${traineeId}/feedback`,
        { params: { limit } }
      )
      return data
    },
  })
}
