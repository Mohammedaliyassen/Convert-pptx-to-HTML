import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './story-engine/builder/theme.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
