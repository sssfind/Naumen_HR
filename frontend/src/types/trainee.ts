export interface TaskProgressBlock {
  id: string
  title: string
  progress: number
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
