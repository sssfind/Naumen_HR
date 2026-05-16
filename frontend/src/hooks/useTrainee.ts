import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PagedTraineeEmployees, TraineeDashboard } from '@/types/trainee'

export function useTraineeDashboard() {
  return useQuery({
    queryKey: ['trainee', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<TraineeDashboard>('/trainee/dashboard')
      return data
    },
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
