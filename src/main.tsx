import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import ReactDOM from 'react-dom/client'
import "@fontsource-variable/geist/wght.css"
import "./index.css"
import App from './App.tsx'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/authContext'
import { QueryProvider } from '@/lib/react-query/QueryProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(

  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <BrowserRouter>
    <QueryProvider>
    <AuthProvider>
        <App />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryProvider>
    </BrowserRouter>
  </ThemeProvider>,
)

