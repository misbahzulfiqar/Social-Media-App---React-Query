import { useEffect } from "react";
import { toast } from "sonner";

import { UserCard } from "@/components/shared";
import { DEMO_CREATORS } from "@/constants/demoFeed";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { placeholderBanner } from "@/lib/placeholderImages";
import { Loading } from "@/shared/Loading";

const AllUsers = () => {
  const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();

  useEffect(() => {
    if (isErrorCreators) {
      toast.error("Something went wrong.");
    }
  }, [isErrorCreators]);

  const list =
    isLoading && !creators
      ? null
      : isErrorCreators || !creators?.documents?.length
        ? DEMO_CREATORS
        : creators.documents;

  return (
    <div className="common-container">
      <div className="page-hero w-full">
        <img
          src={placeholderBanner("people-hero")}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-1/90 to-transparent" />
      </div>
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold w-full text-left text-light-1">
          All Users
        </h2>
        {list === null ? (
          <Loading />
        ) : (
          <ul className="user-grid">
            {list.map((creator) => (
              <li key={creator.$id} className="min-w-0">
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
