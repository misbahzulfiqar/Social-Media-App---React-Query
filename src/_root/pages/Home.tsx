import { useMemo } from "react";

import { PostACard, UserCard } from "@/components/shared";
import { DEMO_CREATORS } from "@/constants/demoFeed";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { Loading } from "@/shared/Loading";
import type { IPostDoc } from "@/types";

const Home = () => {
  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();
  const {
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  const postDocuments = useMemo(() => {
    const docs = posts?.documents ?? [];
    const seen = new Set<string>();
    const out: IPostDoc[] = [];
    for (const p of docs) {
      if (seen.has(p.$id)) continue;
      seen.add(p.$id);
      out.push(p);
    }
    return out;
  }, [posts?.documents]);

  const creatorList =
    isUserLoading && !creators
      ? null
      : isErrorCreators
        ? DEMO_CREATORS
        : creators?.documents?.length
          ? creators.documents
          : DEMO_CREATORS;

  return (
    <div className="home-layout">
      <section className="home-feed-column">
        <div className="home-feed-inner">
          <h2 className="h3-bold md:h2-bold w-full text-left text-light-1">
            Home Feed
          </h2>
          {isPostLoading && !posts ? (
            <Loading />
          ) : isErrorPosts ? (
            <p className="small-medium text-light-3">
              Could not load posts. Confirm{" "}
              <code className="text-light-1">VITE_APPWRITE_POSTS_USE_TABLESDB</code>{" "}
              matches your Appwrite setup (use{" "}
              <code className="text-light-1">true</code> for Tables DB posts), and
              that your session can read the Posts collection/table.
            </p>
          ) : postDocuments.length === 0 ? (
            <p className="small-medium text-light-3">
              No posts yet. Create one from the sidebar to see it here (up to 100
              most recent posts load on Home).
            </p>
          ) : (
            <ul className="flex w-full flex-col gap-9">
              {postDocuments.map((post, index) => (
                <li key={`${post.$id}-${index}`} className="flex w-full justify-center">
                  <PostACard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <aside className="home-creators-column">
        <h3 className="h3-bold text-light-1">Top Creators</h3>
        {creatorList === null ? (
          <Loading />
        ) : (
          <ul className="home-creators-grid">
            {creatorList.map((creator) => (
              <li key={creator.$id}>
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
};

export default Home;
