type UploadFolder = "cases" | "videos" | "podcasts";

type UploadResponse = {
  Key: string;
  LastModified: string;
  ETag: string;
  Size: number;
  StorageClass: string;
};

type UploadedMedia = UploadResponse & {
  url: string;
};

const UPLOAD_BUCKET_NAME = "ncp-files";
const UPLOAD_ROOT_PREFIX = "radical-panel";

function normalizeStorageKey(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function normalizeStorageFolder(folder: UploadFolder) {
  return `/${normalizeStorageKey(`${UPLOAD_ROOT_PREFIX}/${folder}`)}/`;
}

function encodeStorageKeyForUrl(key: string) {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getPublicBasePathPrefix(baseUrl: string) {
  try {
    return normalizeStorageKey(new URL(baseUrl).pathname);
  } catch {
    return "";
  }
}

function getUploadApiBaseUrl() {
  return (
    import.meta.env.VITE_UPLOAD_API_BASE_URL as string | undefined
  )?.trim();
}

function getUploadPublicBaseUrl() {
  return (
    import.meta.env.VITE_UPLOAD_PUBLIC_BASE_URL as string | undefined
  )?.trim();
}

function buildUploadUrl(folder: UploadFolder) {
  const configuredUrl = getUploadApiBaseUrl();
  const query = new URLSearchParams({
    bucket_name: UPLOAD_BUCKET_NAME,
    folder: normalizeStorageFolder(folder),
  });

  if (!configuredUrl) {
    return `/upload?${query.toString()}`;
  }

  const normalizedUrl = configuredUrl.replace(/\/+$/, "");

  if (normalizedUrl.endsWith("/upload")) {
    return `${normalizedUrl}?${query.toString()}`;
  }

  return `${normalizedUrl}/upload?${query.toString()}`;
}

function buildPublicFileUrl(key: string) {
  const configuredUrl = getUploadPublicBaseUrl();
  const normalizedKey = normalizeStorageKey(key);

  if (!configuredUrl) {
    return encodeStorageKeyForUrl(normalizedKey);
  }

  const normalizedBaseUrl = configuredUrl.replace(/\/+$/, "");
  const basePathPrefix = getPublicBasePathPrefix(normalizedBaseUrl);
  const relativeKey =
    basePathPrefix &&
    (normalizedKey === basePathPrefix ||
      normalizedKey.startsWith(`${basePathPrefix}/`))
      ? normalizedKey.slice(basePathPrefix.length).replace(/^\/+/, "")
      : normalizedKey;

  return `${normalizedBaseUrl}/${encodeStorageKeyForUrl(relativeKey)}`;
}

function buildDeleteUrl(key: string) {
  const configuredUrl = getUploadApiBaseUrl();
  const normalizedKey = normalizeStorageKey(key);
  const encodedKey = encodeStorageKeyForUrl(normalizedKey);

  if (!configuredUrl) {
    return `/remove_file/${encodedKey}`;
  }

  const normalizedUrl = configuredUrl.replace(/\/+$/, "");

  if (normalizedUrl.endsWith("/upload")) {
    return `${normalizedUrl.slice(0, -"/upload".length)}/remove_file/${encodedKey}`;
  }

  return `${normalizedUrl}/remove_file/${encodedKey}`;
}

function resolveStorageKeyFromUrl(fileUrl: string) {
  const normalizedUrl = fileUrl.trim();

  if (!normalizedUrl) {
    return null;
  }

  const publicBaseUrl = getUploadPublicBaseUrl();

  if (publicBaseUrl) {
    const normalizedBaseUrl = publicBaseUrl.replace(/\/+$/, "");

    if (normalizedUrl.startsWith(`${normalizedBaseUrl}/`)) {
      const relativeKey = normalizedUrl
        .slice(normalizedBaseUrl.length + 1)
        .split("/")
        .map((segment) => decodeURIComponent(segment))
        .join("/");
      const basePathPrefix = getPublicBasePathPrefix(normalizedBaseUrl);

      return basePathPrefix
        ? `${basePathPrefix}/${normalizeStorageKey(relativeKey)}`
        : normalizeStorageKey(relativeKey);
    }
  }

  if (/^https?:\/\//i.test(normalizedUrl)) {
    return null;
  }

  return normalizeStorageKey(normalizedUrl);
}
async function deleteMediaFile(key: string) {
  const response = await fetch(buildDeleteUrl(key), {
    method: "DELETE",
  });

  if (!response.ok) {
    let detail = "No se pudo eliminar el archivo del storage.";

    try {
      const payload = (await response.json()) as {
        detail?: string;
        error?: string;
        message?: string;
      };
      detail = payload.detail ?? payload.error ?? payload.message ?? detail;
    } catch {
      // Ignore malformed error payloads and keep the fallback message.
    }

    throw new Error(detail);
  }
}

export async function uploadMediaFile(file: File, folder: UploadFolder) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", "");

  const response = await fetch(buildUploadUrl(folder), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = "No se pudo subir el archivo.";

    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) {
        detail = payload.detail;
      }
    } catch {
      // Ignore malformed error payloads and keep the fallback message.
    }

    throw new Error(detail);
  }

  const payload = (await response.json()) as UploadResponse;

  if (!payload.Key) {
    throw new Error("La API de subida no devolvio la ruta del archivo.");
  }

  return {
    ...payload,
    url: buildPublicFileUrl(payload.Key),
  } satisfies UploadedMedia;
}

export async function deleteMediaFiles(fileUrls: string[]) {
  const storageKeys = [
    ...new Set(
      fileUrls
        .map(resolveStorageKeyFromUrl)
        .filter((storageKey): storageKey is string => Boolean(storageKey)),
    ),
  ];

  if (storageKeys.length === 0) {
    return;
  }

  const results = await Promise.allSettled(
    storageKeys.map((storageKey) => deleteMediaFile(storageKey)),
  );
  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );

  if (failures.length > 0) {
    throw new Error(
      failures[0]?.reason instanceof Error
        ? failures[0].reason.message
        : "No se pudieron eliminar archivos del storage.",
    );
  }
}
