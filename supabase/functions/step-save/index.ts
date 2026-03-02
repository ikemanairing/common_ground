import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type StepSaveRequest = {
  sessionId?: string;
  participantId?: string;
  stepNo?: number;
  payload?: Record<string, unknown>;
  completed?: boolean;
};

type StepSaveSuccess = {
  ok: true;
  data: {
    sessionId: string;
    participantId: string;
    stepNo: number;
    completed: boolean;
    savedAt: string;
  };
};

type ErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

type ParticipantStepRow = {
  session_id: string;
  participant_id: string;
  step_no: number;
  completed: boolean;
  updated_at: string;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const badRequest = (message: string): Response =>
  jsonResponse<ErrorResponse>(
    {
      ok: false,
      error: { code: "BAD_REQUEST", message },
    },
    { status: 400 },
  );

const serverError = (message: string): Response =>
  jsonResponse<ErrorResponse>(
    {
      ok: false,
      error: { code: "INTERNAL_ERROR", message },
    },
    { status: 500 },
  );

const createSupabaseHeaders = (extraHeaders?: HeadersInit): Headers => {
  const headers = new Headers(extraHeaders);
  headers.set("apikey", SUPABASE_SERVICE_ROLE_KEY ?? "");
  headers.set("authorization", `Bearer ${SUPABASE_SERVICE_ROLE_KEY ?? ""}`);
  headers.set("content-type", "application/json");
  return headers;
};

const supabaseRequest = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: createSupabaseHeaders(init.headers),
  });

  const raw = await response.text();
  const payload = raw.length > 0 ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new Error(typeof payload === "object" ? JSON.stringify(payload) : "SUPABASE_REQUEST_FAILED");
  }

  return payload as T;
};

const touchParticipant = async (sessionId: string, participantId: string): Promise<void> => {
  const encodedSessionId = encodeURIComponent(sessionId);
  const encodedParticipantId = encodeURIComponent(participantId);

  await supabaseRequest<Array<{ id: string }>>(
    `/participants?session_id=eq.${encodedSessionId}&id=eq.${encodedParticipantId}&select=id`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        last_seen_at: new Date().toISOString(),
        status: "active",
      }),
    },
  );
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse<ErrorResponse>(
      {
        ok: false,
        error: { code: "METHOD_NOT_ALLOWED", message: "Use POST for this endpoint." },
      },
      { status: 405 },
    );
  }

  let body: StepSaveRequest;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const sessionId = body.sessionId?.trim();
  const participantId = body.participantId?.trim();
  const stepNo = body.stepNo;

  if (!sessionId) {
    return badRequest("sessionId is required.");
  }

  if (!participantId) {
    return badRequest("participantId is required.");
  }

  if (!Number.isInteger(stepNo) || (stepNo ?? 0) < 1 || (stepNo ?? 0) > 10) {
    return badRequest("stepNo must be an integer between 1 and 10.");
  }
  const normalizedStepNo = stepNo as number;

  if (
    body.payload !== undefined &&
    (typeof body.payload !== "object" || body.payload === null || Array.isArray(body.payload))
  ) {
    return badRequest("payload must be a JSON object.");
  }

  try {
    const now = new Date().toISOString();
    const completed = body.completed ?? false;
    const rows = await supabaseRequest<ParticipantStepRow[]>(
      "/participant_steps?on_conflict=session_id,participant_id,step_no&select=session_id,participant_id,step_no,completed,updated_at",
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify([
          {
            session_id: sessionId,
            participant_id: participantId,
            step_no: normalizedStepNo,
            payload: body.payload ?? {},
            completed,
            completed_at: completed ? now : null,
          },
        ]),
      },
    );

    if (rows.length === 0) {
      throw new Error("STEP_UPSERT_FAILED");
    }

    await touchParticipant(sessionId, participantId);

    const response: StepSaveSuccess = {
      ok: true,
      data: {
        sessionId: rows[0].session_id,
        participantId: rows[0].participant_id,
        stepNo: rows[0].step_no,
        completed: rows[0].completed,
        savedAt: rows[0].updated_at ?? now,
      },
    };

    return jsonResponse<StepSaveSuccess>(response, { status: 200 });
  } catch {
    return serverError("Failed to save step data.");
  }
});
