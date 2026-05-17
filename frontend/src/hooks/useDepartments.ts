import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DepartmentTreeNode } from '@/types/department'

export function useDepartmentTree() {
  return useQuery({
    queryKey: ['departments', 'tree'],
    queryFn: async () => {
      const { data } = await api.get<DepartmentTreeNode[]>('/departments/tree')
      return data
    },
  })
}
