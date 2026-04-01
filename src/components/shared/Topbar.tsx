import { Camera } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { useUserContext } from "@/context/authContext";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { placeholderAvatar } from "@/lib/placeholderImages";

const Topbar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  const profileImg =
    user.imageUrl ||
    (user.id ? placeholderAvatar(user.id) : "/assets/icons/profile-placeholder.svg");

  return (
    <header className="topbar">
      <div className="flex-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#4f46e5]"
            aria-hidden>
            <Camera className="h-[14px] w-[14px] text-white" strokeWidth={2} />
          </div>
          <span className="text-base font-bold tracking-tight text-light-1">
            Snapgram
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shad-button_ghost size-9"
            onClick={() => signOut()}>
            <img src="/assets/icons/logout.svg" alt="Logout" width={20} height={20} />
          </Button>
          <Link to={`/profile/${user.id}`} className="flex-center">
            <img
              src={profileImg}
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-2 ring-dark-4"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
