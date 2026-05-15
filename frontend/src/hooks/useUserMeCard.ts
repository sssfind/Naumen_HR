import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { UserMeCardResponse } from '@/types/userMeCard'

async function fetchUserMeCard(): Promise<UserMeCardResponse> {
  const { data } = await api.get<UserMeCardResponse>('/users/me/card')
  return data
}

export function useUserMeCard(enabled: boolean) {
  return useQuery({
    queryKey: ['userMeCard'],
    queryFn: fetchUserMeCard,
    enabled,
    staleTime: 60_000,
  })
}
