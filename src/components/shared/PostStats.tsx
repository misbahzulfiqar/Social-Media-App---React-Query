import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { checkIsLiked, normalizePostLikes } from "@/lib/utils";
import {
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useGetUserSavedPosts,
} from "@/lib/react-query/queriesAndMutations";
import { toast } from "sonner";

import type { IPostDoc } from "@/types";

type PostStatsProps = {
  post: IPostDoc;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const location = useLocation();
  const likesList = normalizePostLikes(post.likes);

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLikes(normalizePostLikes(post.likes));
  }, [post.likes]);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const { data: savedRows = [] } = useGetUserSavedPosts(userId);
  const savedRow = savedRows.find((row) => row.post.$id === post.$id);

  useEffect(() => {
    setIsSaved(!!savedRow);
  }, [savedRow]);

  const handleLikePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    let likesArray = [...likes];

    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((Id) => Id !== userId);
    } else {
      likesArray.push(userId);
    }

    const previousLikes = likes;
    setLikes(likesArray);
    likePost(
      { postId: post.$id, likesArray },
      {
        onError: () => {
          setLikes(previousLikes);
          toast.error("Could not update like. Please try again.");
        },
      }
    );
  };

  const handleSavePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (savedRow) {
      setIsSaved(false);
      return deleteSavePost(savedRow.saveId);
    }

    savePost({ userId: userId, postId: post.$id });
    setIsSaved(true);
  };

  const handleSharePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post.$id}`;
    const title =
      typeof post.caption === "string" ? post.caption.slice(0, 120) : "Post";
    void (async () => {
      try {
        if (navigator.share) {
          await navigator.share({ title, url });
        } else {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard");
        }
      } catch {
        /* user dismissed share sheet or clipboard denied */
      }
    })();
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  return (
    <div
      className={`flex justify-between items-center z-20 ${containerStyles}`}>
      <div className="flex gap-2 mr-5">
        <img
          src={`${
            checkIsLiked(likes, userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }`}
          alt="like"
          width={20}
          height={20}
          onClick={(e) => handleLikePost(e)}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      <div className="flex gap-2 items-center">
        <img
          src="/assets/icons/share.svg"
          alt="Share"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={(e) => handleSharePost(e)}
        />
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt={isSaved ? "Remove save" : "Save"}
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={(e) => handleSavePost(e)}
        />
      </div>
    </div>
  );
};

export default PostStats;