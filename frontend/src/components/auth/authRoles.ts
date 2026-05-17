export type AuthUiRole = 'employee' | 'hr' | 'mentor'

export const AUTH_ROLE_LABELS: Record<AuthUiRole, string> = {
  employee: 'Сотрудник',
  hr: 'HR/Рекрутер',
  mentor: 'Mentor/Наставник',
}

export const AUTH_ROLE_HINTS: Record<AuthUiRole, string> = {
  employee:
    'Твой интерактивный план адаптации: выполняй задачи по блокам, делись настроением в опросах и открывай ачивки.',
  hr: 'HR / Рекрутер: управляйте профилями сотрудников и формируйте команды.',
  mentor:
    'Наставник: сопровождайте закреплённых стажёров, следите за прогрессом и обратной связью.',
}

export function authUiRoleToRegisterRole(
  role: AuthUiRole
): 'ROLE_TRAINEE' | 'ROLE_HR' | 'ROLE_MENTOR' {
  if (role === 'employee') return 'ROLE_TRAINEE'
  if (role === 'mentor') return 'ROLE_MENTOR'
  return 'ROLE_HR'
}
