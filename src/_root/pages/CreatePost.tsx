import PostForm from "@/components/forms/PostForm";
import { placeholderBanner } from "@/lib/placeholderImages";

const CreatePost = () => {
  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="page-hero w-full">
          <img
            src={placeholderBanner("create-hero")}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/25 to-transparent" />
        </div>
        <div className="flex w-full max-w-5xl items-start justify-start gap-3">
          <img
            src="/assets/icons/add-post.svg"
            width={36}
            height={36}
            alt="add"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Create Post</h2>
        </div>

        <PostForm action="Create" />
      </div>
    </div>
  );
};

export default CreatePost;