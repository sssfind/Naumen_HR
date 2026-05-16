import topLeftLines from '@/assets/register-side/top-left-lines.png'
import decorRings from '@/assets/register-side/decor-rings.png'
import decorSeam from '@/assets/register-side/decor-seam.png'

/**
 * Три PNG из макета (1920×1080). Координаты Figma, низ обрезается viewport.
 * 1. top-left-lines — белые дуги в углу (blending)
 * 2. image 2 — белые кольца: x338 y282, 622×975
 * 3. Mask group — оранжевый шов: x960 y282, 352×975
 */
export function AuthDecorLayer() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden md:block"
      aria-hidden
    >
      {/* 1. Белые дуги — левый верхний угол */}
      <img
        src={topLeftLines}
        alt=""
        className="absolute left-0 top-0 z-[2] h-auto w-[39.58vw] max-w-[760px] select-none mix-blend-screen"
      />

      {/* 2. Оранжевый шов на границе колонок */}
      <img
        src={decorSeam}
        alt=""
        className="absolute left-1/2 top-[26.111vh] z-[3] h-[90.278vh] w-[18.333vw] -translate-x-0 select-none mix-blend-screen"
        style={{ maxWidth: '352px' }}
      />

      {/* 3. Белые кольца — поверх, заходят на правую колонку */}
      <img
        src={decorRings}
        alt=""
        className="absolute left-[17.604%] top-[26.111vh] z-[4] h-[90.278vh] w-[32.396vw] max-w-[622px] select-none object-fill object-left-top mix-blend-screen"
      />
    </div>
  )
}
