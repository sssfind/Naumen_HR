import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { PagedTraineeEmployees, TraineeDashboard, TraineePlanTask } from '@/types/trainee'

function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }
  return fallback
}

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
      queryClient.invalidateQueries({ queryKey: ['hr', 'stats'] })
      toast.success('Задача взята в работу')
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Не удалось взять задачу в работу')),
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
      queryClient.invalidateQueries({ queryKey: ['hr', 'stats'] })
      toast.success('Задача отправлена на проверку или завершена')
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Не удалось завершить задачу')),
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
      queryClient.invalidateQueries({ queryKey: ['hr', 'stats'] })
      toast.success('Комментарий отправлен')
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Не удалось отправить комментарий')),
  })
}

export function useTraineeEmployees(search: string, departmentId: number | null, page: number) {
  return useQuery({
    queryKey: ['trainee', 'employees', search, departmentId, page],
    queryFn: async () => {
      const { data } = await api.get<PagedTraineeEmployees>('/trainee/employees', {
        params: {
          search: search || undefined,
          departmentId: departmentId ?? undefined,
          page,
          size: 12,
        },
      })
      return data
    },
  })
}
