import { cn } from '@/lib/utils'

export const authFieldClass = (hasError?: boolean) =>
  cn(
    'h-11 rounded-[12px] border-2 border-transparent bg-[#EAEAEA] text-sm text-black placeholder:text-gray-500 md:h-12 md:text-base',
    'focus-visible:border-[#FF6720] focus-visible:ring-0 focus-visible:ring-offset-0',
    hasError && 'border-red-500 focus-visible:border-red-500'
  )

export const authLabelClass = 'text-sm font-normal text-black md:text-base'

export const authSubmitClass =
  'h-11 w-full rounded-[12px] bg-[#FF6720] text-sm font-medium text-white hover:bg-[#EA580C] md:h-12 md:text-base'

export const authFooterLinkClass =
  'text-[#FF6720] font-medium hover:text-[#EA580C] hover:underline'
