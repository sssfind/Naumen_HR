import { useState } from 'react'
import { ArrowLeft, Search, SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

const RECOMMENDED_SKILLS = ['Java', 'Spring Boot', 'Участие в хакатонах'] as const

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return `${first}${second}`.toUpperCase() || 'AI'
}

export function AIChatView({ userName = 'Иван' }: { userName?: string }) {
  const [query, setQuery] = useState('')
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  function handleGenerate() {
    setIsGenerating(true)
    window.setTimeout(() => {
      setIsGenerating(false)
      setShowRecommendation(true)
    }, 3000)
  }

  if (showRecommendation) {
    const fullName = 'Воронов Константин'

    return (
      <div className="relative flex min-h-[calc(100dvh-5rem-env(safe-area-inset-bottom))] flex-col bg-[#F5F5F5] px-4 py-6 sm:px-6 lg:min-h-screen lg:px-8 lg:py-8">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-5 lg:right-8 lg:top-5">
          <span className="text-xl font-black tracking-tight text-[#F95700] sm:text-2xl">NAUMEN</span>
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 pt-12 sm:gap-6 sm:pt-10">
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 w-fit touch-manipulation rounded-xl px-2 text-[#252525] hover:bg-transparent hover:text-[#F95700] sm:px-0"
            onClick={() => setShowRecommendation(false)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>

          <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F95700] sm:text-sm">
              Результат LLM-запроса
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[#1A1A2E] sm:mt-3 sm:text-4xl">
              Наша рекомендация по вашему запросу
            </h1>

            <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
              <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-4 shadow-[0_20px_60px_rgba(34,197,94,0.16)] sm:rounded-[28px] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-white">
                      {getInitials(fullName)}
                    </div>
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                        Рекомендован
                      </span>
                      <h2 className="mt-2 break-words text-2xl font-bold text-[#14532D] sm:mt-3 sm:text-3xl">
                        {fullName}
                      </h2>
                      <p className="mt-1 text-sm text-emerald-800/80">Backend Platform</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-left sm:text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/70">
                      Совпадение
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">98%</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-emerald-900">Скиллы</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {RECOMMENDED_SKILLS.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-[#FCFCFC] p-4 sm:rounded-[28px] sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#F95700]">
                  Почему именно он
                </p>
                <div className="mt-4 space-y-4 text-sm leading-6 text-[#4B4B5C]">
                  <p>
                    У пользователя сильный стек <span className="font-semibold text-[#252525]">Java</span>{' '}
                    и <span className="font-semibold text-[#252525]">Spring Boot</span>, который
                    напрямую подходит под backend-задачи.
                  </p>
                  <p>
                    Опыт <span className="font-semibold text-[#252525]">участия в хакатонах</span>{' '}
                    показывает, что он умеет быстро находить решения и хорошо работает в динамичной
                    среде.
                  </p>
                  <p>
                    Поэтому его карточка выделена зеленым как основная рекомендация от AI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-5rem-env(safe-area-inset-bottom))] flex-col bg-[#F5F5F5] lg:min-h-screen">
      <div className="absolute right-4 top-4 sm:right-8 sm:top-5">
        <span className="text-xl font-black tracking-tight text-[#F95700] sm:text-2xl">NAUMEN</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-8 sm:gap-6 sm:px-8">
        <h1 className="text-center text-2xl font-semibold leading-snug text-[#1A1A2E] sm:text-3xl md:text-4xl">
          {getGreeting()}, {userName}!
        </h1>

        <div className="relative w-full max-w-[680px]">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-6 sm:h-6 sm:w-6"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Кого найдем сегодня?"
            className="min-h-[3.25rem] w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-base text-gray-800 outline-none transition-all focus:border-[#F95700] focus:ring-2 focus:ring-[#F95700]/30 sm:min-h-0 sm:py-5 sm:pl-16 sm:pr-6 sm:text-lg"
          />
        </div>

        <Button
          type="button"
          className="min-h-12 w-full max-w-[680px] touch-manipulation rounded-2xl bg-[#F95700] px-6 text-base font-semibold text-white hover:bg-[#E15300] sm:w-auto"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          <SendHorizontal className="mr-2 h-4 w-4" />
          {isGenerating ? 'LLM генерирует ответ...' : 'Отправить запрос в LLM'}
        </Button>

        {isGenerating ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-8 py-6 shadow-sm">
            <div className="flex gap-2">
              <span className="h-3 w-3 animate-bounce rounded-full bg-[#F95700] [animation-delay:-0.3s]" />
              <span className="h-3 w-3 animate-bounce rounded-full bg-[#F95700] [animation-delay:-0.15s]" />
              <span className="h-3 w-3 animate-bounce rounded-full bg-[#F95700]" />
            </div>
            <p className="text-sm font-medium text-[#5B5B6B]">LLM генерирует ответ...</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
