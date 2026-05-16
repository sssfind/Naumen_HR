export type UserRole = 'ROLE_EMPLOYEE' | 'ROLE_HR' | 'ROLE_TRAINEE'

export interface UserProfile {
  userId: number
  email: string
  fullName: string
  role: UserRole
  department: string | null
  phone: string | null
  position: string | null
}

export interface UpdateProfileRequest {
  fullName: string
  department?: string
  phone?: string
  position?: string
}

export interface Employee {
  userId: number
  email: string
  fullName: string
  role: UserRole
  department: string | null
  phone: string | null
  position: string | null
  hrId: number | null
  hrFullName: string | null
}

export interface TraineeProfile {
  userId: number
  firstName: string
  lastName: string
  fullName: string
  photoUrl: string | null
  team: string | null
  email: string
  phone: string | null
  progressBlockOne: number
  progressBlockTwo: number
  progressBlockThree: number
  totalProgress: number
  mentorFullName: string | null
  mentorPhone: string | null
  moodLevel: number
}

export interface PagedEmployees {
  content: Employee[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
