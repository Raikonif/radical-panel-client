import type { ContentLanguage } from "@/features/content/types";

type TranslateTextsInput = {
  sourceLanguage: ContentLanguage;
  targetLanguage: ContentLanguage;
  texts: string[];
  context?: string;
};

type DeepLTranslation = {
  text?: string;
};

type DeepLTranslateResponse = {
  translations?: DeepLTranslation[];
};

function getDeepLApiUrl() {
  return (
    (import.meta.env.VITE_DEEPL_API_URL as string | undefined)?.trim() ||
    "https://api-free.deepl.com/v2/translate"
  );
}

function getDeepLApiKey() {
  const apiKey = (
    import.meta.env.VITE_DEEPL_API_KEY as string | undefined
  )?.trim();

  if (!apiKey) {
    throw new Error(
      "Configura VITE_DEEPL_API_KEY para usar la traduccion automatica.",
    );
  }

  return apiKey;
}

function mapContentLanguageToDeepL(language: ContentLanguage) {
  return language === "es" ? "ES" : "EN";
}

export function getAlternateContentLanguage(
  language: ContentLanguage,
): ContentLanguage {
  return language === "es" ? "en" : "es";
}

// Automatic translation is client -> DeepL for now.
// There is no deployed Supabase edge-function dependency in this runtime path.
export async function translateTexts({
  sourceLanguage,
  targetLanguage,
  texts,
  context,
}: TranslateTextsInput) {
  if (texts.length === 0) {
    return [];
  }

  const payload = new URLSearchParams();
  payload.set("source_lang", mapContentLanguageToDeepL(sourceLanguage));
  payload.set("target_lang", mapContentLanguageToDeepL(targetLanguage));

  if (context?.trim()) {
    payload.set("context", context.trim());
  }

  for (const text of texts) {
    payload.append("text", text);
  }

  const response = await fetch(getDeepLApiUrl(), {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${getDeepLApiKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });

  if (!response.ok) {
    throw new Error("DeepL no pudo traducir el contenido.");
  }

  const data = (await response.json()) as DeepLTranslateResponse;

  if (!data || !Array.isArray(data.translations)) {
    throw new Error("DeepL no devolvio una respuesta valida.");
  }

  if (data.translations.length !== texts.length) {
    throw new Error("DeepL devolvio una cantidad inesperada de traducciones.");
  }

  return data.translations.map((translation) => translation.text ?? "");
}
