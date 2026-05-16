import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

/** On trainee layout mount: create due reminders and refresh notification list. */
export function useSyncTraineeReminders() {
  const queryClient = useQueryClient()
  const synced = useRef(false)

  useEffect(() => {
    if (synced.current) return
    synced.current = true
    api
      .post('/trainee/reminders/sync')
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      })
      .catch(() => {
        synced.current = false
      })
  }, [queryClient])
}
