import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { TraineePlan, TraineePlanTask, TraineePlanTaskRequest } from '@/types/trainee'
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

export function useTraineePlan(traineeId?: number) {
  return useQuery({
    queryKey: ['hr', 'trainees', traineeId, 'plan'],
    enabled: Boolean(traineeId),
    queryFn: async () => {
      const { data } = await api.get<TraineePlan>(`/hr/trainees/${traineeId}/plan`)
      return data
    },
  })
}

export function useCreateTraineePlanTask(traineeId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: TraineePlanTaskRequest) => {
      const { data } = await api.post<TraineePlanTask>(
        `/hr/trainees/${traineeId}/plan/tasks`,
        request
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainees', traineeId, 'plan'] })
      queryClient.invalidateQueries({ queryKey: ['trainee', 'dashboard'] })
      toast.success('Задача добавлена')
    },
    onError: () => toast.error('Не удалось добавить задачу'),
  })
}

export function useUpdateTraineePlanTask(traineeId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      taskId,
      request,
    }: {
      taskId: number
      request: TraineePlanTaskRequest
    }) => {
      const { data } = await api.put<TraineePlanTask>(
        `/hr/trainees/${traineeId}/plan/tasks/${taskId}`,
        request
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainees', traineeId, 'plan'] })
      queryClient.invalidateQueries({ queryKey: ['trainee', 'dashboard'] })
      toast.success('Задача обновлена')
    },
    onError: () => toast.error('Не удалось обновить задачу'),
  })
}

export function useDeleteTraineePlanTask(traineeId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: number) => {
      await api.delete(`/hr/trainees/${traineeId}/plan/tasks/${taskId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainees', traineeId, 'plan'] })
      queryClient.invalidateQueries({ queryKey: ['trainee', 'dashboard'] })
      toast.success('Задача удалена')
    },
    onError: () => toast.error('Не удалось удалить задачу'),
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
