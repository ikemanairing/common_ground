type SessionStatus = "pending" | "active" | "completed" | "cancelled";

import { callSupabaseFunction } from "../../../../lib/api/functionClient";

type SessionJoinResponse = {
  ok: boolean;
  data?: {
    session: {
      id: string | null;
      code: string;
      status: SessionStatus;
      currentStep: number;
    };
    participant: {
      id: string | null;
      displayName: string;
      joinToken: string | null;
    };
    participantCount: number;
  };
  error?: {
    code?: string;
    message?: string;
  };
};

type SessionPresenceResponse = {
  ok: boolean;
  data?: {
    session: {
      id: string;
      code: string;
      status: SessionStatus;
      currentStep: number;
    } | null;
    participantCount: number;
  };
  error?: {
    code?: string;
    message?: string;
  };
};

export type SessionJoinResult = {
  sessionId: string | null;
  sessionCode: string;
  participantId: string | null;
  joinToken: string;
  participantCount: number;
};

const DEFAULT_SESSION_CODE = "open";

const normalizeSessionCode = (value: string): string => {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "-");
  return normalized.length > 0 ? normalized : DEFAULT_SESSION_CODE;
};

export const resolveSessionCodeFromSearch = (
  search: string,
  fallback?: string,
): string => {
  const params = new URLSearchParams(search);
  const fromQuery =
    params.get("sessionCode") ?? params.get("session") ?? params.get("code") ?? "";

  if (fromQuery.trim()) {
    return normalizeSessionCode(fromQuery);
  }

  if (fallback?.trim()) {
    return normalizeSessionCode(fallback);
  }

  return DEFAULT_SESSION_CODE;
};

export const fetchSessionParticipantCount = async (
  sessionCode: string,
  signal?: AbortSignal,
): Promise<number> => {
  const normalizedCode = normalizeSessionCode(sessionCode);
  const response = await callSupabaseFunction<SessionPresenceResponse>(
    "session-presence",
    { sessionCode: normalizedCode },
    signal,
  );

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message ?? "PRESENCE_RESPONSE_INVALID");
  }

  return Math.max(0, response.data.participantCount ?? 0);
};

export const joinSessionAndFetchCount = async (
  payload: {
    sessionCode: string;
    displayName: string;
    joinToken: string;
  },
  signal?: AbortSignal,
): Promise<SessionJoinResult> => {
  const normalizedCode = normalizeSessionCode(payload.sessionCode);
  const response = await callSupabaseFunction<SessionJoinResponse>(
    "session-join",
    {
      sessionCode: normalizedCode,
      displayName: payload.displayName,
      joinToken: payload.joinToken,
    },
    signal,
  );

  if (!response.ok || !response.data) {
    throw new Error(response.error?.message ?? "JOIN_RESPONSE_INVALID");
  }

  return {
    sessionId: response.data.session.id,
    sessionCode: response.data.session.code,
    participantId: response.data.participant.id,
    joinToken: response.data.participant.joinToken ?? payload.joinToken,
    participantCount: Math.max(0, response.data.participantCount ?? 0),
  };
};
