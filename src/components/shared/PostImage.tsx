import { useEffect, useState } from "react";

import {
  fetchStoragePreviewBlobUrl,
  getPostDisplayImageUrl,
} from "@/lib/appwrite/api";
import { placeholderPostImage } from "@/lib/placeholderImages";
import type { IPostDoc } from "@/types";

/** Extract storage file id from an Appwrite preview/view URL (when `imageId` is missing). */
export function fileIdFromAppwriteStorageUrl(url: string): string | null {
  try {
    const m = url.match(/\/files\/([^/]+)\/(?:preview|view)(?:\?|$)/);
    if (!m?.[1]) return null;
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

type PostImageProps = {
  post: Pick<IPostDoc, "$id" | "imageUrl" | "imageId">;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** Grid tiles use larger placeholder dimensions. */
  placeholderWidth?: number;
  placeholderHeight?: number;
};

/**
 * Renders post media using an authenticated Appwrite fetch when needed so private
 * buckets work. Falls back to stored URL (e.g. external) or a placeholder.
 */
export function PostImage({
  post,
  alt,
  className,
  loading = "lazy",
  placeholderWidth,
  placeholderHeight,
}: PostImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const placeholder = placeholderPostImage(
      post.$id,
      placeholderWidth ?? 900,
      placeholderHeight ?? 600
    );

    const storedUrl = getPostDisplayImageUrl(post).trim();
    const idFromField = post.imageId?.trim() ?? "";
    const idFromUrl = storedUrl ? fileIdFromAppwriteStorageUrl(storedUrl) : "";
    const storageFileId = idFromField || idFromUrl;

    const run = async () => {
      if (storageFileId) {
        const blobUrl = await fetchStoragePreviewBlobUrl(storageFileId);
        if (cancelled) return;
        if (blobUrl) {
          objectUrl = blobUrl;
          setSrc(blobUrl);
          return;
        }
      }

      if (cancelled) return;

      if (storedUrl) {
        setSrc(storedUrl);
        return;
      }

      setSrc(placeholder);
    };

    void run();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [
    post.$id,
    post.imageId,
    post.imageUrl,
    placeholderWidth,
    placeholderHeight,
  ]);

  const fallback = placeholderPostImage(
    post.$id,
    placeholderWidth ?? 900,
    placeholderHeight ?? 600
  );

  return (
    <img
      src={src ?? fallback}
      alt={alt}
      className={className}
      loading={loading}
    />
  );
}
