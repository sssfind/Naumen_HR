export type TraineePlanBlockType = 'ONBOARDING' | 'SKILLS' | 'WORK'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type AcceptanceCheckType = 'MACHINE' | 'USER'

export interface TraineePlanTask {
  id: number
  block: TraineePlanBlockType
  blockId: string
  description: string
  deadline: string
  priority: TaskPriority
  acceptanceCriteria: string
  acceptanceCheckType: AcceptanceCheckType
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
}

export interface TraineeEmployee {
  userId: number
  email: string
  fullName: string
  role: string
  department: string | null
  phone: string | null
  position: string | null
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
