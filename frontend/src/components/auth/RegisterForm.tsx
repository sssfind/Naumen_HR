import { useEffect, useState, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AuthUiRole } from '@/components/auth/authRoles'
import { authUiRoleToRegisterRole } from '@/components/auth/authRoles'
import {
  authFieldClass,
  authFooterLinkClass,
  authLabelClass,
  authSubmitClass,
} from '@/components/auth/authFieldStyles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRegister } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Введите ФИО (минимум 2 символа)'),
    email: z
      .string()
      .min(1, 'Email обязателен')
      .email('Введите корректный email')
      .endsWith('@naumen.ru', 'Email должен заканчиваться на @naumen.ru'),
    department: z.string().min(2, 'Укажите отдел'),
    role: z.enum(['ROLE_TRAINEE', 'ROLE_HR', 'ROLE_MENTOR']),
    password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

type RegisterFormProps = {
  uiRole: AuthUiRole | null
  onMissingRole?: () => void
}

export function RegisterForm({ uiRole, onMissingRole }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { mutate: register_, isPending } = useRegister()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => {
    if (uiRole) {
      setValue('role', authUiRoleToRegisterRole(uiRole))
    }
  }, [uiRole, setValue])

  const onSubmit = (data: RegisterFormValues) => {
    const { confirmPassword: _confirmPassword, ...payload } = data
    register_(payload)
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!uiRole) {
      onMissingRole?.()
      return
    }
    void handleSubmit(onSubmit)(event)
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-3">
      <input type="hidden" {...register('role')} />

      <div className="space-y-1.5">
        <Label htmlFor="fullName" className={authLabelClass}>
          ФИО
        </Label>
        <Input
          id="fullName"
          placeholder="Иванов Иван Иванович"
          autoComplete="name"
          className={authFieldClass(Boolean(errors.fullName))}
          {...register('fullName')}
        />
        {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-email" className={authLabelClass}>
          Email
        </Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="ivanov@naumen.ru"
          autoComplete="email"
          className={authFieldClass(Boolean(errors.email))}
          {...register('email')}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="department" className={authLabelClass}>
          Отдел
        </Label>
        <Input
          id="department"
          placeholder="Разработка / HR / Аналитика"
          className={authFieldClass(Boolean(errors.department))}
          {...register('department')}
        />
        {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className={authLabelClass}>
            Пароль
          </Label>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className={cn(authFieldClass(Boolean(errors.password)), 'pr-11')}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className={authLabelClass}>
            Подтверждение
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className={cn(authFieldClass(Boolean(errors.confirmPassword)), 'pr-11')}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className={cn(authSubmitClass, 'mt-1')}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Регистрация...
          </>
        ) : (
          'Зарегистрироваться'
        )}
      </Button>

      <p className="text-center text-sm text-[rgba(37,37,37,0.7)]">
        Уже есть аккаунт?{' '}
        <Link to="/" className={authFooterLinkClass}>
          Войти
        </Link>
      </p>
    </form>
  )
}
