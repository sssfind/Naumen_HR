export type PhaseStatus = 'UPCOMING' | 'CURRENT' | 'COMPLETED'

export interface AdaptationPathPhase {
  id: string
  title: string
  weekFrom: number
  weekTo: number
  progress: number
  status: PhaseStatus
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
}
