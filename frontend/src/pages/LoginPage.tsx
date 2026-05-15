import { Briefcase, User } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterSideBanner } from '@/components/auth/RegisterSideBanner'

export function LoginPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#F5F5F5]">
      <div className="hidden md:block min-h-screen">
        <RegisterSideBanner />
      </div>

      <div className="flex items-center justify-center overflow-x-hidden bg-[#F5F5F5] p-4 sm:p-6 md:p-10">
        <div className="w-full min-w-0 max-w-md">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-1">Вход в систему</h2>
              <p className="text-gray-500 text-sm">
                Используйте корпоративный аккаунт Naumen
              </p>
            </div>

            <Tabs defaultValue="employee" className="w-full">
              <TabsList className="mb-6 h-auto min-h-12 w-full gap-1 rounded-lg bg-[#F5F5F5] p-1">
                <TabsTrigger
                  value="employee"
                  className="min-h-11 flex-1 touch-manipulation gap-2 text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#1A1A2E] data-[state=active]:shadow-sm"
                >
                  <User className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">Сотрудник</span>
                  <span className="sm:hidden">Сотр.</span>
                </TabsTrigger>
                <TabsTrigger
                  value="hr"
                  className="min-h-11 flex-1 touch-manipulation gap-2 text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#1A1A2E] data-[state=active]:shadow-sm"
                >
                  <Briefcase className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">HR / Рекрутер</span>
                  <span className="sm:hidden">HR</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="employee">
                <div className="mb-4 px-3 py-2.5 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600">
                    <span className="font-semibold">Сотрудник:</span> просматривайте карту экспертизы и подтверждайте навыки коллег
                  </p>
                </div>
                <LoginForm />
              </TabsContent>

              <TabsContent value="hr">
                <div className="mb-4 px-3 py-2.5 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-xs text-purple-600">
                    <span className="font-semibold">HR / Рекрутер:</span> управляйте профилями сотрудников и формируйте команды
                  </p>
                </div>
                <LoginForm />
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </div>
    </div>
  )
}
