export type WeekRating =
  | 'EXCELLENT'
  | 'GOOD'
  | 'OKAY_DIFFICULT'
  | 'STRESSED'
  | 'NEED_HELP'

export type ResourceIssue =
  | 'ALL_OK'
  | 'NO_FOLDER_ACCESS'
  | 'NO_EQUIPMENT'
  | 'OTHER'

export interface FeedbackResponse {
  id: number
  weekStart: string
  weekRating: WeekRating
  tasksClarity: number
  resourceIssues: ResourceIssue[]
  mentorRating: number
  weekComment: string | null
  createdAt: string
}

export interface FeedbackStatus {
  currentWeekStart: string
  canSubmitThisWeek: boolean
  dueThisWeek: boolean
  currentWeekResponse: FeedbackResponse | null
  lastResponse: FeedbackResponse | null
}

export interface SubmitFeedbackRequest {
  weekRating: WeekRating
  tasksClarity: number
  resourceIssues: ResourceIssue[]
  mentorRating: number
  weekComment?: string
}

export const weekRatingOptions: {
  value: WeekRating
  emoji: string
  label: string
}[] = [
  { value: 'EXCELLENT', emoji: '🤩', label: 'Отлично, много драйва' },
  { value: 'GOOD', emoji: '🙂', label: 'Хорошо, всё понятно' },
  { value: 'OKAY_DIFFICULT', emoji: '😐', label: 'Было сложно, но я справляюсь' },
  { value: 'STRESSED', emoji: '😔', label: 'Тяжело, чувствую стресс' },
  { value: 'NEED_HELP', emoji: '🆘', label: 'Нужна помощь (HR свяжется с тобой сегодня)' },
]

export const resourceIssueOptions: {
  value: ResourceIssue
  label: string
}[] = [
  { value: 'ALL_OK', label: 'Да, всё необходимое в наличии' },
  { value: 'NO_FOLDER_ACCESS', label: 'Нет доступа к нужным папкам/сервисам' },
  { value: 'NO_EQUIPMENT', label: 'Нет корпоративного оборудования/софта' },
  { value: 'OTHER', label: 'Другое (укажи в комментарии)' },
]

export const tasksClarityLabels: Record<number, string> = {
  1: 'Совсем не понимаю, что делать',
  5: 'Полная ясность, знаю свои цели',
}

export const mentorRatingLabels: Record<number, string> = {
  1: 'Наставник был недоступен',
  5: 'Получил отличную поддержку и фидбек',
}
