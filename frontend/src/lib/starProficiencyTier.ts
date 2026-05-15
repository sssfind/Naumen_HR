/**
 * Уровень по сумме звёзд на навыке (карточка эксперта / расширенный профиль):
 * 0–5 базовый, 6–10 уверенный, 11–15 эксперт.
 */
export type StarProficiencyTier = 'basic' | 'confident' | 'expert'

export function getStarProficiencyTier(stars: number): StarProficiencyTier {
  const s = Math.max(0, Math.round(Number(stars) || 0))
  if (s <= 5) return 'basic'
  if (s <= 10) return 'confident'
  return 'expert'
}

export const STAR_TIER_LABELS: Record<StarProficiencyTier, string> = {
  basic: 'Базовый',
  confident: 'Уверенный',
  expert: 'Эксперт',
}

/** Оформление строки навыка (фон и рамка) */
export function starTierRowClasses(tier: StarProficiencyTier): string {
  switch (tier) {
    case 'basic':
      return 'border-[#252525]/12 bg-[#F9FAFB]'
    case 'confident':
      return 'border-[#FF6720]/40 bg-[#FF6720]/12'
    case 'expert':
      return 'border-[#FF6720] bg-[#FF6720]/20 shadow-sm shadow-[#FF6720]/15'
  }
}

/** Плашка уровня по звёздам */
export function starTierBadgeClasses(tier: StarProficiencyTier): string {
  switch (tier) {
    case 'basic':
      return 'border border-[#252525]/20 bg-white text-[#252525]'
    case 'confident':
      return 'border border-[#FF6720]/50 bg-[#FF6720]/15 text-[#252525] font-semibold'
    case 'expert':
      return 'border border-[#FF6720] bg-[#FF6720] text-white font-bold'
  }
}
