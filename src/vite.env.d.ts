/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Users profile image URL attribute; e.g. `imgURL` (JSM) or `imageUrl`. Omit env to skip sending. */
  readonly VITE_APPWRITE_USER_IMAGE_ATTR?: string;
  /** Users profile image file id attribute; e.g. `imgID`. Omit env to skip sending. */
  readonly VITE_APPWRITE_USER_IMAGE_ID_ATTR?: string;
  /** Users collection bio field key, e.g. `bio` or `biography`. Omit env to skip bio in API. */
  readonly VITE_APPWRITE_USER_BIO_ATTR?: string;
  /** Set to "true" if Posts live in a Tables DB row (not a legacy collection document). */
  readonly VITE_APPWRITE_POSTS_USE_TABLESDB?: string;
  /** Posts collection image URL attribute (default `imgURL`; use `imageUrl` for classic JSM schema). */
  readonly VITE_APPWRITE_POST_IMAGE_URL_ATTR?: string;
  /** Posts collection storage file id attribute (default `imgID`; use `imageId` for classic JSM schema). */
  readonly VITE_APPWRITE_POST_IMAGE_ID_ATTR?: string;
}