import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  authFieldClass,
  authFooterLinkClass,
  authLabelClass,
  authSubmitClass,
} from '@/components/auth/authFieldStyles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email')
    .endsWith('@naumen.ru', 'Email должен заканчиваться на @naumen.ru'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
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

  return (
    <form onSubmit={handleSubmit((data) => login(data))} className="space-y-5 md:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className={authLabelClass}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="ivanov@naumen.ru"
          autoComplete="email"
          className={authFieldClass(Boolean(errors.email))}
          {...register('email')}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className={authLabelClass}>
          Пароль
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            className={cn(authFieldClass(Boolean(errors.password)), 'pr-11')}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <Button type="submit" disabled={isPending} className={authSubmitClass}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Вход...
          </>
        ) : (
          'Войти'
        )}
      </Button>

      <p className="text-center text-sm text-[rgba(37,37,37,0.7)] md:text-2xl md:leading-[30px]">
        Нет аккаунта?{' '}
        <Link to="/register" className={authFooterLinkClass}>
          Зарегистрироваться
        </Link>
      </p>
    </form>
  )
}
