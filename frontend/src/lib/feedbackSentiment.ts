import type { CommentRiskFlag, FeedbackResponse, SentimentLabel } from '@/types/feedback'

export const sentimentLabelText: Record<SentimentLabel, string> = {
  POSITIVE: 'Позитивный',
  NEUTRAL: 'Нейтральный',
  NEGATIVE: 'Негативный',
  AT_RISK: 'Риск',
}

export const commentRiskFlagText: Record<CommentRiskFlag, string> = {
  STRESS: 'Стресс',
  UNCLEAR_TASKS: 'Непонятные задачи',
  LOW_ENGAGEMENT: 'Низкая вовлечённость',
  ACCESS_ISSUES: 'Доступы и ресурсы',
}

export function isFeedbackRisk(item: FeedbackResponse): boolean {
  if (
    item.weekRating === 'STRESSED' ||
    item.weekRating === 'NEED_HELP' ||
    item.tasksClarity <= 2 ||
    item.mentorRating <= 2 ||
    item.resourceIssues.some((i) => i !== 'ALL_OK')
  ) {
    return true
  }
  if (item.sentimentLabel === 'AT_RISK' || item.sentimentLabel === 'NEGATIVE') {
    return true
  }
  if (item.commentSentiment === 'NEGATIVE') {
    return true
  }
  if (item.commentRiskFlags && item.commentRiskFlags.length > 0) {
    return true
  }
  if (item.sentimentScore != null && item.sentimentScore < 40) {
    return true
  }
  return false
}

export function sentimentScoreColor(score: number | null | undefined): string {
  if (score == null) return 'text-gray-500'
  if (score >= 75) return 'text-green-600'
  if (score >= 50) return 'text-gray-700'
  if (score >= 35) return 'text-amber-700'
  return 'text-red-600'
}
