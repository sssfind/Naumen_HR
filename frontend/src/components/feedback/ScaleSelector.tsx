import { cn } from '@/lib/utils'

interface ScaleSelectorProps {
  label: string
  hint?: string
  minHint?: string
  maxHint?: string
  value: number | null
  onChange: (value: number) => void
}

export function ScaleSelector({
  label,
  hint,
  minHint,
  maxHint,
  value,
  onChange,
}: ScaleSelectorProps) {
  const options = [1, 2, 3, 4, 5] as const

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-[#1A1A2E]">{label}</legend>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold transition-colors',
              value === n
                ? 'border-primary bg-orange-50 text-primary'
                : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {(minHint || maxHint) && (
        <div className="flex justify-between gap-4 text-xs text-gray-500">
          {minHint && <span className="max-w-[45%]">1 — {minHint}</span>}
          {maxHint && <span className="max-w-[45%] text-right">5 — {maxHint}</span>}
        </div>
      )}
    </fieldset>
  )
}
