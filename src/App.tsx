import "./App.css"
import { Routes, Route } from "react-router-dom"
import SigninForm from "./_auth/Forms/SigninForm"
import SignupForm from "./_auth/Forms/SignupForm"
import AuthLayout from "./_auth/AuthLayout"
import RootLayout from "./_root/RootLayout"
import Home from "./_root/pages/Home"
import Explore from "./_root/pages/Explore"
import Saved from "./_root/pages/Saved"
import AllUsers from "./_root/pages/AllUsers"
import CreatePost from "./_root/pages/CreatePost"
import EditPost from "./_root/pages/EditPost"
import PostDetails from "./_root/pages/PostDetails"
import Profile from "./_root/pages/Profile"
import UpdateProfile from "./_root/pages/UpdateProfile"

function App() {
  return (
    <main className="flex h-screen min-h-0 w-screen flex-col overflow-hidden">
      <Routes>
        {/* public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SigninForm />} />
          <Route path="/signup" element={<SignupForm />} />
        </Route>

        {/* private routes */}
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
      </Routes>
    </main>
  )
}

export default App
