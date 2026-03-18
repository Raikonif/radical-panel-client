export type ContentLanguage = "es" | "en";

export type CaseTranslation = {
  id: number;
  created_at: string;
  updated_at: string | null;
  title: string;
  description: string;
  language: string;
  is_active: boolean;
  diagnosis: string;
  complexity: string;
  specimen: string;
};

export type CaseImage = {
  id: number;
  created_at: string;
  updated_at: string | null;
  image_url: string;
  type: string;
};

export type CaseRecord = {
  id: number;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
  translations: CaseTranslation[];
  images: CaseImage[];
};

export type VideoTranslation = {
  id: number;
  created_at: string;
  updated_at: string | null;
  is_active: boolean;
  name: string;
  description: string;
  language: string;
};

export type VideoRecord = {
  id: number;
  created_at: string;
  updated_at: string | null;
  file_url: string;
  user_id: string | null;
  translations: VideoTranslation[];
};

export type PodcastTranslation = {
  id: number;
  created_at: string;
  updated_at: string | null;
  title: string;
  body: string;
  slug: string;
  language: string;
  is_active: boolean;
};

export type PodcastRecord = {
  id: number;
  created_at: string;
  updated_at: string | null;
  file_url: string;
  user_id: string | null;
  is_active: boolean;
  translations: PodcastTranslation[];
};

export type CaseFormValues = {
  translation: {
    language: ContentLanguage;
    title: string;
    description: string;
    is_active: boolean;
    diagnosis: string;
    complexity: string;
    specimen: string;
  };
  images: Array<{
    image_url: string;
    type: string;
  }>;
};

export type VideoFormValues = {
  file_url: string;
  translation: {
    language: ContentLanguage;
    name: string;
    description: string;
    is_active: boolean;
  };
};

export type PodcastFormValues = {
  file_url: string;
  is_active: boolean;
  translation: {
    language: ContentLanguage;
    title: string;
    slug: string;
    body: string;
    is_active: boolean;
  };
};

export type DashboardData = {
  counts: {
    cases: number;
    videos: number;
    podcasts: number;
    activeTranslations: number;
    caseImages: number;
  };
  recentCases: CaseRecord[];
  recentVideos: VideoRecord[];
  recentPodcasts: PodcastRecord[];
};

function pickPreferredTranslation<
  T extends { language: string; is_active: boolean },
>(translations: T[]) {
  return (
    translations.find(
      (translation) => translation.is_active && translation.language === "es",
    ) ??
    translations.find((translation) => translation.language === "es") ??
    translations.find((translation) => translation.is_active) ??
    translations[0] ??
    null
  );
}

export function getTranslationByLanguage<
  T extends { language: string; is_active: boolean },
>(translations: T[], language: ContentLanguage) {
  return (
    translations.find(
      (translation) =>
        translation.language === language && translation.is_active,
    ) ?? translations.find((translation) => translation.language === language)
  );
}

export function getPrimaryCaseTranslation(record: CaseRecord) {
  return pickPreferredTranslation(record.translations);
}

export function getCaseTranslation(
  record: CaseRecord,
  language: ContentLanguage,
) {
  return getTranslationByLanguage(record.translations, language);
}

export function getPrimaryVideoTranslation(record: VideoRecord) {
  return pickPreferredTranslation(record.translations);
}

export function getVideoTranslation(
  record: VideoRecord,
  language: ContentLanguage,
) {
  return getTranslationByLanguage(record.translations, language);
}

export function getPrimaryPodcastTranslation(record: PodcastRecord) {
  return pickPreferredTranslation(record.translations);
}

export function getPodcastTranslation(
  record: PodcastRecord,
  language: ContentLanguage,
) {
  return getTranslationByLanguage(record.translations, language);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
