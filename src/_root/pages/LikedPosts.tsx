import GridPostList from "@/components/shared/GridPostList";
import { DEMO_POSTS } from "@/constants/demoFeed";
import { Loading } from "@/shared/Loading";
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";

const LikedPosts = () => {
  const { data: currentUser } = useGetCurrentUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loading />
      </div>
    );

  const liked = currentUser.liked ?? [];

  return (
    <div className="w-full space-y-6">
      {liked.length === 0 ? (
        <>
          <p className="text-light-4">No liked posts yet — sample grid below.</p>
          <GridPostList posts={DEMO_POSTS} showStats={false} />
        </>
      ) : (
        <GridPostList posts={liked} showStats={false} />
      )}
    </div>
  );
};

export default LikedPosts;