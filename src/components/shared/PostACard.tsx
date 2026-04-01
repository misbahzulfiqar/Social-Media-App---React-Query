import { Link } from "react-router-dom";

import PostStats from "@/components/shared/PostStats";
import { useUserContext } from "@/context/authContext";
import { PostImage } from "@/components/shared/PostImage";
import { getResolvedPostCreator, multiFormatDateString } from "@/lib/utils";
import { placeholderAvatar } from "@/lib/placeholderImages";
import type { IPostDoc } from "@/types";

export type PostACardProps = {
  post: IPostDoc;
};

export function PostACard({ post }: PostACardProps) {
  const { user } = useUserContext();

  const creator = getResolvedPostCreator(post.creator);
  if (!creator) {
    return null;
  }

  const avatarSrc =
    creator.imageUrl || placeholderAvatar(creator.$id || "creator");
  return (
    <article className="post-card">
      <div className="flex-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link to={`/profile/${creator.$id}`} className="shrink-0">
            <img
              src={avatarSrc}
              alt={creator.name ? `${creator.name}'s avatar` : "User avatar"}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-dark-4 md:h-12 md:w-12"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <Link to={`/profile/${creator.$id}`}>
              <p className="truncate base-medium font-bold text-light-1 md:text-base lg:body-bold">
                {creator.name}
              </p>
            </Link>
            <div className="flex flex-wrap items-center gap-1.5 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString(post.$createdAt)}
              </p>
              <span className="text-light-4">•</span>
              <p className="subtle-semibold lg:small-regular">
                {post.location ?? "Somewhere"}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/update-post/${post.$id}`}
          className={`shrink-0 ${user.id !== creator.$id ? "hidden" : ""}`}>
          <img src="/assets/icons/edit.svg" alt="Edit" width={20} height={20} />
        </Link>
      </div>

      <Link to={`/posts/${post.$id}`} className="block">
        <div className="small-medium text-light-1 lg:base-medium">
          <p className="leading-relaxed">{post.caption ?? ""}</p>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {(post.tags ?? []).map((tag: string, index: number) => (
              <li
                key={`${tag}-${index}`}
                className="small-regular font-medium text-primary-500">
                #{tag}
              </li>
            ))}
          </ul>
        </div>

        <PostImage
          post={post}
          alt={post.caption?.trim() ? post.caption.slice(0, 120) : "Post image"}
          className="post-card_img mt-4"
          loading="lazy"
        />
      </Link>

      <div className="post-card-actions">
        <PostStats post={post} userId={user.id} />
      </div>
    </article>
  );
}
