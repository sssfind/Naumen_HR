import type { UserProfile } from '@/types/user'

/** Соответствует TraineePlanBlock на бэкенде (onboarding → block one и т.д.) */
export const TRAINEE_PLAN_BLOCKS = [
  {
    order: 1,
    id: 'onboarding',
    title: 'Знакомство с компанией и командой',
    progressKey: 'progressBlockOne',
  },
  {
    order: 2,
    id: 'skills',
    title: 'Прокачка скиллов',
    progressKey: 'progressBlockTwo',
  },
  {
    order: 3,
    id: 'work',
    title: 'Рабочие задачи',
    progressKey: 'progressBlockThree',
  },
] as const satisfies ReadonlyArray<{
  order: number
  id: string
  title: string
  progressKey: keyof Pick<
    UserProfile,
    'progressBlockOne' | 'progressBlockTwo' | 'progressBlockThree'
  >
}>

export function formatTraineeBlockLabel(block: (typeof TRAINEE_PLAN_BLOCKS)[number]): string {
  return `Блок ${block.order}: ${block.title}`
}
