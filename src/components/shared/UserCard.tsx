import { Link } from "react-router-dom";

import type { IUserDoc } from "@/types";
import { Button } from "../ui/button";
import { placeholderAvatar } from "@/lib/placeholderImages";

type UserCardProps = {
  user: IUserDoc;
};

const UserCard = ({ user }: UserCardProps) => {
  const avatarSrc =
    user.imageUrl || placeholderAvatar(user.$id || user.username || "u");

  return (
    <div className="user-card">
      <Link
        to={`/profile/${user.$id}`}
        className="flex flex-col items-center gap-2 text-center">
        <img
          src={avatarSrc}
          alt=""
          className="user-card-avatar"
          loading="lazy"
        />
        <p className="line-clamp-1 text-sm font-semibold text-light-1">
          {user.name}
        </p>
        <p className="line-clamp-1 small-regular text-light-3">
          @{user.username}
        </p>
      </Link>
      <Button
        type="button"
        size="sm"
        className="mt-1 h-8 w-full max-w-[120px] rounded-full bg-primary-500 text-xs font-semibold text-white hover:bg-primary-500/90">
        Follow
      </Button>
    </div>
  );
};

export default UserCard;
