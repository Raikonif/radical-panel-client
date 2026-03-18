const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ContentLanguage = "es" | "en";

type TranslateRequest = {
  sourceLanguage: ContentLanguage;
  targetLanguage: ContentLanguage;
  texts: string[];
  context?: string;
};

function toDeepLSourceLanguage(language: ContentLanguage) {
  return language === "es" ? "ES" : "EN";
}

function toDeepLTargetLanguage(language: ContentLanguage) {
  return language === "es" ? "ES" : "EN-US";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authKey = Deno.env.get("DEEP_API_KEY");
    const apiDomain = Deno.env.get("DEEP_API_DOMAIN");

    if (!authKey) {
      throw new Error("Missing DEEP_API_KEY.");
    }

    if (!apiDomain) {
      throw new Error("Missing DEEP_API_DOMAIN.");
    }

    const payload = (await request.json()) as TranslateRequest;

    if (!Array.isArray(payload.texts) || payload.texts.length === 0) {
      throw new Error("Missing texts.");
    }

    const response = await fetch(`${apiDomain}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${authKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: payload.texts,
        source_lang: toDeepLSourceLanguage(payload.sourceLanguage),
        target_lang: toDeepLTargetLanguage(payload.targetLanguage),
        context: payload.context,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : "DeepL request failed.";

      return new Response(JSON.stringify({ error: message }), {
        status: response.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        translations: Array.isArray(data.translations)
          ? data.translations.map(
              (translation: { text: string }) => translation.text,
            )
          : [],
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected translation error.";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
