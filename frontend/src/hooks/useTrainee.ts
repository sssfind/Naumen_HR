import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { PagedTraineeEmployees, TraineeDashboard, TraineePlanTask } from '@/types/trainee'

export function useTraineeDashboard() {
  return useQuery({
    queryKey: ['trainee', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<TraineeDashboard>('/trainee/dashboard')
      return data
    },
  })
}

export function useStartTraineeTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: number) => {
      const { data } = await api.post<TraineePlanTask>(`/trainee/tasks/${taskId}/start`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainee', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainees'] })
      toast.success('Задача взята в работу')
    },
    onError: () => toast.error('Не удалось взять задачу в работу'),
  })
}

export function useCompleteTraineeTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: number) => {
      const { data } = await api.post<TraineePlanTask>(`/trainee/tasks/${taskId}/complete`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainee', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainees'] })
      toast.success('Задача завершена')
    },
    onError: () => toast.error('Не удалось завершить задачу'),
  })
}

export function useAddTraineeTaskComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, text }: { taskId: number; text: string }) => {
      await api.post(`/trainee/tasks/${taskId}/comments`, { text })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainee', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainees'] })
      toast.success('Комментарий отправлен')
    },
    onError: () => toast.error('Не удалось отправить комментарий'),
  })
}

export function useTraineeEmployees(search: string, page: number) {
  return useQuery({
    queryKey: ['trainee', 'employees', search, page],
    queryFn: async () => {
      const { data } = await api.get<PagedTraineeEmployees>('/trainee/employees', {
        params: {
          search: search || undefined,
          page,
          size: 20,
        },
      })
      return data
    },
  })
}
