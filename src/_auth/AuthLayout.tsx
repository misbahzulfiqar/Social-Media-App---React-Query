import { Outlet, Navigate } from 'react-router-dom'

const AuthLyout = () => {
  const isAuthenticated = false
  return (
    <>
      {isAuthenticated ? (
        <Navigate to='/' />
      ) : (
        <section className="flex min-h-dvh w-full flex-col items-center overflow-y-auto bg-black px-4 py-3 sm:justify-center sm:py-5">
          <Outlet />
        </section>
      )}
    </>
  )
}

export default AuthLyout