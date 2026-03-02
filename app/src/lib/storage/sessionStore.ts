import {
  type FlowState,
  type FlowStepNo,
  createInitialFlowState,
} from "../../features/flow/state/flowTypes";

export const FLOW_SESSION_STORAGE_KEY = "common-ground.flow-state.v1";

const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFlowStepNo = (value: unknown): value is FlowStepNo =>
  typeof value === "number" && value >= 1 && value <= 10;

const toFlowState = (value: unknown): FlowState | null => {
  if (!isObject(value)) {
    return null;
  }

  const merged = {
    ...createInitialFlowState(),
    ...value,
  } as FlowState;

  if (!isFlowStepNo(merged.currentStep)) {
    return null;
  }

  if (!isObject(merged.completedSteps) || !isObject(merged.stepData)) {
    return null;
  }

  return {
    ...merged,
    currentStep: merged.currentStep as FlowStepNo,
  };
};

export const loadFlowState = (): FlowState | null => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(FLOW_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    // [껍데기 문자열을 실제 데이터로 안전 변환하는 문지기] (역직렬화 보호, Safe Deserialization)
    return toFlowState(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const saveFlowState = (state: FlowState): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(FLOW_SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // [저장 한도를 넘겨도 앱이 멈추지 않게 조용히 통과시키는 완충 처리] (실패 허용, Graceful Degradation)
  }
};

export const clearFlowState = (): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(FLOW_SESSION_STORAGE_KEY);
};
