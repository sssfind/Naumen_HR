import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PagedEmployees } from '@/types/user'

export function useEmployees(search: string, department: string, page: number) {
  return useQuery({
    queryKey: ['employees', search, department, page],
    queryFn: async () => {
      const { data } = await api.get<PagedEmployees>('/employees', {
        params: {
          search: search || undefined,
          department: department || undefined,
          page,
          size: 20,
        },
      })
      return data
    },
  })
}
