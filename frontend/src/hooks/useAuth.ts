import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth'

type ApiErrorWithMessage = {
  response?: {
    data?: {
      message?: string
    }
  }
}

function extractApiErrorMessage(error: Error, fallbackMessage: string): string {
  return (error as ApiErrorWithMessage).response?.data?.message ?? fallbackMessage
}

export function useLogin() {
  const navigate = useNavigate()

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: async (data: LoginRequest) => {
      // ИСПРАВЛЕНО: Убрали /api/v1
      const response = await api.post<AuthResponse>('/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem(
          'user',
          JSON.stringify({
            userId: data.userId,
            fullName: data.fullName,
            role: data.role,
          })
      )
      toast.success(`Добро пожаловать, ${data.fullName}!`)
      navigate(data.redirectUrl || '/app')
    },
    onError: (error: Error) => {
      const message = extractApiErrorMessage(error, 'Неверный email или пароль')
      toast.error(message)
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (data: RegisterRequest) => {
      // ИСПРАВЛЕНО: Убрали /api/v1
      const response = await api.post<AuthResponse>('/auth/register', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Аккаунт создан! Войдите в систему.')
      navigate('/')
    },
    onError: (error: Error) => {
      const message = extractApiErrorMessage(error, 'Ошибка регистрации. Попробуйте снова.')
      toast.error(message)
    },
  })
}