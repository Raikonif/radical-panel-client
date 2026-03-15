import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  CaseFormValues,
  CaseRecord,
  CaseTranslation,
  CaseImage,
  ContentLanguage,
  DashboardData,
  PodcastFormValues,
  PodcastRecord,
  PodcastTranslation,
  VideoFormValues,
  VideoRecord,
  VideoTranslation,
} from "@/features/content/types";

type RawCaseTranslationRow = {
  id: number;
  created_at: string;
  updated_at: string | null;
  title: string | null;
  description: string | null;
  language: string | null;
  case_id: number | null;
  is_active: boolean | null;
  diagnosis: string | null;
  complexity: string | null;
  specimen: string | null;
};

type RawCaseImageRow = {
  id: number;
  created_at: string;
  updated_at: string | null;
  image_url: string | null;
  case_id: number | null;
  type: string | null;
};

type RawCaseRow = {
  id: number;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
};

type RawVideoTranslationRow = {
  id: number;
  created_at: string;
  updated_at: string | null;
  is_active: boolean | null;
  name: string | null;
  description: string | null;
  language: string | null;
  video_id: number | null;
};

type RawVideoRow = {
  id: number;
  created_at: string;
  updated_at: string | null;
  file_url: string | null;
  user_id: string | null;
};

type RawPodcastTranslationRow = {
  id: number;
  created_at: string;
  updated_at: string | null;
  title: string | null;
  body: string | null;
  slug: string | null;
  language: string | null;
  is_active: boolean | null;
  podcast_id: number | null;
};

type RawPodcastRow = {
  id: number;
  created_at: string;
  updated_at: string | null;
  file_url: string | null;
  uder_id: string | null;
  is_active: boolean | null;
};

const CASE_SELECT = `
  id,
  created_at,
  updated_at,
  user_id
`;

const CASE_TRANSLATION_SELECT = `
  id,
  created_at,
  updated_at,
  title,
  description,
  language,
  case_id,
  is_active,
  diagnosis,
  complexity,
  specimen
`;

const CASE_IMAGE_SELECT = `
  id,
  created_at,
  updated_at,
  image_url,
  case_id,
  type
`;

const VIDEO_SELECT = `
  id,
  created_at,
  updated_at,
  file_url,
  user_id
`;

const VIDEO_TRANSLATION_SELECT = `
  id,
  created_at,
  updated_at,
  is_active,
  name,
  description,
  language,
  video_id
`;

const PODCAST_SELECT = `
  id,
  created_at,
  updated_at,
  file_url,
  uder_id,
  is_active
`;

const PODCAST_TRANSLATION_SELECT = `
  id,
  created_at,
  updated_at,
  title,
  body,
  slug,
  language,
  is_active,
  podcast_id
`;

function ensureNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

function mapCaseTranslation(row: RawCaseTranslationRow): CaseTranslation {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    title: row.title ?? "",
    description: row.description ?? "",
    language: row.language ?? "",
    is_active: row.is_active ?? false,
    diagnosis: row.diagnosis ?? "",
    complexity: row.complexity ?? "",
    specimen: row.specimen ?? "",
  };
}

function mapCaseImage(row: RawCaseImageRow): CaseImage {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    image_url: row.image_url ?? "",
    type: row.type ?? "",
  };
}

function mapCaseRecord(
  row: RawCaseRow,
  translations: RawCaseTranslationRow[],
  images: RawCaseImageRow[],
): CaseRecord {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_id: row.user_id,
    translations: translations.map(mapCaseTranslation),
    images: images.map(mapCaseImage),
  };
}

function mapVideoTranslation(row: RawVideoTranslationRow): VideoTranslation {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    is_active: row.is_active ?? false,
    name: row.name ?? "",
    description: row.description ?? "",
    language: row.language ?? "",
  };
}

function mapVideoRecord(
  row: RawVideoRow,
  translations: RawVideoTranslationRow[],
): VideoRecord {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    file_url: row.file_url ?? "",
    user_id: row.user_id,
    translations: translations.map(mapVideoTranslation),
  };
}

function mapPodcastTranslation(
  row: RawPodcastTranslationRow,
): PodcastTranslation {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    title: row.title ?? "",
    body: row.body ?? "",
    slug: row.slug ?? "",
    language: row.language ?? "",
    is_active: row.is_active ?? false,
  };
}

function mapPodcastRecord(
  row: RawPodcastRow,
  translations: RawPodcastTranslationRow[],
): PodcastRecord {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    file_url: row.file_url ?? "",
    uder_id: row.uder_id,
    is_active: row.is_active ?? false,
    translations: translations.map(mapPodcastTranslation),
  };
}

function groupRowsByForeignKey<T>(
  rows: T[],
  getKey: (row: T) => number | null,
): Map<number, T[]> {
  const groupedRows = new Map<number, T[]>();

  for (const row of rows) {
    const key = getKey(row);
    if (key === null) {
      continue;
    }

    const bucket = groupedRows.get(key);
    if (bucket) {
      bucket.push(row);
      continue;
    }

    groupedRows.set(key, [row]);
  }

  return groupedRows;
}

function assembleCaseRecords(
  caseRows: RawCaseRow[],
  translationRows: RawCaseTranslationRow[],
  imageRows: RawCaseImageRow[],
) {
  const translationsByCaseId = groupRowsByForeignKey(
    translationRows,
    (row) => row.case_id,
  );
  const imagesByCaseId = groupRowsByForeignKey(imageRows, (row) => row.case_id);

  return caseRows.map((row) =>
    mapCaseRecord(
      row,
      translationsByCaseId.get(row.id) ?? [],
      imagesByCaseId.get(row.id) ?? [],
    ),
  );
}

function assembleVideoRecords(
  videoRows: RawVideoRow[],
  translationRows: RawVideoTranslationRow[],
) {
  const translationsByVideoId = groupRowsByForeignKey(
    translationRows,
    (row) => row.video_id,
  );

  return videoRows.map((row) =>
    mapVideoRecord(row, translationsByVideoId.get(row.id) ?? []),
  );
}

function assemblePodcastRecords(
  podcastRows: RawPodcastRow[],
  translationRows: RawPodcastTranslationRow[],
) {
  const translationsByPodcastId = groupRowsByForeignKey(
    translationRows,
    (row) => row.podcast_id,
  );

  return podcastRows.map((row) =>
    mapPodcastRecord(row, translationsByPodcastId.get(row.id) ?? []),
  );
}

async function fetchCaseById(caseId: number) {
  const client = getSupabaseClient();
  const [
    { data: caseRow, error: caseError },
    { data: translations, error: translationsError },
    { data: images, error: imagesError },
  ] = await Promise.all([
    client.from("cases").select(CASE_SELECT).eq("id", caseId).single(),
    client
      .from("cases_translations")
      .select(CASE_TRANSLATION_SELECT)
      .eq("case_id", caseId)
      .order("created_at", { ascending: true }),
    client
      .from("images_cases")
      .select(CASE_IMAGE_SELECT)
      .eq("case_id", caseId)
      .order("created_at", { ascending: true }),
  ]);

  ensureNoError(caseError);
  ensureNoError(translationsError);
  ensureNoError(imagesError);

  return mapCaseRecord(
    caseRow as unknown as RawCaseRow,
    (translations as unknown as RawCaseTranslationRow[] | null) ?? [],
    (images as unknown as RawCaseImageRow[] | null) ?? [],
  );
}

async function fetchVideoById(videoId: number) {
  const client = getSupabaseClient();
  const [
    { data: videoRow, error: videoError },
    { data: translations, error: translationsError },
  ] = await Promise.all([
    client.from("videos").select(VIDEO_SELECT).eq("id", videoId).single(),
    client
      .from("videos_translations")
      .select(VIDEO_TRANSLATION_SELECT)
      .eq("video_id", videoId)
      .order("created_at", { ascending: true }),
  ]);

  ensureNoError(videoError);
  ensureNoError(translationsError);

  return mapVideoRecord(
    videoRow as unknown as RawVideoRow,
    (translations as unknown as RawVideoTranslationRow[] | null) ?? [],
  );
}

async function fetchPodcastById(podcastId: number) {
  const client = getSupabaseClient();
  const [
    { data: podcastRow, error: podcastError },
    { data: translations, error: translationsError },
  ] = await Promise.all([
    client.from("podcasts").select(PODCAST_SELECT).eq("id", podcastId).single(),
    client
      .from("podcasts_translations")
      .select(PODCAST_TRANSLATION_SELECT)
      .eq("podcast_id", podcastId)
      .order("created_at", { ascending: true }),
  ]);

  ensureNoError(podcastError);
  ensureNoError(translationsError);

  return mapPodcastRecord(
    podcastRow as unknown as RawPodcastRow,
    (translations as unknown as RawPodcastTranslationRow[] | null) ?? [],
  );
}

async function writeCaseChildren(
  caseId: number,
  payload: CaseFormValues,
  timestamp: string,
) {
  await Promise.all([
    upsertCaseTranslation(caseId, payload.translation, timestamp),
    writeCaseImages(caseId, payload.images, timestamp),
  ]);
}

async function writeCaseImages(
  caseId: number,
  images: CaseFormValues["images"],
  timestamp: string,
) {
  if (images.length === 0) {
    return;
  }

  const { error } = await getSupabaseClient()
    .from("images_cases")
    .insert(
      images.map((image) => ({
        case_id: caseId,
        updated_at: timestamp,
        image_url: image.image_url,
        type: image.type,
      })),
    );

  ensureNoError(error);
}

async function findTranslationId(
  table: "cases_translations" | "videos_translations" | "podcasts_translations",
  foreignKey: "case_id" | "video_id" | "podcast_id",
  parentId: number,
  language: ContentLanguage,
) {
  const { data, error } = await getSupabaseClient()
    .from(table)
    .select("id")
    .eq(foreignKey, parentId)
    .eq("language", language)
    .maybeSingle();

  ensureNoError(error);

  return (data as { id: number } | null)?.id ?? null;
}

async function upsertCaseTranslation(
  caseId: number,
  translation: CaseFormValues["translation"],
  timestamp: string,
) {
  const translationId = await findTranslationId(
    "cases_translations",
    "case_id",
    caseId,
    translation.language,
  );

  if (translationId) {
    const { error } = await getSupabaseClient()
      .from("cases_translations")
      .update({
        updated_at: timestamp,
        language: translation.language,
        title: translation.title,
        description: translation.description,
        is_active: translation.is_active,
        diagnosis: translation.diagnosis,
        complexity: translation.complexity,
        specimen: translation.specimen,
      })
      .eq("id", translationId);

    ensureNoError(error);
    return;
  }

  const { error } = await getSupabaseClient()
    .from("cases_translations")
    .insert({
      case_id: caseId,
      updated_at: timestamp,
      language: translation.language,
      title: translation.title,
      description: translation.description,
      is_active: translation.is_active,
      diagnosis: translation.diagnosis,
      complexity: translation.complexity,
      specimen: translation.specimen,
    });

  ensureNoError(error);
}

async function upsertVideoTranslation(
  videoId: number,
  translation: VideoFormValues["translation"],
  timestamp: string,
) {
  const translationId = await findTranslationId(
    "videos_translations",
    "video_id",
    videoId,
    translation.language,
  );

  if (translationId) {
    const { error } = await getSupabaseClient()
      .from("videos_translations")
      .update({
        updated_at: timestamp,
        language: translation.language,
        name: translation.name,
        description: translation.description,
        is_active: translation.is_active,
      })
      .eq("id", translationId);

    ensureNoError(error);
    return;
  }

  const { error } = await getSupabaseClient()
    .from("videos_translations")
    .insert({
      video_id: videoId,
      updated_at: timestamp,
      language: translation.language,
      name: translation.name,
      description: translation.description,
      is_active: translation.is_active,
    });

  ensureNoError(error);
}

async function upsertPodcastTranslation(
  podcastId: number,
  translation: PodcastFormValues["translation"],
  timestamp: string,
) {
  const translationId = await findTranslationId(
    "podcasts_translations",
    "podcast_id",
    podcastId,
    translation.language,
  );

  if (translationId) {
    const { error } = await getSupabaseClient()
      .from("podcasts_translations")
      .update({
        updated_at: timestamp,
        language: translation.language,
        title: translation.title,
        body: translation.body,
        slug: translation.slug,
        is_active: translation.is_active,
      })
      .eq("id", translationId);

    ensureNoError(error);
    return;
  }

  const { error } = await getSupabaseClient()
    .from("podcasts_translations")
    .insert({
      podcast_id: podcastId,
      updated_at: timestamp,
      language: translation.language,
      title: translation.title,
      body: translation.body,
      slug: translation.slug,
      is_active: translation.is_active,
    });

  ensureNoError(error);
}

export async function listCases(userId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("cases")
    .select(CASE_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  ensureNoError(error);
  const caseRows = (data as unknown as RawCaseRow[] | null) ?? [];

  if (caseRows.length === 0) {
    return [];
  }

  const caseIds = caseRows.map((row) => row.id);
  const [
    { data: translations, error: translationsError },
    { data: images, error: imagesError },
  ] = await Promise.all([
    client
      .from("cases_translations")
      .select(CASE_TRANSLATION_SELECT)
      .in("case_id", caseIds)
      .order("created_at", { ascending: true }),
    client
      .from("images_cases")
      .select(CASE_IMAGE_SELECT)
      .in("case_id", caseIds)
      .order("created_at", { ascending: true }),
  ]);

  ensureNoError(translationsError);
  ensureNoError(imagesError);

  return assembleCaseRecords(
    caseRows,
    (translations as unknown as RawCaseTranslationRow[] | null) ?? [],
    (images as unknown as RawCaseImageRow[] | null) ?? [],
  );
}

export async function createCase(payload: CaseFormValues, userId: string) {
  const timestamp = new Date().toISOString();
  const { data, error } = await getSupabaseClient()
    .from("cases")
    .insert({
      user_id: userId,
      updated_at: timestamp,
    })
    .select("id")
    .single();

  ensureNoError(error);

  const caseId = (data as { id: number }).id;
  await writeCaseChildren(caseId, payload, timestamp);

  return fetchCaseById(caseId);
}

export async function updateCase(caseId: number, payload: CaseFormValues) {
  const client = getSupabaseClient();
  const timestamp = new Date().toISOString();

  const [caseUpdate, imagesDelete] = await Promise.all([
    client.from("cases").update({ updated_at: timestamp }).eq("id", caseId),
    client.from("images_cases").delete().eq("case_id", caseId),
  ]);

  ensureNoError(caseUpdate.error);
  ensureNoError(imagesDelete.error);

  await writeCaseChildren(caseId, payload, timestamp);

  return fetchCaseById(caseId);
}

export async function deleteCase(caseId: number) {
  const client = getSupabaseClient();
  const [translationsDelete, imagesDelete] = await Promise.all([
    client.from("cases_translations").delete().eq("case_id", caseId),
    client.from("images_cases").delete().eq("case_id", caseId),
  ]);

  ensureNoError(translationsDelete.error);
  ensureNoError(imagesDelete.error);

  const { error } = await client.from("cases").delete().eq("id", caseId);
  ensureNoError(error);
}

export async function listVideos(userId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  ensureNoError(error);
  const videoRows = (data as unknown as RawVideoRow[] | null) ?? [];

  if (videoRows.length === 0) {
    return [];
  }

  const videoIds = videoRows.map((row) => row.id);
  const { data: translations, error: translationsError } = await client
    .from("videos_translations")
    .select(VIDEO_TRANSLATION_SELECT)
    .in("video_id", videoIds)
    .order("created_at", { ascending: true });

  ensureNoError(translationsError);

  return assembleVideoRecords(
    videoRows,
    (translations as unknown as RawVideoTranslationRow[] | null) ?? [],
  );
}

export async function createVideo(payload: VideoFormValues, userId: string) {
  const timestamp = new Date().toISOString();
  const { data, error } = await getSupabaseClient()
    .from("videos")
    .insert({
      user_id: userId,
      file_url: payload.file_url,
      updated_at: timestamp,
    })
    .select("id")
    .single();

  ensureNoError(error);

  const videoId = (data as { id: number }).id;
  await upsertVideoTranslation(videoId, payload.translation, timestamp);

  return fetchVideoById(videoId);
}

export async function updateVideo(videoId: number, payload: VideoFormValues) {
  const client = getSupabaseClient();
  const timestamp = new Date().toISOString();

  const { error: videoUpdateError } = await client
    .from("videos")
    .update({
      file_url: payload.file_url,
      updated_at: timestamp,
    })
    .eq("id", videoId);

  ensureNoError(videoUpdateError);

  await upsertVideoTranslation(videoId, payload.translation, timestamp);

  return fetchVideoById(videoId);
}

export async function deleteVideo(videoId: number) {
  const client = getSupabaseClient();
  const { error: translationsError } = await client
    .from("videos_translations")
    .delete()
    .eq("video_id", videoId);
  ensureNoError(translationsError);

  const { error } = await client.from("videos").delete().eq("id", videoId);
  ensureNoError(error);
}

export async function listPodcasts(userId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("podcasts")
    .select(PODCAST_SELECT)
    .eq("uder_id", userId)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  ensureNoError(error);

  const podcastRows = (data as unknown as RawPodcastRow[] | null) ?? [];

  if (podcastRows.length === 0) {
    return [];
  }

  const podcastIds = podcastRows.map((row) => row.id);
  const { data: translations, error: translationsError } = await client
    .from("podcasts_translations")
    .select(PODCAST_TRANSLATION_SELECT)
    .in("podcast_id", podcastIds)
    .order("created_at", { ascending: true });

  ensureNoError(translationsError);

  return assemblePodcastRecords(
    podcastRows,
    (translations as unknown as RawPodcastTranslationRow[] | null) ?? [],
  );
}

export async function createPodcast(
  payload: PodcastFormValues,
  userId: string,
) {
  const timestamp = new Date().toISOString();
  const { data, error } = await getSupabaseClient()
    .from("podcasts")
    .insert({
      uder_id: userId,
      file_url: payload.file_url,
      is_active: payload.is_active,
      updated_at: timestamp,
    })
    .select("id")
    .single();

  ensureNoError(error);

  const podcastId = (data as { id: number }).id;
  await upsertPodcastTranslation(podcastId, payload.translation, timestamp);

  return fetchPodcastById(podcastId);
}

export async function updatePodcast(
  podcastId: number,
  payload: PodcastFormValues,
) {
  const client = getSupabaseClient();
  const timestamp = new Date().toISOString();

  const { error: podcastUpdateError } = await client
    .from("podcasts")
    .update({
      file_url: payload.file_url,
      is_active: payload.is_active,
      updated_at: timestamp,
    })
    .eq("id", podcastId);

  ensureNoError(podcastUpdateError);

  await upsertPodcastTranslation(podcastId, payload.translation, timestamp);

  return fetchPodcastById(podcastId);
}

export async function deletePodcast(podcastId: number) {
  const client = getSupabaseClient();
  const { error: translationsError } = await client
    .from("podcasts_translations")
    .delete()
    .eq("podcast_id", podcastId);
  ensureNoError(translationsError);

  const { error } = await client.from("podcasts").delete().eq("id", podcastId);
  ensureNoError(error);
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [cases, videos, podcasts] = await Promise.all([
    listCases(userId),
    listVideos(userId),
    listPodcasts(userId),
  ]);

  const activeTranslations =
    cases.reduce(
      (total, record) =>
        total +
        record.translations.filter((translation) => translation.is_active)
          .length,
      0,
    ) +
    videos.reduce(
      (total, record) =>
        total +
        record.translations.filter((translation) => translation.is_active)
          .length,
      0,
    ) +
    podcasts.reduce(
      (total, record) =>
        total +
        record.translations.filter((translation) => translation.is_active)
          .length,
      0,
    );

  const caseImages = cases.reduce(
    (total, record) => total + record.images.length,
    0,
  );

  return {
    counts: {
      cases: cases.length,
      videos: videos.length,
      podcasts: podcasts.length,
      activeTranslations,
      caseImages,
    },
    recentCases: cases.slice(0, 4),
    recentVideos: videos.slice(0, 4),
    recentPodcasts: podcasts.slice(0, 4),
  };
}
