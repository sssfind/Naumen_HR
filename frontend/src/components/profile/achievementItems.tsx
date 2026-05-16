import type { AchievementItem } from '@/components/profile/AchievementBadgeRow'
import type { UserProfile } from '@/types/user'

const ACHIEVEMENT_IMAGES = {
  firstSteps: '/achievements/first-steps.png',
  stackMastered: '/achievements/stack-mastered.jpg',
  onTarget: '/achievements/on-target.png',
  amongOwn: '/achievements/among-own.png',
  scholar: '/achievements/scholar.png',
} as const

export function buildTraineeAchievements(profile: UserProfile | undefined): AchievementItem[] {
  const blockOne = profile?.progressBlockOne ?? 0
  const blockTwo = profile?.progressBlockTwo ?? 0
  const blockThree = profile?.progressBlockThree ?? 0
  const hasStarted = blockOne > 0 || blockTwo > 0 || blockThree > 0

  return [
    {
      id: 'first-steps',
      title: 'Первые шаги',
      description: 'Ты справился с первой задачей!',
      unlockHint: 'Выполни первую задачу в плане адаптации',
      imageSrc: ACHIEVEMENT_IMAGES.firstSteps,
      earned: hasStarted,
    },
    {
      id: 'on-target',
      title: 'Точно в цель!',
      description: 'Закрыл блок с рабочими задачами',
      unlockHint: 'Заверши все задачи блока «Рабочие задачи»',
      imageSrc: ACHIEVEMENT_IMAGES.onTarget,
      earned: blockThree >= 100,
    },
    {
      id: 'among-own',
      title: 'Свой среди своих',
      description: 'Закрыл блок знакомства с командой',
      unlockHint: 'Заверши все задачи блока «Знакомство с компанией и командой»',
      imageSrc: ACHIEVEMENT_IMAGES.amongOwn,
      earned: blockOne >= 100,
    },
    {
      id: 'scholar',
      title: 'Грамотей',
      description: 'Закрыл блок со всеми задачами',
      unlockHint: 'Заверши все задачи во всех трёх блоках адаптации',
      imageSrc: ACHIEVEMENT_IMAGES.scholar,
      earned: blockOne >= 100 && blockTwo >= 100 && blockThree >= 100,
    },
    {
      id: 'stack-mastered',
      title: 'Стек освоен',
      description: 'Закрыл блок прокачки скилов',
      unlockHint: 'Заверши все задачи блока «Прокачка скиллов»',
      imageSrc: ACHIEVEMENT_IMAGES.stackMastered,
      earned: blockTwo >= 100,
    },
  ]
}

/** HR: те же визуалы достижений */
export function buildHrAchievements(): AchievementItem[] {
  return [
    {
      id: 'hr-curator',
      title: 'HR-куратор',
      description: 'Сопровождаете стажёров на стажировке',
      unlockHint: 'Закрепите за собой хотя бы одного стажёра',
      imageSrc: ACHIEVEMENT_IMAGES.firstSteps,
      earned: true,
    },
    {
      id: 'team-active',
      title: 'Команда в деле',
      description: 'Следите за прогрессом своей группы',
      unlockHint: 'Откройте профили всех закреплённых стажёров',
      imageSrc: ACHIEVEMENT_IMAGES.amongOwn,
      earned: true,
    },
    {
      id: 'feedback',
      title: 'Обратная связь',
      description: 'Анализируете еженедельные опросы',
      unlockHint: 'Просмотрите ответы стажёров за неделю',
      imageSrc: ACHIEVEMENT_IMAGES.onTarget,
      earned: true,
    },
    {
      id: 'mentor',
      title: 'Наставник',
      description: 'Помогаете новичкам адаптироваться',
      unlockHint: 'Оставьте комментарий к задаче стажёра',
      imageSrc: ACHIEVEMENT_IMAGES.stackMastered,
      earned: true,
    },
    {
      id: 'organizer',
      title: 'Организатор',
      description: 'Ведёте план и задачи стажёров',
      unlockHint: 'Примените шаблон адаптации к стажёру',
      imageSrc: ACHIEVEMENT_IMAGES.scholar,
      earned: true,
    },
  ]
}
