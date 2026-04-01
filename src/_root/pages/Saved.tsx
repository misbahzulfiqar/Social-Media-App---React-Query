import { GridPostList } from "@/components/shared";
import {
  useGetCurrentUser,
  useGetUserSavedPosts,
} from "@/lib/react-query/queriesAndMutations";
import { placeholderBanner } from "@/lib/placeholderImages";
import { Loading } from "@/shared/Loading";

const Saved = () => {
  const { data: currentUser } = useGetCurrentUser();
  const profileId = currentUser?.$id;
  const { data: savedRows, isLoading: isSavedLoading } =
    useGetUserSavedPosts(profileId);

  const savePosts = savedRows?.map((row) => row.post) ?? [];

  return (
    <div className="saved-container">
      <div className="page-hero w-full">
        <img
          src={placeholderBanner("saved-hero")}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-1/85 to-transparent" />
      </div>
      <div className="flex w-full gap-2">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {!currentUser ? (
        <Loading />
      ) : isSavedLoading ? (
        <Loading />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savePosts.length === 0 ? (
            <p className="text-light-4 w-full text-center">
              No saved posts yet.
            </p>
          ) : (
            <GridPostList posts={savePosts} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default Saved;
