import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {Toaster} from 'sonner'
import GlobalState from './context/Store.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GlobalState>
      <App />
      <Toaster/>
    </GlobalState>
  </BrowserRouter>,
)
