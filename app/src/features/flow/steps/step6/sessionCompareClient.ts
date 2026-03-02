import type { Step5Data } from "../../state/flowTypes";

type FunctionError = {
  code?: string;
  message?: string;
};

type StepSaveResponse = {
  ok: boolean;
  data?: {
    sessionId: string;
    participantId: string;
    stepNo: number;
    completed: boolean;
    savedAt: string;
  };
  error?: FunctionError;
};

type CompareRandomResponse = {
  ok: boolean;
  data?: {
    matched: boolean;
    candidateCount: number;
    peerParticipantId: string | null;
    peerNickname: string | null;
    peerAnswers: string[];
  };
  error?: FunctionError;
};

export type RandomPeerCompareResult = {
  matched: boolean;
  candidateCount: number;
  peerParticipantId: string | null;
  peerNickname: string | null;
  peerAnswers: string[];
};

export type Step5AnswerPayload = {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
};

const EMPTY_ANSWERS: ReadonlyArray<string> = ["", "", "", "", "", "", "", ""];

const trimAnswer = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : "";
};

const buildQ1LegacyAnswer = (
  q1Content: string,
  q1Reason: string,
  q1Legacy: string,
  answerLegacy: string,
): string => {
  if (q1Legacy) {
    return q1Legacy;
  }

  if (answerLegacy) {
    return answerLegacy;
  }

  if (!q1Content) {
    return q1Reason;
  }

  if (!q1Reason) {
    return q1Content;
  }

  return `콘텐츠: ${q1Content} / 이유: ${q1Reason}`;
};

export const buildStep5AnswerPayload = (
  step5Data: Partial<Step5Data> | undefined,
): Step5AnswerPayload => {
  const q1Content = trimAnswer(step5Data?.q1Content);
  const q1Reason = trimAnswer(step5Data?.q1Reason);
  const q1Legacy = trimAnswer(step5Data?.q1);
  const answerLegacy = trimAnswer(step5Data?.answer);

  return {
    q1: buildQ1LegacyAnswer(q1Content, q1Reason, q1Legacy, answerLegacy),
    q2: trimAnswer(step5Data?.q2),
    q3: trimAnswer(step5Data?.q3),
    q4: trimAnswer(step5Data?.q4),
    q5: trimAnswer(step5Data?.q5),
    q6: trimAnswer(step5Data?.q6),
    q7: trimAnswer(step5Data?.q7),
    q8: trimAnswer(step5Data?.q8),
  };
};

const getFunctionsBaseUrl = (): string | null => {
  const fromFunctions = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL?.trim();
  if (fromFunctions) {
    return fromFunctions.replace(/\/+$/, "");
  }

  const fromApi = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromApi) {
    return fromApi.replace(/\/+$/, "");
  }

  return null;
};

const buildFunctionUrls = (baseUrl: string, functionName: string): string[] => {
  const direct = `${baseUrl}/${functionName}`;
  if (baseUrl.includes("/functions/v1")) {
    return [direct];
  }
  return [direct, `${baseUrl}/functions/v1/${functionName}`];
};

const callFunction = async <TResponse>(
  functionName: string,
  payload: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<TResponse> => {
  const baseUrl = getFunctionsBaseUrl();
  if (!baseUrl) {
    throw new Error("FUNCTIONS_BASE_URL_NOT_CONFIGURED");
  }

  const candidates = buildFunctionUrls(baseUrl, functionName);
  let lastErrorCode = "FUNCTION_CALL_FAILED:UNKNOWN";

  for (const url of candidates) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    });

    const raw = await response.text();
    const parsed = raw ? (JSON.parse(raw) as TResponse) : ({} as TResponse);

    if (response.ok) {
      return parsed;
    }

    lastErrorCode = `FUNCTION_CALL_FAILED:${response.status}`;
  }

  throw new Error(lastErrorCode);
};

export const saveStep5AnswersToSession = async (
  payload: {
    sessionId: string;
    participantId: string;
    answers: Step5AnswerPayload;
  },
  signal?: AbortSignal,
): Promise<void> => {
  const response = await callFunction<StepSaveResponse>(
    "step-save",
    {
      sessionId: payload.sessionId,
      participantId: payload.participantId,
      stepNo: 5,
      payload: payload.answers,
      completed: true,
    },
    signal,
  );

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message ?? "STEP_SAVE_RESPONSE_INVALID");
  }
};

export const fetchRandomPeerComparison = async (
  payload: {
    sessionId: string;
    participantId: string;
  },
  signal?: AbortSignal,
): Promise<RandomPeerCompareResult> => {
  const response = await callFunction<CompareRandomResponse>(
    "compare-random",
    {
      sessionId: payload.sessionId,
      participantId: payload.participantId,
      stepNo: 5,
    },
    signal,
  );

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message ?? "COMPARE_RANDOM_RESPONSE_INVALID");
  }

  return {
    matched: response.data.matched,
    candidateCount: response.data.candidateCount,
    peerParticipantId: response.data.peerParticipantId,
    peerNickname: response.data.peerNickname,
    peerAnswers:
      Array.isArray(response.data.peerAnswers) && response.data.peerAnswers.length === 8
        ? response.data.peerAnswers
        : Array.from(EMPTY_ANSWERS),
  };
};

