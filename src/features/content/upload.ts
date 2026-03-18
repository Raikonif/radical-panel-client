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

function buildUploadUrl(folder: UploadFolder) {
  const configuredUrl = (
    import.meta.env.VITE_UPLOAD_API_BASE_URL as string | undefined
  )?.trim();
  const resolvedFolder = `${UPLOAD_ROOT_PREFIX}/${folder}`;
  const query = new URLSearchParams({
    bucket_name: UPLOAD_BUCKET_NAME,
    folder: resolvedFolder,
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
  const configuredUrl = (
    import.meta.env.VITE_UPLOAD_PUBLIC_BASE_URL as string | undefined
  )?.trim();

  if (!configuredUrl) {
    return key;
  }

  const normalizedBaseUrl = configuredUrl.replace(/\/+$/, "");
  const normalizedKey = key.replace(/^\/+/, "");

  return `${normalizedBaseUrl}/${normalizedKey}`;
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
