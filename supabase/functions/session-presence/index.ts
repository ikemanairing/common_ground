import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type SessionPresenceRequest = {
  sessionId?: string;
  sessionCode?: string;
};

type SessionPresenceSuccess = {
  ok: true;
  data: {
    session: {
      id: string;
      code: string;
      status: "pending" | "active" | "completed" | "cancelled";
      currentStep: number;
    } | null;
    participantCount: number;
  };
};

type ErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

type SessionRow = {
  id: string;
  code: string;
  status: "pending" | "active" | "completed" | "cancelled";
  current_step: number;
};

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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

const normalizeSessionCode = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, "-");

const findSession = async (payload: {
  sessionId?: string;
  sessionCode?: string;
}): Promise<SessionRow | null> => {
  if (payload.sessionId) {
    const encodedSessionId = encodeURIComponent(payload.sessionId);
    const byId = await supabaseRequest<SessionRow[]>(
      `/sessions?id=eq.${encodedSessionId}&select=id,code,status,current_step&limit=1`,
      { method: "GET" },
    );
    return byId[0] ?? null;
  }

  if (!payload.sessionCode) {
    return null;
  }

  const encodedCode = encodeURIComponent(normalizeSessionCode(payload.sessionCode));
  const byCode = await supabaseRequest<SessionRow[]>(
    `/sessions?code=eq.${encodedCode}&select=id,code,status,current_step&limit=1`,
    { method: "GET" },
  );
  return byCode[0] ?? null;
};

const countActiveParticipants = async (sessionId: string): Promise<number> => {
  const encodedSessionId = encodeURIComponent(sessionId);
  const rows = await supabaseRequest<Array<{ id: string }>>(
    `/participants?session_id=eq.${encodedSessionId}&status=in.(joined,active)&select=id`,
    { method: "GET" },
  );
  return rows.length;
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

  let body: SessionPresenceRequest;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const sessionId = body.sessionId?.trim();
  const sessionCode = body.sessionCode?.trim();

  if (!sessionId && !sessionCode) {
    return badRequest("Either sessionId or sessionCode is required.");
  }

  try {
    const session = await findSession({
      sessionId,
      sessionCode,
    });

    if (!session) {
      const response: SessionPresenceSuccess = {
        ok: true,
        data: {
          session: null,
          participantCount: 0,
        },
      };
      return jsonResponse<SessionPresenceSuccess>(response, { status: 200 });
    }

    const participantCount = await countActiveParticipants(session.id);
    const response: SessionPresenceSuccess = {
      ok: true,
      data: {
        session: {
          id: session.id,
          code: session.code,
          status: session.status,
          currentStep: session.current_step,
        },
        participantCount,
      },
    };

    return jsonResponse<SessionPresenceSuccess>(response, { status: 200 });
  } catch {
    return serverError("Failed to load session presence.");
  }
});
