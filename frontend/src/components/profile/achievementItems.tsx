import type { AchievementItem } from '@/components/profile/AchievementBadgeRow'

export type TraineeAchievementProgress = {
  progressBlockOne?: number
  progressBlockTwo?: number
  progressBlockThree?: number
}

const TRAINEE_ACHIEVEMENT_IMAGES = {
  firstSteps: '/achievements/first-steps.png',
  stackMastered: '/achievements/stack-mastered.jpg',
  onTarget: '/achievements/on-target.png',
  amongOwn: '/achievements/among-own.png',
  scholar: '/achievements/scholar.png',
  firstSalary: '/achievements/trainee-first-salary.png',
} as const

const HR_ACHIEVEMENT_IMAGES = {
  rocketLaunch: '/achievements/hr-rocket-launch.png',
  bullseye: '/achievements/hr-bullseye.png',
  graduation: '/achievements/hr-graduation.png',
  checklist: '/achievements/hr-checklist.png',
  heart: '/achievements/hr-heart.png',
  champion: '/achievements/hr-champion.png',
} as const

const HR_BASE_ACHIEVEMENT_COUNT = 5

export function buildTraineeAchievements(
  profile: TraineeAchievementProgress | undefined
): AchievementItem[] {
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
      imageSrc: TRAINEE_ACHIEVEMENT_IMAGES.firstSteps,
      ownershipPercent: 95,
      earned: hasStarted,
    },
    {
      id: 'on-target',
      title: 'Точно в цель!',
      description: 'Закрыл блок с рабочими задачами',
      unlockHint: 'Заверши все задачи блока «Рабочие задачи»',
      imageSrc: TRAINEE_ACHIEVEMENT_IMAGES.onTarget,
      ownershipPercent: 38,
      earned: blockThree >= 100,
    },
    {
      id: 'among-own',
      title: 'Свой среди своих',
      description: 'Закрыл блок знакомства с командой',
      unlockHint: 'Заверши все задачи блока «Знакомство с компанией и командой»',
      imageSrc: TRAINEE_ACHIEVEMENT_IMAGES.amongOwn,
      ownershipPercent: 62,
      earned: blockOne >= 100,
    },
    {
      id: 'scholar',
      title: 'Грамотей',
      description: 'Закрыл блок со всеми задачами',
      unlockHint: 'Заверши все задачи во всех трёх блоках адаптации',
      imageSrc: TRAINEE_ACHIEVEMENT_IMAGES.scholar,
      ownershipPercent: 18,
      earned: blockOne >= 100 && blockTwo >= 100 && blockThree >= 100,
    },
    {
      id: 'stack-mastered',
      title: 'Стек освоен',
      description: 'Закрыл блок прокачки скилов',
      unlockHint: 'Заверши все задачи блока «Прокачка скиллов»',
      imageSrc: TRAINEE_ACHIEVEMENT_IMAGES.stackMastered,
      ownershipPercent: 44,
      earned: blockTwo >= 100,
    },
    {
      id: 'first-salary',
      title: 'Молодой уже богатый',
      description: 'Получить первую зарплату',
      unlockHint: 'Получить первую зарплату',
      imageSrc: TRAINEE_ACHIEVEMENT_IMAGES.firstSalary,
      imageFit: 'contain',
      ownershipPercent: 72,
      earned: false,
    },
  ]
}

export type HrAchievementStats = {
  traineeCount: number
  averageMoodLevel: number | null
  maxTraineeCompletionPercent: number
  hasCustomTemplate: boolean
}

function buildHrBaseAchievements(stats?: HrAchievementStats): AchievementItem[] {
  const traineeCount = stats?.traineeCount ?? 0
  const mood = stats?.averageMoodLevel ?? null
  const maxCompletion = stats?.maxTraineeCompletionPercent ?? 0
  const hasTemplate = stats?.hasCustomTemplate ?? false

  return [
    {
      id: 'hr-rocket-launch',
      title: 'Первый пошёл',
      description: 'Первый стажёр в вашей программе адаптации',
      unlockHint: 'Добавьте первого стажёра в программу',
      imageSrc: HR_ACHIEVEMENT_IMAGES.rocketLaunch,
      ownershipPercent: 78,
      earned: traineeCount >= 1,
    },
    {
      id: 'hr-bullseye',
      title: '100% match',
      description: 'У стажёра выполнены все задачи плана',
      unlockHint: 'Доведите прогресс хотя бы одного стажёра до 100%',
      imageSrc: HR_ACHIEVEMENT_IMAGES.bullseye,
      ownershipPercent: 34,
      earned: maxCompletion >= 100,
    },
    {
      id: 'hr-checklist',
      title: 'Архитектор траекторий',
      description: 'Создан собственный шаблон адаптации',
      unlockHint: 'Создайте свой шаблон в разделе «Шаблоны адаптации»',
      imageSrc: HR_ACHIEVEMENT_IMAGES.checklist,
      ownershipPercent: 41,
      earned: hasTemplate,
    },
    {
      id: 'hr-graduation',
      title: 'Выпускной класс',
      description: 'Пять и более стажёров под вашим кураторством',
      unlockHint: 'Закрепите за собой 5 стажёров',
      imageSrc: HR_ACHIEVEMENT_IMAGES.graduation,
      ownershipPercent: 22,
      earned: traineeCount >= 5,
    },
    {
      id: 'hr-heart',
      title: 'Главный эмпат',
      description: 'Среднее настроение команды выше 4.5',
      unlockHint: 'Поддерживайте настроение стажёров на высоком уровне',
      imageSrc: HR_ACHIEVEMENT_IMAGES.heart,
      ownershipPercent: 29,
      earned: mood != null && mood >= 4.5,
    },
  ]
}

function buildHrChampionAchievement(earnedBaseCount: number): AchievementItem {
  return {
    id: 'hr-champion',
    title: 'Чемпион',
    description: 'Вы собрали все пять достижений HR и наставника',
    unlockHint: `Получите все ${HR_BASE_ACHIEVEMENT_COUNT} остальных достижений`,
    imageSrc: HR_ACHIEVEMENT_IMAGES.champion,
    imageFit: 'contain',
    ownershipPercent: 12,
    earned: earnedBaseCount >= HR_BASE_ACHIEVEMENT_COUNT,
  }
}

/** HR и наставник: базовые ачивки по показателям команды + «Чемпион» при сборе всех пяти */
export function buildHrAchievements(stats?: HrAchievementStats): AchievementItem[] {
  const base = buildHrBaseAchievements(stats)
  const earnedBaseCount = base.filter((item) => item.earned).length
  return [...base, buildHrChampionAchievement(earnedBaseCount)]
}
