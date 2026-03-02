import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type MatchAssignRequest = {
  sessionId?: string;
  stepNo?: number;
  algorithm?: "random" | "balanced";
};

type MatchAssignSuccess = {
  ok: true;
  data: {
    sessionId: string;
    stepNo: number;
    algorithm: "random" | "balanced";
    groups: Array<{
      groupId: string | null;
      memberParticipantIds: string[];
      groupType: "pair" | "trio" | "custom";
    }>;
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

  let body: MatchAssignRequest;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const sessionId = body.sessionId?.trim();
  const stepNo = body.stepNo;
  const algorithm = body.algorithm ?? "random";

  if (!sessionId) {
    return badRequest("sessionId is required.");
  }

  if (!Number.isInteger(stepNo) || (stepNo ?? 0) < 1 || (stepNo ?? 0) > 10) {
    return badRequest("stepNo must be an integer between 1 and 10.");
  }
  const normalizedStepNo = stepNo as number;

  if (algorithm !== "random" && algorithm !== "balanced") {
    return badRequest("algorithm must be either random or balanced.");
  }

  // This is a placeholder spot (database integration) for group assignment writes.
  const response: MatchAssignSuccess = {
    ok: true,
    data: {
      sessionId,
      stepNo: normalizedStepNo,
      algorithm,
      groups: [],
    },
  };

  return jsonResponse<MatchAssignSuccess>(response, { status: 200 });
});
