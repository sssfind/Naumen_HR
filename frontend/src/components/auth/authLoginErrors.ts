export const LOGIN_ERROR_EMAIL_NOT_REGISTERED = 'Такая почта не зарегистрирована'
export const LOGIN_ERROR_WRONG_PASSWORD = 'Неправильный пароль'

export type LoginErrorKind = 'email_not_registered' | 'wrong_password' | 'unknown'

type ApiErrorWithMessage = {
  response?: {
    status?: number
    data?: {
      message?: string
    }
  }
}

export function parseLoginError(error: Error): { kind: LoginErrorKind; message: string } {
  const apiError = error as ApiErrorWithMessage
  const status = apiError.response?.status
  const message = apiError.response?.data?.message ?? ''

  if (status === 404 || message === LOGIN_ERROR_EMAIL_NOT_REGISTERED) {
    return { kind: 'email_not_registered', message: LOGIN_ERROR_EMAIL_NOT_REGISTERED }
  }

  if (
    status === 401 ||
    message === LOGIN_ERROR_WRONG_PASSWORD ||
    message.toLowerCase().includes('пароль')
  ) {
    return { kind: 'wrong_password', message: LOGIN_ERROR_WRONG_PASSWORD }
  }

  return { kind: 'unknown', message: message || 'Не удалось войти. Попробуйте снова.' }
}
