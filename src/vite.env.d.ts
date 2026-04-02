/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Appwrite API endpoint (e.g. `https://nyc.cloud.appwrite.io` or `.../v1`).
   * Required on Vercel: add under Project → Environment Variables for Production
   * so the value is present at `npm run build`. `/v1` is appended automatically if omitted.
   */
  readonly VITE_APPWRITE_URL?: string;
  /** Appwrite project id — required at build time for the client SDK. */
  readonly VITE_APPWRITE_PROJECT_ID?: string;
  /** Unused in this app — use `VITE_APPWRITE_URL`. Shown on deployment debug page. */
  readonly VITE_APPWRITE_ENDPOINT?: string;
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