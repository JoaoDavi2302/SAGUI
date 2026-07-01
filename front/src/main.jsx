import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // <-- Esta é a linha que carrega o Tailwind!
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
