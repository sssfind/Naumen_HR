import type { AdaptationPath } from '@/types/adaptationPath'
import type { UserRole } from '@/types/user'

export type TraineePlanBlockType = 'ONBOARDING' | 'SKILLS' | 'WORK'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type AcceptanceCheckType = 'MACHINE' | 'USER'
export type TaskStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'COMPLETED'

export interface TraineePlanTaskComment {
  id: number
  authorFullName: string
  authorRole: string
  text: string
  createdAt: string
}

export interface TraineePlanTask {
  id: number
  block: TraineePlanBlockType
  blockId: string
  description: string
  deadline: string
  priority: TaskPriority
  acceptanceCriteria: string
  acceptanceCheckType: AcceptanceCheckType
  status: TaskStatus
  startedAt: string | null
  completedAt: string | null
  rejectionComment: string | null
  milestone: boolean
  comments: TraineePlanTaskComment[]
}

export interface TraineePlanTaskRequest {
  block: TraineePlanBlockType
  description: string
  deadline: string
  priority: TaskPriority
  acceptanceCriteria: string
  acceptanceCheckType: AcceptanceCheckType
}

export interface TraineePlanBlock {
  id: string
  title: string
  tasks: TraineePlanTask[]
}

export interface TraineePlan {
  blocks: TraineePlanBlock[]
}

export interface TaskProgressBlock {
  id: string
  title: string
  progress: number
  tasks: TraineePlanTask[]
}

export interface TraineeDashboard {
  taskBlocks: TaskProgressBlock[]
  totalProgress: number
  adaptationPath?: AdaptationPath | null
}

export interface TraineeEmployee {
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
  photoUrl: string | null
  team: string | null
  inMyTeam: boolean
}

export interface PagedTraineeEmployees {
  content: TraineeEmployee[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PendingReviewTask {
  traineeId: number
  traineeFullName: string
  traineeTeam: string | null
  task: TraineePlanTask
}
