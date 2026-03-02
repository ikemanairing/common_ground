import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type SessionJoinRequest = {
  sessionCode?: string;
  displayName?: string;
  joinToken?: string;
};

type SessionJoinSuccess = {
  ok: true;
  data: {
    session: {
      id: string;
      code: string;
      status: "pending" | "active" | "completed" | "cancelled";
      currentStep: number;
    };
    participant: {
      id: string;
      displayName: string;
      joinToken: string;
    };
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

type ParticipantRow = {
  id: string;
  display_name: string;
  join_token: string;
  status: "joined" | "active" | "completed" | "left";
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

const createJoinToken = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `join-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

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

const getOrCreateSession = async (sessionCode: string): Promise<SessionRow> => {
  const encoded = encodeURIComponent(sessionCode);

  const existing = await supabaseRequest<SessionRow[]>(
    `/sessions?code=eq.${encoded}&select=id,code,status,current_step&limit=1`,
    { method: "GET" },
  );
  if (existing.length > 0) {
    return existing[0];
  }

  try {
    const created = await supabaseRequest<SessionRow[]>(
      "/sessions?select=id,code,status,current_step",
      {
        method: "POST",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify([
          {
            code: sessionCode,
            status: "active",
            current_step: 1,
          },
        ]),
      },
    );
    if (created.length > 0) {
      return created[0];
    }
  } catch {
    const raceFetched = await supabaseRequest<SessionRow[]>(
      `/sessions?code=eq.${encoded}&select=id,code,status,current_step&limit=1`,
      { method: "GET" },
    );
    if (raceFetched.length > 0) {
      return raceFetched[0];
    }
  }

  throw new Error("SESSION_UPSERT_FAILED");
};

const upsertParticipant = async (payload: {
  sessionId: string;
  displayName: string;
  joinToken: string;
}): Promise<ParticipantRow> => {
  const now = new Date().toISOString();
  const rows = await supabaseRequest<ParticipantRow[]>(
    "/participants?on_conflict=session_id,join_token&select=id,display_name,join_token,status",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          session_id: payload.sessionId,
          display_name: payload.displayName,
          join_token: payload.joinToken,
          status: "joined",
          last_seen_at: now,
        },
      ]),
    },
  );

  if (rows.length === 0) {
    throw new Error("PARTICIPANT_UPSERT_FAILED");
  }

  return rows[0];
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

  let body: SessionJoinRequest;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const sessionCode = body.sessionCode?.trim();
  const displayName = body.displayName?.trim();

  if (!sessionCode) {
    return badRequest("sessionCode is required.");
  }

  if (!displayName) {
    return badRequest("displayName is required.");
  }

  try {
    const normalizedSessionCode = normalizeSessionCode(sessionCode);
    const session = await getOrCreateSession(normalizedSessionCode);
    const participant = await upsertParticipant({
      sessionId: session.id,
      displayName,
      joinToken: body.joinToken?.trim() || createJoinToken(),
    });
    const participantCount = await countActiveParticipants(session.id);

    const response: SessionJoinSuccess = {
      ok: true,
      data: {
        session: {
          id: session.id,
          code: session.code,
          status: session.status,
          currentStep: session.current_step,
        },
        participant: {
          id: participant.id,
          displayName: participant.display_name,
          joinToken: participant.join_token,
        },
        participantCount,
      },
    };

    return jsonResponse<SessionJoinSuccess>(response, { status: 200 });
  } catch {
    return serverError("Failed to join session.");
  }
});
