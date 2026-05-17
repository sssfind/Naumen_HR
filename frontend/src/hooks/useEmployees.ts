import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PagedDirectoryEmployees } from '@/types/employee'

export function useEmployees(search: string, departmentId: number | null, page: number) {
  return useQuery({
    queryKey: ['employees', search, departmentId, page],
    queryFn: async () => {
      const { data } = await api.get<PagedDirectoryEmployees>('/employees', {
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
