import {
  AppwriteException,
  ID,
  Permission,
  Query,
  Role,
} from "appwrite";
import type { Models } from "appwrite";

import {
  appwriteConfig,
  account,
  client,
  databases,
  avatars,
  userCollectionImageAttr,
  userCollectionImageIdAttr,
  userCollectionBioAttr,
  postsUseTablesDb,
  postImageWritePayload,
  storage,
  tablesDb,
} from "./config";
import type {
  INewPost,
  INewUser,
  IPostDoc,
  IUpdatePost,
  IUpdateUser,
  IUserSavedPostRow,
} from "@/types";
import { normalizePostDocument } from "@/lib/utils";

/**
 * Row/file-level permissions for new posts, files, and profile rows when
 * row/document security is enabled. Always send a non-empty array — omitting it
 * triggers "No permissions provided for action 'create'" on many projects.
 *
 * Uses Appwrite **Account** id from `account.get().$id`, not your Users collection `$id`.
 */
function ownedResourcePermissions(accountUserId: string): string[] {
  if (!accountUserId?.trim()) {
    throw new AppwriteException(
      "Not signed in correctly (missing account id). Sign out and sign in again.",
      401,
      "user_unauthorized",
      ""
    );
  }
  return [
    Permission.read(Role.any()),
    Permission.update(Role.user(accountUserId)),
    Permission.delete(Role.user(accountUserId)),
  ];
}

function isSessionCreationConflict(error: unknown): boolean {
  if (!(error instanceof AppwriteException)) return false;
  const m = error.message.toLowerCase();
  return (
    m.includes("session is active") ||
    m.includes("session is prohibited") ||
    m.includes("prohibited when a session") ||
    (m.includes("prohibited") && m.includes("session"))
  );
}

/**
 * Creates an email/password session. If Appwrite already has a session for this
 * client (another tab, previous user, or duplicate attempt), clears the
 * current session once and retries so sign-in and sign-up always get exactly
 * one session for the requested credentials.
 */
async function ensureEmailPasswordSession(user: {
  email: string;
  password: string;
}) {
  try {
    return await account.createEmailPasswordSession(user.email, user.password);
  } catch (error) {
    if (!isSessionCreationConflict(error)) throw error;
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch {
      /* ignore: no session or already cleared */
    }
    return await account.createEmailPasswordSession(user.email, user.password);
  }
}

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  const newAccount = await account.create(
    ID.unique(),
    user.email,
    user.password,
    user.name
  );

  if (!newAccount) throw new Error("Account creation failed");

  // Auth user must exist first (`account.create`). Then one session so database
  // rules can allow `createDocument`. Profile row is written immediately after.
  await ensureEmailPasswordSession({
    email: user.email,
    password: user.password,
  });

  const avatarUrl = avatars.getInitials(user.name);

  try {
    return await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });
  } catch (error) {
    // Profile write failed but Auth + session exist — clear session so the user
    // is not half-signed-in and can retry signup/login after fixing schema/env.
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch {
      /* ignore */
    }
    throw error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL | string;
  username?: string;
}) {
  const data: Record<string, string> = {
    accountId: user.accountId,
    email: user.email,
    name: user.name,
  };
  if (user.username !== undefined && user.username !== "") {
    data.username = user.username;
  }
  const imageKey = userCollectionImageAttr;
  if (imageKey) {
    data[imageKey] = typeof user.imageUrl === "string" ? user.imageUrl : user.imageUrl.toString();
  }

  const profilePerms = ownedResourcePermissions(user.accountId);

  try {
    return await databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      documentId: ID.unique(),
      data,
      permissions: profilePerms,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== SIGN IN
/** Email/password login (see `ensureEmailPasswordSession` for session conflicts). */
export async function signInAccount(user: { email: string; password: string }) {
  try {
    return await ensureEmailPasswordSession(user);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

// // ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

function rowsToDocuments(rows: Models.Row[]): Models.Document[] {
  return rows as unknown as Models.Document[];
}

/** List posts whether they live in a legacy collection or Tables DB. */
async function listPostsWithQueries(
  queries: string[]
): Promise<Models.DocumentList<Models.Document>> {
  if (postsUseTablesDb) {
    const res = await tablesDb.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.postCollectionId,
      queries,
    });
    return {
      total: res.total,
      documents: rowsToDocuments(res.rows) as Models.Document[],
    };
  }
  return databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    queries
  );
}

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  let uploadedFileId: string | null = null;

  try {
    const sessionUser = await account.get();

    if (!post.userId?.trim()) {
      throw new AppwriteException(
        "Your profile is not loaded. Sign out, sign in again, then create the post.",
        400,
        "general_argument_invalid",
        ""
      );
    }

    const perms = ownedResourcePermissions(sessionUser.$id);

    let uploadedFile;
    try {
      uploadedFile = await uploadFile(post.file[0], perms);
    } catch (err) {
      const msg = err instanceof AppwriteException ? err.message : String(err);
      throw new AppwriteException(
        `Image upload failed: ${msg}. Check Storage bucket permissions (Users → Create) and file security settings.`,
        err instanceof AppwriteException ? err.code : 0,
        err instanceof AppwriteException ? err.type : "storage_error",
        err instanceof AppwriteException ? err.response : ""
      );
    }
    uploadedFileId = uploadedFile.$id;

    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw new Error("Could not build image file URL.");
    }

    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const postPayload = {
      creator: post.userId,
      caption: post.caption,
      location: post.location,
      tags: tags,
      ...postImageWritePayload(fileUrl, uploadedFile.$id),
    };

    let newPost;
    try {
      if (postsUseTablesDb) {
        newPost = await tablesDb.createRow({
          databaseId: appwriteConfig.databaseId,
          tableId: appwriteConfig.postCollectionId,
          rowId: ID.unique(),
          data: postPayload,
          permissions: perms,
        });
      } else {
        newPost = await databases.createDocument({
          databaseId: appwriteConfig.databaseId,
          collectionId: appwriteConfig.postCollectionId,
          documentId: ID.unique(),
          data: postPayload,
          permissions: perms,
        });
      }
    } catch (err) {
      const msg = err instanceof AppwriteException ? err.message : String(err);
      throw new AppwriteException(
        `Create post record failed: ${msg}. If this is a **Table** (not a legacy collection), set VITE_APPWRITE_POSTS_USE_TABLESDB=true in .env. Otherwise enable Create for Users on the Posts collection and row permissions.`,
        err instanceof AppwriteException ? err.code : 0,
        err instanceof AppwriteException ? err.type : "database_error",
        err instanceof AppwriteException ? err.response : ""
      );
    }

    return newPost;
  } catch (error) {
    console.error(error);
    if (uploadedFileId) {
      try {
        await deleteFile(uploadedFileId);
      } catch {
        /* ignore cleanup failure */
      }
    }
    throw error;
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File, permissions?: string[]) {
  const session = await account.get();
  const perms = permissions ?? ownedResourcePermissions(session.$id);

  return storage.createFile({
    bucketId: appwriteConfig.storageId,
    fileId: ID.unique(),
    file,
    permissions: perms,
  });
}

// ============================== GET FILE URL
/**
 * Public URL for a stored file **without** image transformations.
 * Uses `getFileView` (not `getFilePreview`) so free Appwrite Cloud plans work;
 * previews with width/height/quality require a paid “image transformations” plan.
 */
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

/** Prefer stored URL; if missing, build a view URL from `imageId` (storage). */
export function getPostDisplayImageUrl(
  post: Pick<IPostDoc, "imageUrl" | "imageId" | "$id">
): string {
  const fromUrl = post.imageUrl?.trim();
  if (fromUrl) return fromUrl;
  const id = post.imageId?.trim();
  if (!id) return "";
  return getFilePreview(id) ?? "";
}

/**
 * Load file bytes with the Appwrite client session (`X-Appwrite-Session`).
 * Uses **view** URLs (no transformations) for compatibility with free plans.
 */
export async function fetchStoragePreviewBlobUrl(
  fileId: string
): Promise<string | null> {
  const id = fileId?.trim();
  if (!id || !appwriteConfig.storageId?.trim()) return null;

  try {
    const url = new URL(storage.getFileView(appwriteConfig.storageId, id));
    const buf = await client.call("GET", url, {}, {}, "arrayBuffer");
    if (!(buf instanceof ArrayBuffer) || buf.byteLength === 0) return null;
    return URL.createObjectURL(new Blob([buf]));
  } catch (e) {
    console.error(e);
    return null;
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await listPostsWithQueries([
      Query.search("caption", searchTerm),
    ]);

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({
  pageParam,
}: {
  pageParam?: string;
}) {
  const queries: string[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam));
  }

  try {
    const posts = await listPostsWithQueries(queries);

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    if (postsUseTablesDb) {
      const row = await tablesDb.getRow({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.postCollectionId,
        rowId: postId,
      });
      return row as unknown as Models.Document;
    }
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl as unknown as URL, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const updatedPost = await databases.updateDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.postCollectionId,
      documentId: post.postId,
      data: {
        caption: post.caption,
        location: post.location,
        tags: tags,
        ...postImageWritePayload(
          typeof image.imageUrl === "string"
            ? image.imageUrl
            : String(image.imageUrl),
          image.imageId
        ),
      },
    });

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}
// ============================== GET USER SAVED POSTS (saves collection)
export async function getUserSavedPosts(
  userProfileDocId: string | undefined
): Promise<IUserSavedPostRow[]> {
  if (!userProfileDocId?.trim()) return [];
  if (!appwriteConfig.savesCollectionId?.trim()) return [];

  try {
    const saves = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [
        Query.equal("user", userProfileDocId.trim()),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]
    );

    const rows: IUserSavedPostRow[] = [];
    const seenPostIds = new Set<string>();
    for (const save of saves.documents) {
      const raw = save as unknown as Record<string, unknown>;
      const postRef = raw["post"];
      let postDoc: Models.Document | null | undefined = null;
      if (typeof postRef === "string" && postRef.trim()) {
        postDoc = await getPostById(postRef.trim());
      } else if (
        postRef &&
        typeof postRef === "object" &&
        "$id" in (postRef as object)
      ) {
        postDoc = postRef as Models.Document;
      }
      if (postDoc) {
        const post = normalizePostDocument(postDoc);
        if (seenPostIds.has(post.$id)) continue;
        seenPostIds.add(post.$id);
        rows.push({
          saveId: save.$id,
          post,
        });
      }
    }
    return rows;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await listPostsWithQueries([
      Query.equal("creator", userId),
      Query.orderDesc("$createdAt"),
    ]);

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await listPostsWithQueries([
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    const data: Record<string, string> = {
      name: user.name,
    };
    if (userCollectionImageAttr) {
      data[userCollectionImageAttr] =
        typeof image.imageUrl === "string"
          ? image.imageUrl
          : String(image.imageUrl);
    }
    if (userCollectionImageIdAttr) {
      data[userCollectionImageIdAttr] = image.imageId;
    }
    if (userCollectionBioAttr) {
      data[userCollectionBioAttr] = user.bio ?? "";
    }

    const updatedUser = await databases.updateDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      documentId: user.userId,
      data,
    });

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}