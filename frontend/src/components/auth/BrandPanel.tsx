export function BrandPanel() {
  return (
    <div className="hidden md:flex flex-col justify-between bg-[#1A1A2E] text-white p-10 lg:p-14 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#C2410C]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-[#C2410C]/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.02]" />
        <svg
          className="absolute bottom-0 right-0 opacity-5 w-64 h-64"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="150" cy="150" r="100" stroke="white" strokeWidth="0.5" />
          <circle cx="150" cy="150" r="70" stroke="white" strokeWidth="0.5" />
          <circle cx="150" cy="150" r="40" stroke="white" strokeWidth="0.5" />
        </svg>
        <div className="absolute top-16 left-10 w-2 h-2 rounded-full bg-[#C2410C]/60" />
        <div className="absolute top-32 left-24 w-1 h-1 rounded-full bg-white/30" />
        <div className="absolute top-48 right-20 w-1.5 h-1.5 rounded-full bg-[#C2410C]/40" />
        <div className="absolute bottom-48 left-16 w-1 h-1 rounded-full bg-white/20" />
        <div className="absolute bottom-32 right-32 w-2 h-2 rounded-full bg-[#C2410C]/50" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl lg:text-4xl font-black tracking-tight text-[#C2410C] select-none">
            NAUMEN
          </span>
        </div>
        <p className="text-white/50 text-xs tracking-widest uppercase font-medium">
          Система управления знаниями
        </p>
      </div>

      <div className="relative z-10 space-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-3">
            Карта
            <br />
            <span className="text-[#C2410C]">экспертизы</span>
          </h1>
          <p className="text-white/60 text-sm lg:text-base leading-relaxed max-w-xs">
            Найдите нужного специалиста внутри компании. Подтвердите навыки коллег.
            Развивайте экспертизу вместе.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          {[
            { value: '500+', label: 'Экспертов' },
            { value: '120+', label: 'Навыков' },
            { value: '3 000+', label: 'Подтверждений' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-[#C2410C]">{value}</div>
              <div className="text-white/50 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex -space-x-2">
          {['И', 'М', 'А', 'Д'].map((initial, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-[#1A1A2E] flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: i % 2 === 0 ? '#C2410C' : '#374151',
              }}
            >
              {initial}
            </div>
          ))}
        </div>
        <p className="text-white/50 text-xs">
          Уже используют в Naumen
        </p>
      </div>
    </div>
  )
}
