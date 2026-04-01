import { useParams, Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Loading } from "@/shared/Loading";
import GridPostList from "@/components/shared/GridPostList";
import PostStats from "@/components/shared/PostStats";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
} from "@/lib/react-query/queriesAndMutations";
import {
  getPostCreatorId,
  getResolvedPostCreator,
  multiFormatDateString,
} from "@/lib/utils";
import { useUserContext } from "@/context/authContext";
import { PostImage } from "@/components/shared/PostImage";
import { placeholderAvatar } from "@/lib/placeholderImages";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  const { data: post, isLoading } = useGetPostById(id);
  const creatorId = getPostCreatorId(post);
  const { data: userPosts, isLoading: isUserPostLoading } =
    useGetUserPosts(creatorId);
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  const creator = post ? getResolvedPostCreator(post.creator) : null;

  const handleDeletePost = () => {
    if (!post?.imageId) return;
    deletePost({ postId: id, imageId: post.imageId });
    navigate(-1);
  };

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loading />
      ) : !creator ? (
        <p className="body-medium text-light-1 p-4">Post creator unavailable.</p>
      ) : (
        <div className="post_details-card">
          <PostImage
            post={post}
            alt=""
            className="post_details-img"
            loading="eager"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${creator.$id}`}
                className="flex items-center gap-3">
                <img
                  src={
                    creator.imageUrl?.trim() ||
                    placeholderAvatar(creator.$id)
                  }
                  alt=""
                  className="h-8 w-8 rounded-full object-cover lg:h-12 lg:w-12"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post.$createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  to={`/update-post/${post.$id}`}
                  className={`${user.id !== creator.$id && "hidden"}`}>
                  <img
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ost_details-delete_btn ${
                    user.id !== creator.$id && "hidden"
                  }`}>
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post.caption}</p>
              <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                {(post.tags ?? []).map((tag: string, index: number) => (
                  <li
                    key={`${tag}${index}`}
                    className="small-regular font-medium text-primary-500">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loading />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;