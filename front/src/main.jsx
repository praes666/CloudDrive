import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Mainpage from './components/mainpage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Mainpage/>
  </StrictMode>
)
