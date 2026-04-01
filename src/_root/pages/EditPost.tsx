import { useParams } from "react-router-dom";

import { Loading } from "@/shared/Loading";
import PostForm from "@/components/forms/PostForm";
import { placeholderBanner } from "@/lib/placeholderImages";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";

const EditPost = () => {
  const { id } = useParams();
  const { data: post, isLoading } = useGetPostById(id);

  if (isLoading)
    return (
      <div className="flex-center h-full w-full">
        <Loading />
      </div>
    );

  if (!post)
    return (
      <div className="flex-center h-full w-full">
        <p className="text-light-4">Post not found.</p>
      </div>
    );

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="page-hero w-full">
          <img
            src={placeholderBanner("edit-post-hero")}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-dark-1/80 to-transparent" />
        </div>
        <div className="flex w-full max-w-5xl items-start justify-start gap-3">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
        </div>

        <PostForm action="Update" post={post} />
      </div>
    </div>
  );
};

export default EditPost;