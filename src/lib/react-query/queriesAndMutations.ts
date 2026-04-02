import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import type { Models } from "appwrite";

import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import {
  createUserAccount,
  signInAccount,
  getCurrentUser,
  signOutAccount,
  getUsers,
  createPost,
  getPostById,
  updatePost,
  getUserPosts,
  deletePost,
  likePost,
  getUserById,
  updateUser,
  getRecentPosts,
  getInfinitePosts,
  searchPosts,
  savePost,
  deleteSavedPost,
  getUserSavedPosts,
  getPostsLikedByUser,
} from "@/lib/appwrite/api";
import type {
  INewPost,
  INewUser,
  IPostDoc,
  IUpdatePost,
  IUpdateUser,
  IUserDoc,
} from "@/types";
import {
  normalizePostDocument,
  normalizePostDocuments,
  normalizeUserDocument,
  normalizeUserDocWithPosts,
} from "@/lib/utils";

const INFINITE_POSTS_PAGE_SIZE = 9;

type InfinitePostsPage = Models.DocumentList<IPostDoc>;

// ============================================================
// AUTH QUERIES
// ============================================================

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

// ============================================================
// POST QUERIES
// ============================================================

export const useGetUserSavedPosts = (userProfileDocId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_SAVED_POSTS, userProfileDocId],
    queryFn: () => getUserSavedPosts(userProfileDocId),
    enabled: !!userProfileDocId?.trim(),
  });
};

export const useGetPosts = () => {
  return useInfiniteQuery<
    InfinitePostsPage,
    Error,
    InfiniteData<InfinitePostsPage>,
    string[],
    string | undefined
  >({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const page = await getInfinitePosts({ pageParam });
      if (!page) throw new Error("Failed to load posts");
      return {
        ...page,
        documents: normalizePostDocuments(page.documents),
      };
    },
    getNextPageParam: (lastPage) => {
      const docs = lastPage?.documents;
      if (!docs?.length) return undefined;
      if (docs.length < INFINITE_POSTS_PAGE_SIZE) return undefined;
      return docs[docs.length - 1].$id;
    },
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: async () => {
      const res = await searchPosts(searchTerm);
      if (!res) return res;
      return {
        ...res,
        documents: normalizePostDocuments(res.documents),
      };
    },
    enabled: !!searchTerm,
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: async () => {
      const res = await getRecentPosts();
      if (!res) throw new Error("Failed to load posts");
      return {
        ...res,
        documents: normalizePostDocuments(res.documents),
      };
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });
    },
  });
};

export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: async () => {
      const doc = await getPostById(postId);
      return doc ? normalizePostDocument(doc) : undefined;
    },
    enabled: !!postId,
  });
};

export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: async () => {
      const res = await getUserPosts(userId);
      if (!res) return res;
      return {
        ...res,
        documents: normalizePostDocuments(res.documents),
      };
    },
    enabled: !!userId,
  });
};

export const useGetPostsLikedByUser = (userProfileDocId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_LIKED_POSTS, userProfileDocId],
    queryFn: async () => {
      const res = await getPostsLikedByUser(userProfileDocId);
      if (!res) {
        return { total: 0, documents: [] as IPostDoc[] };
      }
      return {
        ...res,
        documents: normalizePostDocuments(res.documents),
      };
    },
    enabled: !!userProfileDocId?.trim(),
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_LIKED_POSTS],
      });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_LIKED_POSTS],
      });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_SAVED_POSTS],
      });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_SAVED_POSTS],
      });
    },
  });
};

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: async () =>
      normalizeUserDocWithPosts((await getCurrentUser()) as IUserDoc | null),
  });
};

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: async () => {
      const res = await getUsers(limit);
      if (!res) return res;
      return {
        ...res,
        documents: res.documents as unknown as IUserDoc[],
      };
    },
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: async () => {
      const doc = await getUserById(userId);
      return doc ? normalizeUserDocument(doc) : undefined;
    },
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USERS],
      });
    },
  });
};