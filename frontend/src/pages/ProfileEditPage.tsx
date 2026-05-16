import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import type { UpdateProfileRequest } from '@/types/user'

interface ProfileEditPageProps {
  backTo: string
}

export function ProfileEditPage({ backTo }: ProfileEditPageProps) {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileRequest>()

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        department: profile.department ?? '',
        phone: profile.phone ?? '',
        position: profile.position ?? '',
      })
    }
  }, [profile, reset])

  if (isLoading) {
    return <p className="text-gray-500">Загрузка профиля…</p>
  }

  return (
    <div className="max-w-2xl">
      <Button asChild variant="ghost" className="mb-6 gap-2">
        <Link to={backTo}>
          <ArrowLeft className="h-4 w-4" />
          Назад к профилю
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Редактирование профиля</h1>
        <p className="mt-1 text-sm text-gray-500">Обновите личные данные профиля</p>
      </div>

      <form
        onSubmit={handleSubmit((data) => updateProfile.mutate(data))}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <Label>Email</Label>
          <Input value={profile?.email ?? ''} disabled className="mt-1.5 bg-gray-50" />
        </div>

        <div>
          <Label htmlFor="fullName">ФИО *</Label>
          <Input
            id="fullName"
            className="mt-1.5"
            {...register('fullName', { required: 'Обязательное поле' })}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="department">Отдел</Label>
            <Input id="department" className="mt-1.5" {...register('department')} />
          </div>

          <div>
            <Label htmlFor="position">Должность</Label>
            <Input id="position" className="mt-1.5" {...register('position')} />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Телефон</Label>
          <Input id="phone" className="mt-1.5" {...register('phone')} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </div>
  )
}
