import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRegister } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Введите ФИО (минимум 2 символа)'),
    email: z
      .string()
      .min(1, 'Email обязателен')
      .email('Введите корректный email')
      .endsWith('@naumen.ru', 'Email должен заканчиваться на @naumen.ru'),
    department: z.string().min(2, 'Укажите отдел'),
    role: z.enum(['ROLE_TRAINEE', 'ROLE_EMPLOYEE', 'ROLE_HR'], {
      required_error: 'Выберите роль',
    }),
    password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { mutate: register_, isPending } = useRegister()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'ROLE_TRAINEE',
    },
  })

  const onSubmit = (data: RegisterFormValues) => {
    const { confirmPassword: _confirmPassword, ...payload } = data
    register_(payload)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-gray-700 font-medium">
          ФИО
        </Label>
        <Input
          id="fullName"
          placeholder="Иванов Иван Иванович"
          autoComplete="name"
          className={cn(
            'h-11 border-gray-200 focus-visible:ring-[#F95700]',
            errors.fullName && 'border-red-500'
          )}
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email" className="text-gray-700 font-medium">
          Email
        </Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="ivanov@naumen.ru"
          autoComplete="email"
          className={cn(
            'h-11 border-gray-200 focus-visible:ring-[#F95700]',
            errors.email && 'border-red-500'
          )}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="department" className="text-gray-700 font-medium">
          Отдел
        </Label>
        <Input
          id="department"
          placeholder="Разработка / HR / Аналитика"
          className={cn(
            'h-11 border-gray-200 focus-visible:ring-[#F95700]',
            errors.department && 'border-red-500'
          )}
          {...register('department')}
        />
        {errors.department && (
          <p className="text-xs text-red-500">{errors.department.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Роль</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger
                className={cn(
                  'h-11 border-gray-200 focus:ring-[#F95700]',
                  errors.role && 'border-red-500'
                )}
              >
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROLE_TRAINEE">Стажёр</SelectItem>
                <SelectItem value="ROLE_EMPLOYEE">Сотрудник</SelectItem>
                <SelectItem value="ROLE_HR">HR / Рекрутер</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p className="text-xs text-red-500">{errors.role.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-password" className="text-gray-700 font-medium">
            Пароль
          </Label>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className={cn(
                'h-11 border-gray-200 focus-visible:ring-[#F95700] pr-11',
                errors.password && 'border-red-500'
              )}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
            Подтверждение
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className={cn(
                'h-11 border-gray-200 focus-visible:ring-[#F95700] pr-11',
                errors.confirmPassword && 'border-red-500'
              )}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-[#F95700] hover:bg-[#EA580C] text-white font-semibold transition-all duration-200 shadow-sm hover:shadow-md mt-2"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Регистрация...
          </>
        ) : (
          'Зарегистрироваться'
        )}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Уже есть аккаунт?{' '}
        <Link
          to="/"
          className="text-[#F95700] hover:text-[#EA580C] font-medium transition-colors hover:underline"
        >
          Войти
        </Link>
      </p>
    </form>
  )
}
