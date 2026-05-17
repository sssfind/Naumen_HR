export type AuthUiRole = 'employee' | 'hr' | 'mentor'

export const AUTH_ROLE_LABELS: Record<AuthUiRole, string> = {
  employee: 'Стажёр',
  hr: 'HR/Рекрутер',
  mentor: 'Mentor/Наставник',
}

export const AUTH_ROLE_HINTS: Record<AuthUiRole, string> = {
  employee:
    'Твой интерактивный план адаптации: выполняй задачи по блокам, делись настроением в опросах и открывай ачивки.',
  hr: 'Экспертное сопровождение: координируй задачи своего подопечного и проверяй результаты.',
  mentor: 'Сопровождайте закреплённых стажёров, следите за прогрессом и обратной связью.',
}

/** Фон и текст подсказки роли на экранах входа и регистрации */
export const AUTH_ROLE_HINT_STYLES: Record<AuthUiRole, { box: string; text: string }> = {
  employee: { box: 'bg-[#EFF6FF]', text: 'text-[#1E4A7A]' },
  hr: { box: 'bg-[#ECFDF3]', text: 'text-[#166534]' },
  mentor: { box: 'bg-[#F3E8FF]', text: 'text-[#6B21A8]' },
}

export function authUiRoleToRegisterRole(
  role: AuthUiRole
): 'ROLE_TRAINEE' | 'ROLE_HR' | 'ROLE_MENTOR' {
  if (role === 'employee') return 'ROLE_TRAINEE'
  if (role === 'mentor') return 'ROLE_MENTOR'
  return 'ROLE_HR'
}
