import { Link } from "react-router-dom";

import PostStats from "@/components/shared/PostStats";
import { PostImage } from "@/components/shared/PostImage";
import { useUserContext } from "@/context/authContext";
import { placeholderAvatar } from "@/lib/placeholderImages";
import { getResolvedPostCreator } from "@/lib/utils";
import type { IPostDoc } from "@/types";

type GridPostListProps = {
  posts: IPostDoc[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  return (
    <ul className="grid-container">
      {posts.map((post, index) => {
        const creator = getResolvedPostCreator(post.creator);

        return (
        <li key={`${post.$id}-${index}`} className="relative min-w-80 h-80">
          <Link to={`/posts/${post.$id}`} className="grid-post_link">
            <PostImage
              post={post}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              placeholderWidth={640}
              placeholderHeight={640}
            />
          </Link>

          <div className="grid-post_user">
            {showUser && creator && (
              <div className="flex items-center justify-start gap-2 flex-1">
                <img
                  src={
                    creator.imageUrl || placeholderAvatar(creator.$id)
                  }
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
                <p className="line-clamp-1">{creator.name}</p>
              </div>
            )}
            {showStats && <PostStats post={post} userId={user.id} />}
          </div>
        </li>
      );
      })}
    </ul>
  );
};

export default GridPostList;