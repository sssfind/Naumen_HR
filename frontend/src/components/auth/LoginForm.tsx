import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email')
    .endsWith('@naumen.ru', 'Email должен заканчиваться на @naumen.ru'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormValues) => {
    login(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="ivanov@naumen.ru"
          autoComplete="email"
          className={cn(
            'h-11 border-gray-200 focus-visible:ring-[#C2410C] transition-all',
            errors.email && 'border-red-500 focus-visible:ring-red-500'
          )}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700 font-medium">
          Пароль
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            className={cn(
              'h-11 border-gray-200 focus-visible:ring-[#C2410C] pr-11 transition-all',
              errors.password && 'border-red-500 focus-visible:ring-red-500'
            )}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-[#FF6720] hover:bg-[#EA580C] text-white font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Вход...
          </>
        ) : (
          'Войти'
        )}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Нет аккаунта?{' '}
        <Link
          to="/register"
          className="text-[#FF6720] hover:text-[#EA580C] font-medium transition-colors hover:underline"
        >
          Зарегистрироваться
        </Link>
      </p>
    </form>
  )
}
