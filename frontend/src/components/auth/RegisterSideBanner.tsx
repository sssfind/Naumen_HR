import logo from '@/assets/register-side/logo.png'
import { cn } from '@/lib/utils'

type RegisterSideBannerProps = {
  className?: string
}

/** Левая панель входа/регистрации (макет Figma, текст в потоке — без наложений). */
export function RegisterSideBanner({ className }: RegisterSideBannerProps) {
  return (
    <div
      className={cn(
        'auth-font-body relative z-10 flex h-full w-full flex-col justify-between bg-transparent text-white',
        className
      )}
    >
      <div className="max-w-[min(720px,92%)] pl-[13.33%] pr-6 pt-[16.67%]">
        <h1 className="auth-font-heading whitespace-nowrap text-[clamp(2rem,3.65vw,4.5rem)] uppercase leading-[1.12] tracking-wide">
          NAU-START
        </h1>

        <h2 className="mt-[clamp(3rem,10vh,6.5rem)] max-w-[420px] text-[clamp(1.65rem,2.6vw,3.125rem)] font-medium leading-[1.26]">
          Карта
          <br />
          экспертизы
        </h2>

        <div className="mt-[clamp(1.5rem,4vh,3rem)] max-w-[480px] space-y-[0.65em] text-[clamp(0.95rem,1.35vw,1.625rem)] font-medium leading-[1.45]">
          <p>Найдите нужного специалиста внутри компании</p>
          <p>Подтвердите навыки коллег</p>
          <p>Развивайте экспертизу вместе</p>
        </div>
      </div>

      <img
        src={logo}
        alt="NAUMEN"
        className="absolute bottom-[6.1%] left-[2.7%] z-10 h-5 w-auto select-none opacity-95 md:left-[26px] md:h-6"
      />
    </div>
  )
}
