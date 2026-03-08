export class FunctionClientError extends Error {
  readonly status?: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options: { code: string; status?: number; details?: unknown },
  ) {
    super(message);
    this.name = "FunctionClientError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}

const trimBaseUrl = (value: string): string => value.trim().replace(/\/+$/, "");

const tryParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const extractErrorMessage = (value: unknown, fallbackStatus?: number): string => {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "object" &&
    value.error !== null &&
    "message" in value.error &&
    typeof value.error.message === "string"
  ) {
    return value.error.message;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (typeof fallbackStatus === "number") {
    return `함수 호출에 실패했습니다. (status: ${fallbackStatus})`;
  }

  return "함수 호출에 실패했습니다.";
};

export const resolveFunctionsBaseUrl = (): string | null => {
  const fromFunctions = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL?.trim();
  if (fromFunctions) {
    return trimBaseUrl(fromFunctions);
  }

  const fromApi = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromApi) {
    return trimBaseUrl(fromApi);
  }

  return null;
};

export const buildFunctionUrls = (
  baseUrl: string,
  functionName: string,
): [string, ...string[]] => {
  const direct = `${baseUrl}/${functionName}`;
  if (baseUrl.includes("/functions/v1")) {
    return [direct];
  }

  return [direct, `${baseUrl}/functions/v1/${functionName}`];
};

export const callSupabaseFunction = async <TResponse>(
  functionName: string,
  payload: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<TResponse> => {
  const baseUrl = resolveFunctionsBaseUrl();
  if (!baseUrl) {
    throw new FunctionClientError("함수 기본 URL이 설정되지 않았습니다.", {
      code: "FUNCTIONS_BASE_URL_NOT_CONFIGURED",
    });
  }

  const candidates = buildFunctionUrls(baseUrl, functionName);
  let lastError: FunctionClientError | null = null;

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
    const parsed = raw ? tryParseJson(raw) : {};

    if (response.ok) {
      return parsed as TResponse;
    }

    lastError = new FunctionClientError(
      extractErrorMessage(parsed, response.status),
      {
        code: `FUNCTION_CALL_FAILED:${response.status}`,
        status: response.status,
        details: parsed,
      },
    );
  }

  throw (
    lastError ??
    new FunctionClientError("함수 호출에 실패했습니다.", {
      code: "FUNCTION_CALL_FAILED:UNKNOWN",
    })
  );
};
