import { cn } from '@/lib/utils'

export const authFieldClass = (hasError?: boolean) =>
  cn(
    'h-12 rounded-[15px] border-2 border-transparent bg-[#EAEAEA] text-base text-black placeholder:text-gray-500',
    'focus-visible:border-[#FF6720] focus-visible:ring-0 focus-visible:ring-offset-0',
    hasError && 'border-red-500 focus-visible:border-red-500'
  )

export const authLabelClass = 'text-base font-normal text-black md:text-xl'

export const authSubmitClass =
  'h-12 w-full rounded-[15px] bg-[#FF6720] text-base font-medium text-white hover:bg-[#EA580C] md:h-[68px] md:text-xl'

export const authFooterLinkClass =
  'text-[#FF6720] font-medium hover:text-[#EA580C] hover:underline'
