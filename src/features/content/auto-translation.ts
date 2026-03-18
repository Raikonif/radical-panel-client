import {
  createCase,
  createPodcast,
  createVideo,
  getCaseById,
  getPodcastById,
  getVideoById,
  saveCaseTranslation,
  savePodcastTranslation,
  saveVideoTranslation,
} from "@/features/content/api";
import { slugify } from "@/features/content/types";
import type {
  CaseFormValues,
  CaseRecord,
  PodcastFormValues,
  PodcastRecord,
  VideoFormValues,
  VideoRecord,
} from "@/features/content/types";
import {
  getAlternateContentLanguage,
  translateTexts,
} from "@/features/translation/api";

export type AutoTranslatedCreateResult<TRecord> = {
  record: TRecord;
  translationCreated: boolean;
};

function buildTranslationContext(parts: Array<string>) {
  return parts.map((part) => part.trim()).filter(Boolean).join("\n\n");
}

async function translateCasePayload(payload: CaseFormValues) {
  const targetLanguage = getAlternateContentLanguage(payload.translation.language);
  const [title, description, diagnosis, complexity, specimen] =
    await translateTexts({
      sourceLanguage: payload.translation.language,
      targetLanguage,
      texts: [
        payload.translation.title,
        payload.translation.description,
        payload.translation.diagnosis,
        payload.translation.complexity,
        payload.translation.specimen,
      ],
      context: buildTranslationContext([
        payload.translation.description,
        payload.translation.diagnosis,
        payload.translation.specimen,
      ]),
    });

  return {
    language: targetLanguage,
    title,
    description,
    diagnosis,
    complexity,
    specimen,
    is_active: payload.translation.is_active,
  };
}

async function translateVideoPayload(payload: VideoFormValues) {
  const targetLanguage = getAlternateContentLanguage(payload.translation.language);
  const [name, description] = await translateTexts({
    sourceLanguage: payload.translation.language,
    targetLanguage,
    texts: [payload.translation.name, payload.translation.description],
    context: payload.translation.description,
  });

  return {
    language: targetLanguage,
    name,
    description,
    is_active: payload.translation.is_active,
  };
}

async function translatePodcastPayload(payload: PodcastFormValues) {
  const targetLanguage = getAlternateContentLanguage(payload.translation.language);
  const [title, body] = await translateTexts({
    sourceLanguage: payload.translation.language,
    targetLanguage,
    texts: [payload.translation.title, payload.translation.body],
    context: buildTranslationContext([
      payload.translation.title,
      payload.translation.body,
    ]),
  });

  return {
    language: targetLanguage,
    title,
    body,
    slug: slugify(title),
    is_active: payload.translation.is_active,
  };
}

export async function createCaseWithAutoTranslation(
  payload: CaseFormValues,
  userId: string,
): Promise<AutoTranslatedCreateResult<CaseRecord>> {
  const record = await createCase(payload, userId);

  try {
    const translation = await translateCasePayload(payload);
    await saveCaseTranslation(record.id, translation);

    return {
      record: await getCaseById(record.id),
      translationCreated: true,
    };
  } catch (error) {
    console.error("Unable to auto-translate case", error);

    return {
      record,
      translationCreated: false,
    };
  }
}

export async function createVideoWithAutoTranslation(
  payload: VideoFormValues,
  userId: string,
): Promise<AutoTranslatedCreateResult<VideoRecord>> {
  const record = await createVideo(payload, userId);

  try {
    const translation = await translateVideoPayload(payload);
    await saveVideoTranslation(record.id, translation);

    return {
      record: await getVideoById(record.id),
      translationCreated: true,
    };
  } catch (error) {
    console.error("Unable to auto-translate video", error);

    return {
      record,
      translationCreated: false,
    };
  }
}

export async function createPodcastWithAutoTranslation(
  payload: PodcastFormValues,
  userId: string,
): Promise<AutoTranslatedCreateResult<PodcastRecord>> {
  const record = await createPodcast(payload, userId);

  try {
    const translation = await translatePodcastPayload(payload);
    await savePodcastTranslation(record.id, translation);

    return {
      record: await getPodcastById(record.id),
      translationCreated: true,
    };
  } catch (error) {
    console.error("Unable to auto-translate podcast", error);

    return {
      record,
      translationCreated: false,
    };
  }
}
