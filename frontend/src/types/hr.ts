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

export interface TraineeRiskAlert {
  traineeId: number
  fullName: string
  moodLevel: number
  feedbackWeekStart: string | null
  weekRating: string | null
  riskSummary: string
}

export interface TraineeFeedbackPending {
  traineeId: number
  fullName: string
  weekStart: string
}

export interface OverdueTaskItem {
  taskId: number
  description: string
  deadline: string
  daysOverdue: number
}

export interface TraineeOverdueTasks {
  traineeId: number
  fullName: string
  overdueCount: number
  tasks: OverdueTaskItem[]
}

export interface HrAdaptationDashboard extends HrTeamStats {
  currentWeekStart: string
  atRiskCount: number
  feedbackPendingCount: number
  traineesWithOverdueTasksCount: number
  atRisk: TraineeRiskAlert[]
  feedbackPending: TraineeFeedbackPending[]
  overdueByTrainee: TraineeOverdueTasks[]
}
