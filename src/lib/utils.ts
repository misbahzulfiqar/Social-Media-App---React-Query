import type { Models } from "appwrite";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  pickPostImageId,
  pickPostImageUrl,
  pickUserBio,
  pickUserImageId,
  pickUserProfileImageUrl,
} from "@/lib/appwrite/config";
import type { IPostCreator, IPostDoc, ISaveDoc, IUserDoc } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`;
}

// 
export const multiFormatDateString = (timestamp: string = ""): string => {
  const timestampNum = Math.round(new Date(timestamp).getTime() / 1000);
  const date: Date = new Date(timestampNum * 1000);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = diff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  switch (true) {
    case Math.floor(diffInDays) >= 30:
      return formatDateString(timestamp);
    case Math.floor(diffInDays) === 1:
      return `${Math.floor(diffInDays)} day ago`;
    case Math.floor(diffInDays) > 1 && diffInDays < 30:
      return `${Math.floor(diffInDays)} days ago`;
    case Math.floor(diffInHours) >= 1:
      return `${Math.floor(diffInHours)} hours ago`;
    case Math.floor(diffInMinutes) >= 1:
      return `${Math.floor(diffInMinutes)} minutes ago`;
    default:
      return "Just now";
  }
};

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};

/** Normalize Appwrite `likes` (string ids or legacy document shapes) to user id strings. */
export function normalizePostLikes(likes: unknown): string[] {
  if (!Array.isArray(likes)) return [];
  return likes.map((item) =>
    typeof item === "string"
      ? item
      : String((item as Models.Document).$id ?? "")
  ).filter(Boolean);
}

/**
 * Appwrite usually returns `creator` as a relation **string id**, not an expanded
 * user document. Without this, feed cards render `null` and posts look "missing".
 */
export function getResolvedPostCreator(
  creator: IPostDoc["creator"]
): IPostCreator | null {
  if (creator && typeof creator === "object") {
    return creator as IPostCreator;
  }
  if (typeof creator === "string" && creator.trim()) {
    const id = creator.trim();
    return {
      $id: id,
      $sequence: "",
      $collectionId: "",
      $databaseId: "",
      $createdAt: "",
      $updatedAt: "",
      $permissions: [],
      name: "User",
    } as unknown as IPostCreator;
  }
  return null;
}

export function getPostCreatorId(post: IPostDoc | undefined): string | undefined {
  const c = post?.creator;
  if (!c) return undefined;
  return typeof c === "string" ? c : c.$id;
}

/**
 * Tables DB rows nest user columns under `data`. Collections are flat.
 * Merge so `pickPostImageUrl` / caption / tags resolve correctly.
 */
export function mergeTablesRowData(
  doc: Record<string, unknown>
): Record<string, unknown> {
  const data = doc["data"];
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const inner = data as Record<string, unknown>;
    const { data: _nested, ...rest } = doc;
    return { ...rest, ...inner };
  }
  return doc;
}

/** Map Appwrite post field names (`imgURL`, etc.) onto `imageUrl` / `imageId` for the app. */
export function normalizePostDocument(doc: Models.Document): IPostDoc {
  const flat = mergeTablesRowData(doc as unknown as Record<string, unknown>);
  return {
    ...(doc as unknown as IPostDoc),
    ...(flat as unknown as Partial<IPostDoc>),
    imageUrl: pickPostImageUrl(flat),
    imageId: pickPostImageId(flat),
  };
}

export function normalizePostDocuments(docs: Models.Document[]): IPostDoc[] {
  return docs.map(normalizePostDocument);
}

/** Normalize a Users collection document to `imageUrl` / `imageId` / `bio` for the UI. */
export function normalizeUserDocument(doc: Models.Document): IUserDoc {
  const flat = mergeTablesRowData(doc as unknown as Record<string, unknown>);
  return {
    ...(doc as unknown as IUserDoc),
    ...(flat as unknown as Partial<IUserDoc>),
    imageUrl: pickUserProfileImageUrl(flat),
    imageId: pickUserImageId(flat),
    bio: pickUserBio(flat),
  };
}

export function normalizeUserDocWithPosts(user: IUserDoc | null): IUserDoc | null {
  if (!user) return null;
  const next = { ...user };
  if (Array.isArray(next.posts)) {
    next.posts = normalizePostDocuments(
      next.posts as unknown as Models.Document[]
    );
  }
  if (Array.isArray(next.liked)) {
    next.liked = normalizePostDocuments(
      next.liked as unknown as Models.Document[]
    );
  }
  if (Array.isArray(next.save)) {
    next.save = next.save.map((row) => ({
      ...row,
      post: normalizePostDocument(row.post as unknown as Models.Document),
    })) as ISaveDoc[];
  }
  return next;
}