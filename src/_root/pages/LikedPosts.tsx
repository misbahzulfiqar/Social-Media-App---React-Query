import GridPostList from "@/components/shared/GridPostList";
import { useGetPostsLikedByUser } from "@/lib/react-query/queriesAndMutations";
import { Loading } from "@/shared/Loading";
import { useUserContext } from "@/context/authContext";

const LikedPosts = () => {
  const { user } = useUserContext();
  const { data, isLoading, isError } = useGetPostsLikedByUser(user.id);

  if (!user.id) {
    return (
      <p className="text-light-4 w-full text-center">
        Sign in to see liked posts.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-center w-full min-h-[200px]">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-light-4 w-full text-center">
        Could not load liked posts. Ensure the Posts collection has a string
        array attribute <code className="text-light-2">likes</code> (user
        profile ids).
      </p>
    );
  }

  const liked = data?.documents ?? [];

  if (liked.length === 0) {
    return (
      <p className="text-light-4 w-full text-center">
        No liked posts yet.
      </p>
    );
  }

  return <GridPostList posts={liked} showStats={false} />;
};

export default LikedPosts;
