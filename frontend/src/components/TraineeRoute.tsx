import { Navigate } from 'react-router-dom'
import type { StoredUser } from '@/types/auth'

export function TraineeRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />

  const stored = localStorage.getItem('user')
  const user: StoredUser | null = stored ? JSON.parse(stored) : null

  if (user?.role !== 'ROLE_TRAINEE') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
