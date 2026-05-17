const STORAGE_KEY = 'naumen-hr-achievement-unlocks'

function readMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function writeMap(map: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

/** Дата первого отображения полученной ачивки (до появления поля на бэкенде). */
export function resolveAchievementUnlockDate(
  userId: number | undefined,
  achievementId: string,
  earned: boolean
): string | undefined {
  if (!earned || userId == null) return undefined

  const key = `${userId}:${achievementId}`
  const map = readMap()
  if (!map[key]) {
    map[key] = new Date().toISOString()
    writeMap(map)
  }
  return map[key]
}

export function formatAchievementUnlockDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso))
}
