import type { UserRole } from '@/types/user'

export interface DirectoryEmployee {
  userId: number
  email: string
  fullName: string
  role: UserRole
  departmentId: number | null
  department: string | null
  parentDepartmentName: string | null
  divisionName: string | null
  responsibilityZone: string | null
  phone: string | null
  position: string | null
  photoUrl?: string | null
  team: string | null
  inMyTeam?: boolean
  hrId?: number | null
  hrFullName?: string | null
  mentorId?: number | null
  mentorFullName?: string | null
  totalProgress?: number
  moodLevel?: number
}

export interface PagedDirectoryEmployees {
  content: DirectoryEmployee[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
