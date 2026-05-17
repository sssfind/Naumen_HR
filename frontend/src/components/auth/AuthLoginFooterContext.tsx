import { createContext, useContext, type ReactNode } from 'react'

type AuthLoginFooterContextValue = {
  setFooter: (node: ReactNode | null) => void
}

export const AuthLoginFooterContext = createContext<AuthLoginFooterContextValue | null>(null)

export function useAuthLoginFooter() {
  const ctx = useContext(AuthLoginFooterContext)
  if (!ctx) {
    throw new Error('useAuthLoginFooter must be used within AuthPageLayout')
  }
  return ctx
}
