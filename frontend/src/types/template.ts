import type { AcceptanceCheckType, TaskPriority, TraineePlanBlockType } from '@/types/trainee'

export interface PlanTemplateSummary {
  id: number
  name: string
  description: string
  targetPosition: string | null
  durationWeeks: number
  system: boolean
  taskCount: number
}

export interface PlanTemplateTask {
  id: number
  block: TraineePlanBlockType
  blockId: string
  description: string
  acceptanceCriteria: string
  priority: TaskPriority
  acceptanceCheckType: AcceptanceCheckType
  daysFromStart: number
  sortOrder: number
}

export interface PlanTemplateBlock {
  id: string
  title: string
  tasks: PlanTemplateTask[]
}

export interface PlanTemplateDetail {
  id: number
  name: string
  description: string
  targetPosition: string | null
  durationWeeks: number
  system: boolean
  blocks: PlanTemplateBlock[]
}

export interface PlanTemplateRequest {
  name: string
  description: string
  targetPosition?: string
  durationWeeks?: number
}

export interface PlanTemplateTaskRequest {
  block: TraineePlanBlockType
  description: string
  acceptanceCriteria: string
  priority: TaskPriority
  acceptanceCheckType: AcceptanceCheckType
  daysFromStart: number
  sortOrder?: number
}

export interface ApplyPlanTemplateRequest {
  startDate?: string
  replaceExisting?: boolean
}

export interface ApplyPlanTemplateResponse {
  templateId: number
  templateName: string
  tasksCreated: number
}
