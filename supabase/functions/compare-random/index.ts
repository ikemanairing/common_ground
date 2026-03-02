import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type CompareRandomRequest = {
  sessionId?: string;
  participantId?: string;
  stepNo?: number;
};

type CompareRandomSuccess = {
  ok: true;
  data: {
    matched: boolean;
    candidateCount: number;
    peerParticipantId: string | null;
    peerNickname: string | null;
    peerAnswers: string[];
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
  participant_id: string;
  payload: Record<string, unknown>;
  completed: boolean;
};

type ParticipantRow = {
  id: string;
  display_name: string;
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

const toAnswer = (payload: Record<string, unknown>, key: string): string => {
  const value = payload[key];
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const toQ1Answer = (payload: Record<string, unknown>): string => {
  const q1 = toAnswer(payload, "q1");
  if (q1) {
    return q1;
  }

  const answerLegacy = toAnswer(payload, "answer");
  if (answerLegacy) {
    return answerLegacy;
  }

  const content = toAnswer(payload, "q1Content");
  const reason = toAnswer(payload, "q1Reason");
  if (content && reason) {
    return `콘텐츠: ${content} / 이유: ${reason}`;
  }

  return content || reason;
};

const extractPeerAnswers = (payload: Record<string, unknown>): string[] => {
  return [
    toQ1Answer(payload),
    toAnswer(payload, "q2"),
    toAnswer(payload, "q3"),
    toAnswer(payload, "q4"),
    toAnswer(payload, "q5"),
    toAnswer(payload, "q6"),
    toAnswer(payload, "q7"),
    toAnswer(payload, "q8"),
  ];
};

const countFilledAnswers = (answers: string[]): number =>
  answers.filter((answer) => answer.length > 0).length;

const pickRandomCandidate = <T>(items: T[]): T => {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
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

  let body: CompareRandomRequest;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const sessionId = body.sessionId?.trim();
  const participantId = body.participantId?.trim();
  const stepNo = body.stepNo ?? 5;

  if (!sessionId) {
    return badRequest("sessionId is required.");
  }

  if (!participantId) {
    return badRequest("participantId is required.");
  }

  if (stepNo !== 5) {
    return badRequest("stepNo must be 5.");
  }

  try {
    const encodedSessionId = encodeURIComponent(sessionId);
    const encodedParticipantId = encodeURIComponent(participantId);

    const candidateRows = await supabaseRequest<ParticipantStepRow[]>(
      `/participant_steps?session_id=eq.${encodedSessionId}&step_no=eq.5&participant_id=neq.${encodedParticipantId}&completed=eq.true&select=participant_id,payload,completed`,
      { method: "GET" },
    );

    const validCandidates = candidateRows
      .map((row) => {
        const answers = extractPeerAnswers(row.payload ?? {});
        return {
          participantId: row.participant_id,
          answers,
          answerCount: countFilledAnswers(answers),
        };
      })
      .filter((row) => row.answerCount >= 8);

    if (validCandidates.length === 0) {
      const response: CompareRandomSuccess = {
        ok: true,
        data: {
          matched: false,
          candidateCount: candidateRows.length,
          peerParticipantId: null,
          peerNickname: null,
          peerAnswers: ["", "", "", "", "", "", "", ""],
        },
      };
      return jsonResponse<CompareRandomSuccess>(response, { status: 200 });
    }

    const picked = pickRandomCandidate(validCandidates);
    const encodedPeerId = encodeURIComponent(picked.participantId);

    const peerRows = await supabaseRequest<ParticipantRow[]>(
      `/participants?session_id=eq.${encodedSessionId}&id=eq.${encodedPeerId}&select=id,display_name&limit=1`,
      { method: "GET" },
    );

    const peerNickname = peerRows[0]?.display_name?.trim() || null;

    const response: CompareRandomSuccess = {
      ok: true,
      data: {
        matched: true,
        candidateCount: validCandidates.length,
        peerParticipantId: picked.participantId,
        peerNickname,
        peerAnswers: picked.answers,
      },
    };
    return jsonResponse<CompareRandomSuccess>(response, { status: 200 });
  } catch {
    return serverError("Failed to load random comparison.");
  }
});
