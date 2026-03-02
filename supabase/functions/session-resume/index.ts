import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type SessionResumeRequest = {
  joinToken?: string;
  sessionId?: string;
  sessionCode?: string;
};

type SessionResumeSuccess = {
  ok: true;
  data: {
    session: {
      id: string | null;
      code: string | null;
      status: "pending" | "active" | "completed" | "cancelled";
      currentStep: number;
    };
    participant: {
      id: string | null;
      displayName: string | null;
    };
    completedSteps: number[];
  };
};

type ErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

const badRequest = (message: string): Response =>
  jsonResponse<ErrorResponse>(
    {
      ok: false,
      error: { code: "BAD_REQUEST", message },
    },
    { status: 400 },
  );

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

  let body: SessionResumeRequest;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const joinToken = body.joinToken?.trim();
  const sessionId = body.sessionId?.trim();
  const sessionCode = body.sessionCode?.trim();

  if (!joinToken) {
    return badRequest("joinToken is required.");
  }

  if (!sessionId && !sessionCode) {
    return badRequest("Either sessionId or sessionCode is required.");
  }

  // This is a placeholder spot (database integration) for token-based resume and step recovery.
  const response: SessionResumeSuccess = {
    ok: true,
    data: {
      session: {
        id: sessionId ?? null,
        code: sessionCode ?? null,
        status: "pending",
        currentStep: 0,
      },
      participant: {
        id: null,
        displayName: null,
      },
      completedSteps: [],
    },
  };

  return jsonResponse<SessionResumeSuccess>(response, { status: 200 });
});
