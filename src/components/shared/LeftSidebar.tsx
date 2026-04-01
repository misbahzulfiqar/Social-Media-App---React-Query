import { Camera } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import type { INavLink } from "@/types";
import { sidebarLinks } from "@/constants";
import { Loading } from "@/shared/Loading";
import { Button } from "@/components/ui/button";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext, INITIAL_USER } from "@/context/authContext";
import { cn } from "@/lib/utils";
import { placeholderAvatar } from "@/lib/placeholderImages";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user, setUser, setIsAuthenticated, isLoading } = useUserContext();

  const { mutate: signOut } = useSignOutAccount();

  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate("/signin");
  };

  const profileImg =
    user.imageUrl ||
    (user.id ? placeholderAvatar(user.id) : "/assets/icons/profile-placeholder.svg");

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#4f46e5] shadow-[0_0_14px_rgba(139,92,246,0.35)]"
            aria-hidden>
            <Camera className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-lg font-bold tracking-tight text-light-1">
            Snapgram
          </span>
        </Link>

        {isLoading || !user.email ? (
          <div className="h-14">
            <Loading />
          </div>
        ) : (
          <Link
            to={`/profile/${user.id}`}
            className="flex items-center gap-3 rounded-xl py-1 transition-opacity hover:opacity-90">
            <img
              src={profileImg}
              alt="profile"
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-dark-4"
            />
            <div className="flex min-w-0 flex-col">
              <p className="truncate font-bold text-light-1">{user.name}</p>
              <p className="truncate small-regular text-light-3">
                @{user.username}
              </p>
            </div>
          </Link>
        )}

        <ul className="flex flex-col gap-1">
          {sidebarLinks.map((link: INavLink) => (
            <li key={link.label} className="leftsidebar-link">
              <NavLink
                to={link.route}
                end={link.route === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                      : "text-light-1 hover:bg-dark-3"
                  )
                }>
                {({ isActive }) => (
                  <>
                    <img
                      src={link.imgURL}
                      alt=""
                      width={22}
                      height={22}
                      className={cn(
                        "shrink-0 opacity-90",
                        isActive && "invert-white brightness-0"
                      )}
                    />
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="shad-button_ghost h-auto justify-start gap-3 rounded-xl px-4 py-3 hover:bg-dark-3"
        onClick={handleSignOut}>
        <img src="/assets/icons/logout.svg" alt="" width={22} height={22} />
        <span className="small-medium text-light-1">Logout</span>
      </Button>
    </nav>
  );
};

export default LeftSidebar;
