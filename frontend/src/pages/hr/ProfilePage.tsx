import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import type { UpdateProfileRequest } from '@/types/user'

export function ProfilePage() {
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
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-[#1A1A2E]">Мой профиль</h1>
      <p className="mt-1 text-sm text-gray-500">Редактирование личных данных</p>

      <form
        onSubmit={handleSubmit((data) => updateProfile.mutate(data))}
        className="mt-6 space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
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

        <div>
          <Label htmlFor="department">Отдел</Label>
          <Input id="department" className="mt-1.5" {...register('department')} />
        </div>

        <div>
          <Label htmlFor="position">Должность</Label>
          <Input id="position" className="mt-1.5" {...register('position')} />
        </div>

        <div>
          <Label htmlFor="phone">Телефон</Label>
          <Input id="phone" className="mt-1.5" {...register('phone')} />
        </div>

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </form>
    </div>
  )
}

