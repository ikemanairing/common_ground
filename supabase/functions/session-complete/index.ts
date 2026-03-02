import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type SessionCompleteRequest = {
  sessionId?: string;
  requestedByParticipantId?: string;
};

type SessionCompleteSuccess = {
  ok: true;
  data: {
    sessionId: string;
    status: "completed";
    completedAt: string;
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

  let body: SessionCompleteRequest;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const sessionId = body.sessionId?.trim();

  if (!sessionId) {
    return badRequest("sessionId is required.");
  }

  // This is a placeholder spot (database integration) for finalization and analytics aggregation.
  const response: SessionCompleteSuccess = {
    ok: true,
    data: {
      sessionId,
      status: "completed",
      completedAt: new Date().toISOString(),
      participantCount: 0,
    },
  };

  return jsonResponse<SessionCompleteSuccess>(response, { status: 200 });
});
