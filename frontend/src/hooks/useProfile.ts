import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { UpdateProfileRequest, UserProfile } from '@/types/user'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<UserProfile>('/users/me')
      return data
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateProfileRequest) => {
      const { data } = await api.patch<UserProfile>('/users/me', body)
      return data
    },
    onSuccess: (data) => {
      const stored = localStorage.getItem('user')
      if (stored) {
        const user = JSON.parse(stored)
        localStorage.setItem('user', JSON.stringify({ ...user, fullName: data.fullName }))
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Профиль сохранён')
    },
    onError: () => toast.error('Не удалось сохранить профиль'),
  })
}
