import type { LucideIcon } from 'lucide-react'

export interface DashboardFeatureCard {
  icon: LucideIcon
  title: string
  description: string
  iconColorClassName: string
  iconBackgroundClassName: string
}

interface DashboardFeatureCardsProps {
  items: DashboardFeatureCard[]
}

export function DashboardFeatureCards({ items }: DashboardFeatureCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, title, description, iconColorClassName, iconBackgroundClassName }) => (
        <div
          key={title}
          className="group cursor-pointer rounded-xl border border-[#252525]/12 bg-[#FFFFFF] p-6 shadow-sm transition-all duration-200 hover:border-[#FF6720] hover:shadow-md"
        >
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${iconBackgroundClassName}`}
          >
            <Icon className={`${iconColorClassName} h-6 w-6`} />
          </div>
          <h3 className="mb-1 font-semibold text-[#252525]">{title}</h3>
          <p className="text-sm text-[#252525]/60">{description}</p>
        </div>
      ))}
    </div>
  )
}
