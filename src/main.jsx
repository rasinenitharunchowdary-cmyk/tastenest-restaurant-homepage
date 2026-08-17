import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-700.css'
import '@fontsource/barlow-condensed/latin-800.css'
import 'lenis/dist/lenis.css'
import HomeFour from './HomeFour.jsx'
import './home-four.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HomeFour />
  </StrictMode>,
)
