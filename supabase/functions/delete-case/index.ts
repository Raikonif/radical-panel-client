import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type DeleteCaseRequest = {
  caseId: number;
};

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization." }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const jwt = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await adminClient.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const payload = (await request.json()) as DeleteCaseRequest;

    if (!payload.caseId) {
      throw new Error("Missing caseId.");
    }

    const { data: caseRow, error: caseError } = await adminClient
      .from("cases")
      .select("id, user_id")
      .eq("id", payload.caseId)
      .single();

    if (caseError) {
      throw caseError;
    }

    if (!caseRow || caseRow.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden." }), {
        status: 403,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const [translationsDelete, imagesDelete] = await Promise.all([
      adminClient.from("cases_translations").delete().eq("case_id", payload.caseId),
      adminClient.from("images_cases").delete().eq("case_id", payload.caseId),
    ]);

    if (translationsDelete.error) {
      throw translationsDelete.error;
    }

    if (imagesDelete.error) {
      throw imagesDelete.error;
    }

    const { error: deleteCaseError } = await adminClient
      .from("cases")
      .delete()
      .eq("id", payload.caseId);

    if (deleteCaseError) {
      throw deleteCaseError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected delete error.";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
