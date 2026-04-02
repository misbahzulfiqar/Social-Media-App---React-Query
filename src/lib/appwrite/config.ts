import {
  Account,
  Avatars,
  Client,
  Databases,
  Storage,
  TablesDB,
} from "appwrite";

/** Ensures Appwrite REST base ends with `/v1` (SDK and console URLs often omit it). */
function normalizeAppwriteEndpoint(raw: string): string {
  const t = raw.trim().replace(/\/+$/, "");
  if (!t) return "";
  if (/\/v1$/i.test(t)) return t;
  return `${t}/v1`;
}

const rawAppwriteUrl = import.meta.env.VITE_APPWRITE_URL?.trim() ?? "";
const rawAppwriteProjectId =
  import.meta.env.VITE_APPWRITE_PROJECT_ID?.trim() ?? "";
const normalizedAppwriteUrl = normalizeAppwriteEndpoint(rawAppwriteUrl);
const endpointProtocolOk =
  normalizedAppwriteUrl.startsWith("https://") ||
  normalizedAppwriteUrl.startsWith("http://");

/**
 * `true` when URL + project id are present and valid for the Appwrite client.
 * If `false`, the SDK is pointed at a placeholder host so **importing this module
 * never throws** (missing `VITE_APPWRITE_URL` used to crash the whole bundle on Vercel).
 */
export const isAppwriteClientConfigured =
  endpointProtocolOk && Boolean(rawAppwriteProjectId);

export const appwriteConfig = {
  ProjectId: rawAppwriteProjectId,
  url: isAppwriteClientConfigured ? normalizedAppwriteUrl : "",
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  storageId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
  postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
  savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
};

/**
 * Users collection attribute for profile image **URL** (string).
 * When unset, **omit** the field on create/update so minimal schemas work.
 * Set `VITE_APPWRITE_USER_IMAGE_ATTR=imgURL` (JSM) or `imageUrl` to match your collection.
 * Use `omit` to force skipping.
 */
const rawImageAttr = import.meta.env.VITE_APPWRITE_USER_IMAGE_ATTR?.trim();
export const userCollectionImageAttr: string | null =
  rawImageAttr === undefined || rawImageAttr === ""
    ? null
    : rawImageAttr.toLowerCase() === "omit"
      ? null
      : rawImageAttr;

/**
 * Users collection attribute for profile image **storage file id**.
 * When unset, **omit**. Set `VITE_APPWRITE_USER_IMAGE_ID_ATTR=imgID` for JSM.
 */
const rawUserImageIdAttr = import.meta.env.VITE_APPWRITE_USER_IMAGE_ID_ATTR?.trim();
export const userCollectionImageIdAttr: string | null =
  rawUserImageIdAttr === undefined || rawUserImageIdAttr === ""
    ? null
    : rawUserImageIdAttr.toLowerCase() === "omit"
      ? null
      : rawUserImageIdAttr;

/**
 * Users collection bio/about attribute. If unset, `bio` is not sent on update
 * (avoids "Unknown attribute: bio"). Set to `bio`, `biography`, etc. to match
 * your schema. Use `omit` to force skipping.
 */
const rawBioAttr = import.meta.env.VITE_APPWRITE_USER_BIO_ATTR?.trim();
export const userCollectionBioAttr: string | null =
  rawBioAttr === undefined || rawBioAttr === ""
    ? null
    : rawBioAttr.toLowerCase() === "omit"
      ? null
      : rawBioAttr;

/**
 * New Appwrite Cloud databases use **Tables** (`/tablesdb/.../rows`). Legacy uses
 * **Collections** (`/databases/.../documents`). If your Posts resource is a table,
 * set `VITE_APPWRITE_POSTS_USE_TABLESDB=true` and keep the same ID in
 * `VITE_APPWRITE_POST_COLLECTION_ID`.
 */
export const postsUseTablesDb =
  import.meta.env.VITE_APPWRITE_POSTS_USE_TABLESDB === "true";

/** Appwrite Posts table/collection attribute for the image URL (e.g. JSM uses `imageUrl`). */
const rawPostImageUrlAttr = import.meta.env.VITE_APPWRITE_POST_IMAGE_URL_ATTR?.trim();
export const postCollectionImageUrlAttr: string =
  rawPostImageUrlAttr === undefined || rawPostImageUrlAttr === ""
    ? "imgURL"
    : rawPostImageUrlAttr;

/** Appwrite attribute for the storage file id of the post image (many schemas use `imgID`). */
const rawPostImageIdAttr = import.meta.env.VITE_APPWRITE_POST_IMAGE_ID_ATTR?.trim();
export const postCollectionImageIdAttr: string =
  rawPostImageIdAttr === undefined || rawPostImageIdAttr === ""
    ? "imgID"
    : rawPostImageIdAttr;

export function postImageWritePayload(
  imageUrl: string,
  imageStorageFileId: string
): Record<string, string> {
  return {
    [postCollectionImageUrlAttr]: imageUrl,
    [postCollectionImageIdAttr]: imageStorageFileId,
  };
}

/**
 * Keys used when **uploading** a new profile image on update.
 * Defaults align with common Snapgram-style Users tables (`imageUrl` / `imageId`),
 * not `imgURL` / `imgID` (set env if your schema matches JSM).
 * If `VITE_APPWRITE_USER_IMAGE_ID_ATTR=omit`, the file id field is not sent.
 */
export function userProfileImageWritePayload(
  imageUrl: string,
  imageStorageFileId: string
): Record<string, string> {
  const urlKey = userCollectionImageAttr ?? "imageUrl";
  const rawIdEnv = import.meta.env.VITE_APPWRITE_USER_IMAGE_ID_ATTR?.trim();
  const omitId = rawIdEnv?.toLowerCase() === "omit";
  const out: Record<string, string> = { [urlKey]: imageUrl };
  if (!omitId) {
    const idKey = userCollectionImageIdAttr ?? "imageId";
    out[idKey] = imageStorageFileId;
  }
  return out;
}

export function pickPostImageUrl(doc: Record<string, unknown>): string {
  const primary = doc[postCollectionImageUrlAttr];
  if (primary != null && String(primary)) return String(primary);
  for (const k of ["imgURL", "imageUrl", "image_url"]) {
    if (k === postCollectionImageUrlAttr) continue;
    const v = doc[k];
    if (v != null && String(v)) return String(v);
  }
  return "";
}

export function pickPostImageId(doc: Record<string, unknown>): string {
  const primary = doc[postCollectionImageIdAttr];
  if (primary != null && String(primary)) return String(primary);
  for (const k of ["imgID", "imageId", "image_id", "imgId"]) {
    if (k === postCollectionImageIdAttr) continue;
    const v = doc[k];
    if (v != null && String(v)) return String(v);
  }
  return "";
}

export function pickUserProfileImageUrl(doc: Record<string, unknown>): string {
  if (userCollectionImageAttr) {
    const v = doc[userCollectionImageAttr];
    if (v != null && String(v)) return String(v);
  }
  for (const k of ["imgURL", "imageUrl", "image_url", "imageurl", "avatarUrl"]) {
    if (k === userCollectionImageAttr) continue;
    const v = doc[k];
    if (v != null && String(v)) return String(v);
  }
  return "";
}

export function pickUserImageId(doc: Record<string, unknown>): string {
  if (userCollectionImageIdAttr) {
    const v = doc[userCollectionImageIdAttr];
    if (v != null && String(v)) return String(v);
  }
  for (const k of ["imgID", "imageId", "image_id", "imgId"]) {
    if (k === userCollectionImageIdAttr) continue;
    const v = doc[k];
    if (v != null && String(v)) return String(v);
  }
  return "";
}

export function pickUserBio(doc: Record<string, unknown>): string {
  if (userCollectionBioAttr) {
    const v = doc[userCollectionBioAttr];
    if (v != null && String(v)) return String(v);
  }
  for (const k of ["bio", "biography", "about", "Bio"]) {
    const v = doc[k];
    if (v != null && String(v)) return String(v);
  }
  return "";
}
export const client = new Client();

if (isAppwriteClientConfigured) {
  client.setEndpoint(normalizedAppwriteUrl);
  client.setProject(rawAppwriteProjectId);
} else {
  // Valid URL shape only — avoids AppwriteException at module load when env is missing on Vercel.
  client.setEndpoint("https://vite-env-not-set.invalid/v1");
  if (rawAppwriteProjectId) {
    client.setProject(rawAppwriteProjectId);
  }
}

export const account = new Account(client);
export const databases = new Databases(client);
export const tablesDb = new TablesDB(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);