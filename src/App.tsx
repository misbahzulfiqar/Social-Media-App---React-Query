import './App.css'
import { Routes, Route } from 'react-router-dom'
import SigninForm from './_auth/Forms/SigninForm'
import SignupForm from './_auth/Forms/SignupForm'
import Home from './_auth/Forms/SigninForm'
import AuthLayout from './_auth/AuthLayout'
import RootLayout from './_root/RootLayout'

function App() {
  return (
    <main className='flex h-screen w-screen flex-col'>
      <Routes>
        {/* public routes */}
        <Route element={<AuthLayout />}>
          <Route path='/signin' element={<SigninForm />} />
          <Route path='/signup' element={<SignupForm />} />
        </Route>

        {/* private routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </main>
  )
}

export default App
