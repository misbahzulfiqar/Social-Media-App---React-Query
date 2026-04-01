import { Outlet, Navigate } from "react-router-dom";

import { useUserContext } from "@/context/authContext";

const AuthLayout = () => {
  const { isAuthenticated } = useUserContext();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="flex min-h-dvh w-full flex-col items-center overflow-y-auto bg-black px-4 py-3 sm:justify-center sm:py-5">
      <Outlet />
    </section>
  );
};

export default AuthLayout;