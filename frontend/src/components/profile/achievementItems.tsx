import type { AchievementItem } from '@/components/profile/AchievementBadgeRow'
import type { UserProfile } from '@/types/user'

const TRAINEE_ACHIEVEMENT_IMAGES = {
  firstSteps: '/achievements/first-steps.png',
  stackMastered: '/achievements/stack-mastered.jpg',
  onTarget: '/achievements/on-target.png',
  amongOwn: '/achievements/among-own.png',
  scholar: '/achievements/scholar.png',
} as const

const HR_ACHIEVEMENT_IMAGES = {
  rocketLaunch: '/achievements/hr-rocket-launch.png',
  bullseye: '/achievements/hr-bullseye.png',
  graduation: '/achievements/hr-graduation.png',
  checklist: '/achievements/hr-checklist.png',
  heart: '/achievements/hr-heart.png',
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
      imageSrc: TRAINEE_ACHIEVEMENT_IMAGES.firstSteps,
      earned: hasStarted,
    },
    {
      id: 'on-target',
      title: 'Точно в цель!',
      description: 'Закрыл блок с рабочими задачами',
      unlockHint: 'Заверши все задачи блока «Рабочие задачи»',
      imageSrc: TRAINEE_ACHIEVEMENT_IMAGES.onTarget,
      earned: blockThree >= 100,
    },
    {
      id: 'among-own',
      title: 'Свой среди своих',
      description: 'Закрыл блок знакомства с командой',
      unlockHint: 'Заверши все задачи блока «Знакомство с компанией и командой»',
      imageSrc: TRAINEE_ACHIEVEMENT_IMAGES.amongOwn,
      earned: blockOne >= 100,
    },
    {
      id: 'scholar',
      title: 'Грамотей',
      description: 'Закрыл блок со всеми задачами',
      unlockHint: 'Заверши все задачи во всех трёх блоках адаптации',
      imageSrc: TRAINEE_ACHIEVEMENT_IMAGES.scholar,
      earned: blockOne >= 100 && blockTwo >= 100 && blockThree >= 100,
    },
    {
      id: 'stack-mastered',
      title: 'Стек освоен',
      description: 'Закрыл блок прокачки скилов',
      unlockHint: 'Заверши все задачи блока «Прокачка скиллов»',
      imageSrc: TRAINEE_ACHIEVEMENT_IMAGES.stackMastered,
      earned: blockTwo >= 100,
    },
  ]
}

/** HR: отдельный набор ачивок (названия временные, по картинкам) */
export function buildHrAchievements(): AchievementItem[] {
  return [
    {
      id: 'hr-rocket-launch',
      title: 'Старт программы',
      description: 'Запуск адаптации новых стажёров',
      unlockHint: 'Назначьте первого стажёра и примените шаблон плана',
      imageSrc: HR_ACHIEVEMENT_IMAGES.rocketLaunch,
      earned: true,
    },
    {
      id: 'hr-bullseye',
      title: 'Точно в цель',
      description: 'Команда достигает целей по адаптации',
      unlockHint: 'Доведите средний прогресс стажёров до 80%',
      imageSrc: HR_ACHIEVEMENT_IMAGES.bullseye,
      earned: true,
    },
    {
      id: 'hr-graduation',
      title: 'Выпускной',
      description: 'Стажёры успешно завершают программу',
      unlockHint: 'Завершите адаптацию хотя бы у одного стажёра',
      imageSrc: HR_ACHIEVEMENT_IMAGES.graduation,
      earned: true,
    },
    {
      id: 'hr-checklist',
      title: 'Всё по чек-листу',
      description: 'Задачи стажёров под контролем',
      unlockHint: 'Проверьте выполнение задач у всех стажёров за неделю',
      imageSrc: HR_ACHIEVEMENT_IMAGES.checklist,
      earned: true,
    },
    {
      id: 'hr-heart',
      title: 'С заботой',
      description: 'Высокий индекс настроения в команде',
      unlockHint: 'Средний индекс настроения стажёров — 4 и выше',
      imageSrc: HR_ACHIEVEMENT_IMAGES.heart,
      earned: true,
    },
  ]
}
