import topLeftLines from '@/assets/register-side/top-left-lines.png'
import bottomRightRings from '@/assets/register-side/bottom-right-rings.png'
import logo from '@/assets/register-side/logo.png'
import { cn } from '@/lib/utils'

type RegisterSideBannerProps = {
  className?: string
}

/**
 * Левая панель регистрации: оранжевый баннер с декоративными PNG.
 * Картинки импортируются из `src/assets`, чтобы Vite всегда отдавал корректные URL
 * (в отличие от `<img src="*.svg">` с внешними `href="/file.png"`).
 */
export function RegisterSideBanner({ className }: RegisterSideBannerProps) {
  return (
    <div
      className={cn(
        'relative min-h-screen w-full overflow-hidden bg-[#FF6720] font-["Montserrat",system-ui,sans-serif] text-white',
        className,
      )}
    >
      <img
        src={topLeftLines}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-0 top-[-8%] z-[1] h-auto w-[min(760px,96vw)] max-w-none -translate-x-[3%] select-none"
      />

      <div className="relative z-10 flex min-h-screen flex-col px-8 pb-10 pt-[clamp(2.5rem,18vh,10rem)] md:px-[min(3rem,5vw)] md:pb-12">
        {/* Размер шрифта на обёртке — чтобы сдвиг колец считался в `em` от заголовка */}
        <div className="relative text-[clamp(3rem,8vw,6rem)] leading-none">
          <h1 className="relative z-20 font-extrabold uppercase tracking-wide">NAU-SKILLS</h1>
          {/* ~0.48em ≈ половина высоты заглавной «S» в том же кегле */}
          <img
            src={bottomRightRings}
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-[46%] top-[0.04em] z-[1] h-auto w-[min(960px,155vw)] max-w-none translate-y-[0.48em] select-none md:left-[44%]"
          />
        </div>

        <div className="relative z-10 mt-6 text-[clamp(1.75rem,4vw,3.5rem)] font-bold leading-tight md:mt-8">
          <p>Карта</p>
          <p>экспертизы</p>
        </div>

        <div className="relative z-10 mt-8 max-w-xl space-y-4 pb-6 text-lg font-medium leading-relaxed md:mt-10 md:pb-10 md:text-xl">
          <p>Найдите нужного специалиста внутри компании</p>
          <p>Подтвердите навыки коллег</p>
          <p>Развивайте экспертизу вместе</p>
        </div>

        <div className="mt-auto pt-16">
          <img src={logo} alt="NAUMEN" className="h-[28px] w-auto select-none" />
        </div>
      </div>
    </div>
  )
}
