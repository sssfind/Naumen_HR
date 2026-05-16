import logo from '@/assets/register-side/logo.png'
import { cn } from '@/lib/utils'

type RegisterSideBannerProps = {
  className?: string
}

/** Текст левой панели — позиции Figma 1920×1080. */
export function RegisterSideBanner({ className }: RegisterSideBannerProps) {
  return (
    <div
      className={cn(
        'auth-font-body relative z-10 h-full w-full bg-transparent text-white',
        className
      )}
    >
      <h1 className="auth-font-heading absolute left-[13.33%] top-[16.67%] max-w-[min(680px,75%)] text-[clamp(2.5rem,4.9vw,5.875rem)] uppercase leading-[1.12] tracking-wide">
        NAU-SKILLS
      </h1>

      <h2 className="absolute left-[13.33%] top-[33.89%] max-w-[420px] text-[clamp(1.65rem,2.6vw,3.125rem)] font-medium leading-[1.26]">
        Карта
        <br />
        экспертизы
      </h2>

      <div className="absolute left-[13.33%] top-[49.72%] max-w-[430px] space-y-[2.6vh] text-[clamp(0.95rem,1.35vw,1.625rem)] font-medium leading-[1.31]">
        <p>Найдите нужного специалиста внутри компании</p>
        <p>Подтвердите навыки коллег</p>
        <p>Развивайте экспертизу вместе</p>
      </div>

      <img
        src={logo}
        alt="NAUMEN"
        className="absolute bottom-[6.1%] left-[2.7%] h-7 w-auto select-none md:left-[26px] md:h-9"
      />
    </div>
  )
}
