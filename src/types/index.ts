import type { Models } from "appwrite";

/** Creator embedded on a post (Appwrite relation expanded) or raw user id string. */
export type IPostCreator = Models.Document & {
  name: string;
  username?: string;
  imageUrl?: string;
};

/** Post document from Appwrite (feed, profile, etc.). */
export type IPostDoc = Models.Document & {
  caption: string;
  imageUrl: string;
  imageId: string;
  location?: string;
  tags: string[];
  likes: string[];
  creator: IPostCreator | string;
};

/** Saved-post junction row with expanded `post` relation. */
export type ISaveDoc = Models.Document & {
  post: IPostDoc;
};

/** One saved row with the resolved post (from saves collection + post fetch). */
export type IUserSavedPostRow = {
  saveId: string;
  post: IPostDoc;
};

/** User profile document from Appwrite. */
export type IUserDoc = Models.Document & {
  name: string;
  username: string;
  email?: string;
  imageUrl?: string;
  imageId?: string;
  bio?: string;
  accountId?: string;
  posts?: IPostDoc[];
  save?: ISaveDoc[];
  liked?: IPostDoc[];
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
  location?: string;
  tags?: string;
};

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};
