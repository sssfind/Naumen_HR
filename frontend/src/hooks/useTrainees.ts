import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Employee, TraineeProfile } from '@/types/user'

export function useMyTrainees() {
  return useQuery({
    queryKey: ['hr', 'trainees'],
    queryFn: async () => {
      const { data } = await api.get<Employee[]>('/hr/trainees')
      return data
    },
  })
}

export function useTraineeProfile(traineeId?: number) {
  return useQuery({
    queryKey: ['hr', 'trainees', traineeId],
    enabled: Boolean(traineeId),
    queryFn: async () => {
      const { data } = await api.get<TraineeProfile>(`/hr/trainees/${traineeId}`)
      return data
    },
  })
}

export function useAssignTrainee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (traineeId: number) => {
      const { data } = await api.post<Employee>(`/hr/trainees/${traineeId}/assign`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainees'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Стажёр назначен')
    },
    onError: () => toast.error('Не удалось назначить стажёра'),
  })
}

export function useUnassignTrainee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (traineeId: number) => {
      const { data } = await api.post<Employee>(`/hr/trainees/${traineeId}/unassign`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainees'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Стажёр снят')
    },
    onError: () => toast.error('Не удалось снять стажёра'),
  })
}
