import "./App.css";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import SigninForm from "./_auth/Forms/SigninForm";
import SignupForm from "./_auth/Forms/SignupForm";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import Home from "./_root/pages/Home";
import Explore from "./_root/pages/Explore";
import Saved from "./_root/pages/Saved";
import AllUsers from "./_root/pages/AllUsers";
import CreatePost from "./_root/pages/CreatePost";
import EditPost from "./_root/pages/EditPost";
import PostDetails from "./_root/pages/PostDetails";
import Profile from "./_root/pages/Profile";
import UpdateProfile from "./_root/pages/UpdateProfile";
import DeploymentDebug from "./_root/pages/DeploymentDebug";
import { useUserContext } from "@/context/authContext";
import { Loading } from "@/shared/Loading";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { isAuthReady } = useUserContext();

  if (!isAuthReady) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-3 bg-dark-1 px-6 text-center text-light-1">
        <Loading />
        <p className="max-w-sm text-sm text-light-3">Checking your session…</p>
      </div>
    );
  }

  return <>{children}</>;
}

function PrivateRoute() {
  const { isAuthenticated } = useUserContext();
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  return <Outlet />;
}

function CatchAll() {
  const { isAuthenticated } = useUserContext();
  return <Navigate to={isAuthenticated ? "/" : "/signin"} replace />;
}

/** Main app: auth bootstrap + protected routes. */
function MainApp() {
  return (
    <AuthBootstrap>
      <main className="flex h-screen min-h-0 w-screen flex-col overflow-hidden">
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SigninForm />} />
            <Route path="/signup" element={<SignupForm />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route element={<RootLayout />}>
              <Route index element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/all-users" element={<AllUsers />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/update-post/:id" element={<EditPost />} />
              <Route path="/posts/:id" element={<PostDetails />} />
              <Route path="/profile/:id/*" element={<Profile />} />
              <Route path="/update-profile/:id" element={<UpdateProfile />} />
            </Route>
          </Route>

          <Route path="*" element={<CatchAll />} />
        </Routes>
      </main>
    </AuthBootstrap>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/deployment-debug" element={<DeploymentDebug />} />
      <Route path="*" element={<MainApp />} />
    </Routes>
  );
}

export default App;
