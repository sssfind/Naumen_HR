import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ALL_ACHIEVEMENT_IMAGE_URLS } from '@/components/profile/achievementItems'
import { preloadImages } from '@/lib/imageCache'
import { App } from './App'
import './index.css'
import './styles/auth-fonts.css'

preloadImages(ALL_ACHIEVEMENT_IMAGE_URLS)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
