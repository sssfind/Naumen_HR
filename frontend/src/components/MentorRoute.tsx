import { Navigate } from 'react-router-dom'

export function MentorRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  const stored = localStorage.getItem('user')
  const user = stored ? JSON.parse(stored) : null

  if (!token) return <Navigate to="/" replace />
  if (user?.role !== 'ROLE_MENTOR') return <Navigate to="/" replace />

  return <>{children}</>
}
