import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { useAuthLoginFooter } from '@/components/auth/AuthLoginFooterContext'
import { parseLoginError } from '@/components/auth/authLoginErrors'
import {
  authFieldClass,
  authFixedLoginButtonClass,
  authFooterLinkClass,
  authLabelClass,
} from '@/components/auth/authFieldStyles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export const AUTH_LOGIN_FORM_ID = 'auth-login-form'

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
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null)
  const { mutate: login, isPending } = useLogin()
  const { setFooter } = useAuthLoginFooter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    setFooter(
      <Button
        type="submit"
        form={AUTH_LOGIN_FORM_ID}
        disabled={isPending}
        className={authFixedLoginButtonClass}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Вход...
          </>
        ) : (
          'Войти'
        )}
      </Button>
    )
    return () => setFooter(null)
  }, [isPending, setFooter])

  const clearLoginError = () => setLoginErrorMessage(null)

  const emailField = register('email', {
    onChange: clearLoginError,
  })

  const passwordField = register('password', {
    onChange: clearLoginError,
  })

  return (
    <form
      id={AUTH_LOGIN_FORM_ID}
      onSubmit={handleSubmit((data) => {
        clearLoginError()
        login(data, {
          onError: (error) => {
            const { message } = parseLoginError(error)
            setLoginErrorMessage(message)
          },
        })
      })}
      className="space-y-4"
    >
      {loginErrorMessage && <AuthErrorBanner message={loginErrorMessage} />}

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
          name={emailField.name}
          ref={emailField.ref}
          onBlur={emailField.onBlur}
          onChange={emailField.onChange}
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
            name={passwordField.name}
            ref={passwordField.ref}
            onBlur={passwordField.onBlur}
            onChange={passwordField.onChange}
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

      <p className="text-center text-sm text-[rgba(37,37,37,0.7)]">
        Нет аккаунта?{' '}
        <Link to="/register" className={authFooterLinkClass}>
          Зарегистрироваться
        </Link>
      </p>
    </form>
  )
}
