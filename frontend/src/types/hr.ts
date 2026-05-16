export interface TraineeTaskProgressItem {
  traineeId: number
  fullName: string
  totalTasks: number
  completedTasks: number
  completionPercent: number
}

export interface HrTeamStats {
  traineeCount: number
  averageMoodLevel: number | null
  averageTaskCompletionPercent: number
  traineeProgress: TraineeTaskProgressItem[]
}
