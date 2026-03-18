import type { ContentLanguage } from "@/features/content/types";
import { getSupabaseClient } from "@/lib/supabase/client";

type TranslateTextsInput = {
  sourceLanguage: ContentLanguage;
  targetLanguage: ContentLanguage;
  texts: string[];
  context?: string;
};

type TranslateTextsResponse = {
  translations: string[];
};

export function getAlternateContentLanguage(
  language: ContentLanguage,
): ContentLanguage {
  return language === "es" ? "en" : "es";
}

export async function translateTexts({
  sourceLanguage,
  targetLanguage,
  texts,
  context,
}: TranslateTextsInput) {
  if (texts.length === 0) {
    return [];
  }

  const { data, error } =
    await getSupabaseClient().functions.invoke<TranslateTextsResponse>(
      "translate-text",
      {
        body: {
          sourceLanguage,
          targetLanguage,
          texts,
          context,
        },
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !Array.isArray(data.translations)) {
    throw new Error("DeepL no devolvio una respuesta valida.");
  }

  if (data.translations.length !== texts.length) {
    throw new Error("DeepL devolvio una cantidad inesperada de traducciones.");
  }

  return data.translations;
}
