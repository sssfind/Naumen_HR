import type { UserRole } from '@/types/user'

export type StaffDashboard = {
  basePath: '/dashboard/hr' | '/dashboard/mentor'
  role: UserRole | undefined
  isHr: boolean
  isMentor: boolean
  canEditPlans: boolean
  canManageTrainees: boolean
}

export function useStaffDashboard(): StaffDashboard {
  const stored = localStorage.getItem('user')
  const user = stored ? (JSON.parse(stored) as { role?: UserRole }) : null
  const role = user?.role
  const isHr = role === 'ROLE_HR'
  const isMentor = role === 'ROLE_MENTOR'

  return {
    basePath: isMentor ? '/dashboard/mentor' : '/dashboard/hr',
    role,
    isHr,
    isMentor,
    canEditPlans: isHr || isMentor,
    canManageTrainees: isHr,
  }
}
