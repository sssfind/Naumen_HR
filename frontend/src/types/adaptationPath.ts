export type PhaseStatus = 'UPCOMING' | 'CURRENT' | 'COMPLETED'

export interface AdaptationPathPhase {
  id: string
  title: string
  weekFrom: number
  weekTo: number
  progress: number
  status: PhaseStatus
}

export type TaskSliceStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export interface AdaptationPathWeekSlice {
  taskId: number
  blockId: string
  blockTitle: string
  status: TaskSliceStatus
  overdue: boolean
}

export interface AdaptationPathWeek {
  weekNumber: number
  slices: AdaptationPathWeekSlice[]
}

export interface AdaptationPathMilestone {
  taskId: number
  title: string
  blockId: string
  blockTitle: string
  weekNumber: number
  deadline: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  overdue: boolean
}

export interface AdaptationPath {
  startDate: string
  endDate: string
  totalWeeks: number
  currentWeek: number
  currentPhaseId: string
  phases: AdaptationPathPhase[]
  milestones: AdaptationPathMilestone[]
  weeks: AdaptationPathWeek[]
}
