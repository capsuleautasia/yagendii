import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { InstallPwaBanner } from './components/InstallPwaBanner'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <InstallPwaBanner />
  </StrictMode>,
)
