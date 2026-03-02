import type {
  ApiErrorResponse,
  CompleteFlowRequest,
  CompleteFlowResponse,
  JoinFlowRequest,
  JoinFlowResponse,
  MatchFlowRequest,
  MatchFlowResponse,
  ResumeFlowRequest,
  ResumeFlowResponse,
  SaveFlowRequest,
  SaveFlowResponse,
} from "../../types/contracts";

const DEFAULT_BASE_URL = "https://api.placeholder.common-ground.local";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions<TBody> {
  method: HttpMethod;
  path: string;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

export interface ApiClientConfig {
  baseUrl?: string;
  headers?: HeadersInit;
  fetcher?: typeof fetch;
}

interface ExtractedApiError {
  code?: string;
  message: string;
  details?: unknown;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse =>
  isObject(value) && isObject(value.error) && typeof value.error.message === "string";

const tryParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const extractApiError = (
  value: unknown,
  fallbackStatus: number,
): ExtractedApiError => {
  if (isApiErrorResponse(value)) {
    return {
      code: value.error.code,
      message: value.error.message,
      details: value.error.details,
    };
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return { message: value };
  }

  return {
    message: `요청에 실패했습니다. (status: ${fallbackStatus})`,
  };
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options: { status: number; code?: string; details?: unknown },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

export class ApiClient {
  private baseUrl: string;
  private readonly defaultHeaders: HeadersInit;
  private readonly fetcher: typeof fetch;
  private accessToken?: string;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.defaultHeaders = config.headers ?? {};
    this.fetcher = config.fetcher ?? fetch;
  }

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token ?? undefined;
  }

  join(payload: JoinFlowRequest, signal?: AbortSignal): Promise<JoinFlowResponse> {
    return this.request({
      method: "POST",
      path: "/flows/join",
      body: payload,
      signal,
    });
  }

  match(
    payload: MatchFlowRequest,
    signal?: AbortSignal,
  ): Promise<MatchFlowResponse> {
    return this.request({
      method: "POST",
      path: "/flows/match",
      body: payload,
      signal,
    });
  }

  save(payload: SaveFlowRequest, signal?: AbortSignal): Promise<SaveFlowResponse> {
    return this.request({
      method: "PUT",
      path: "/flows/save",
      body: payload,
      signal,
    });
  }

  resume(
    payload: ResumeFlowRequest,
    signal?: AbortSignal,
  ): Promise<ResumeFlowResponse> {
    return this.request({
      method: "POST",
      path: "/flows/resume",
      body: payload,
      signal,
    });
  }

  complete(
    payload: CompleteFlowRequest,
    signal?: AbortSignal,
  ): Promise<CompleteFlowResponse> {
    return this.request({
      method: "POST",
      path: "/flows/complete",
      body: payload,
      signal,
    });
  }

  private buildHeaders(extraHeaders?: HeadersInit): Headers {
    const headers = new Headers(this.defaultHeaders);
    headers.set("Content-Type", "application/json");

    if (this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    if (extraHeaders) {
      new Headers(extraHeaders).forEach((value, key) => headers.set(key, value));
    }

    return headers;
  }

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  private async request<TResponse, TBody = undefined>(
    options: RequestOptions<TBody>,
  ): Promise<TResponse> {
    const response = await this.fetcher(this.buildUrl(options.path), {
      method: options.method,
      headers: this.buildHeaders(options.headers),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });

    // [본문을 먼저 텍스트로 받아 JSON 여부를 유연하게 판단하는 안전망] (관대한 파싱, Lenient Parsing)
    const rawBody = await response.text();
    const parsedBody = rawBody ? tryParseJson(rawBody) : null;

    if (!response.ok) {
      const extracted = extractApiError(parsedBody, response.status);
      throw new ApiClientError(extracted.message, {
        status: response.status,
        code: extracted.code,
        details: extracted.details,
      });
    }

    return (parsedBody ?? ({} as unknown)) as TResponse;
  }
}

export const createApiClient = (config?: ApiClientConfig): ApiClient =>
  new ApiClient(config);

export const apiClient = createApiClient();
