import { useSyncExternalStore } from "react";
import {
  clearFlowState,
  loadFlowState,
  saveFlowState,
} from "../../../lib/storage/sessionStore";
import { validateStep } from "../validators/stepValidators";
import {
  FLOW_STEPS,
  LAST_FLOW_STEP,
  NEXT_STEP_BY_STEP,
  createInitialFlowState,
  type FlowState,
  type FlowStepDataMap,
  type FlowStepNo,
} from "./flowTypes";

type Listener = () => void;

const listeners = new Set<Listener>();
let flowState: FlowState = loadFlowState() ?? createInitialFlowState();

const emit = (): void => {
  // [바뀐 상태를 구독 화면에 한 번에 알리는 방송 구조] (발행-구독, Publish-Subscribe)
  listeners.forEach((listener) => listener());
};

const setFlowState = (updater: (previous: FlowState) => FlowState): void => {
  const next = updater(flowState);
  if (next === flowState) {
    return;
  }

  flowState = next;
  saveFlowState(flowState);
  emit();
};

const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = (): FlowState => flowState;

const canAccessStepWithState = (state: FlowState, stepNo: FlowStepNo): boolean => {
  if (stepNo === 1) {
    return true;
  }

  for (const step of FLOW_STEPS) {
    if (step >= stepNo) {
      break;
    }

    if (!state.completedSteps[step]) {
      return false;
    }
  }

  return true;
};

export interface UseFlowStoreResult {
  state: FlowState;
  updateStepData: <TStep extends FlowStepNo>(
    stepNo: TStep,
    payload: Partial<FlowStepDataMap[TStep]>,
  ) => void;
  completeStep: (stepNo: FlowStepNo, options?: CompleteStepOptions) => boolean;
  canAccessStep: (stepNo: FlowStepNo) => boolean;
  resetFlow: () => void;
}

export interface CompleteStepOptions {
  nextStep?: FlowStepNo;
}

export const completeFlowStep = (
  previous: FlowState,
  stepNo: FlowStepNo,
  options?: CompleteStepOptions,
): FlowState => {
  const validation = validateStep(stepNo, previous);
  if (!validation.isValid) {
    return previous;
  }

  const now = new Date().toISOString();
  return {
    ...previous,
    currentStep: options?.nextStep ?? NEXT_STEP_BY_STEP[stepNo],
    completedSteps: {
      ...previous.completedSteps,
      [stepNo]: true,
    },
    completedAt: stepNo === LAST_FLOW_STEP ? now : previous.completedAt,
    updatedAt: now,
  };
};

export const useFlowStore = (): UseFlowStoreResult => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const updateStepData = <TStep extends FlowStepNo>(
    stepNo: TStep,
    payload: Partial<FlowStepDataMap[TStep]>,
  ): void => {
    setFlowState((previous) => {
      const previousStepData = previous.stepData[stepNo] as
        | Partial<FlowStepDataMap[TStep]>
        | undefined;
      // [기존 입력 위에 새 입력만 덮어써 누락을 막는 합치기] (얕은 병합, Shallow Merge)
      const nextStepData: Partial<FlowStepDataMap[TStep]> = {
        ...(previousStepData ?? {}),
        ...payload,
      };

      const hasChanged = Object.entries(payload).some(([key, value]) => {
        return !Object.is((previousStepData as Record<string, unknown> | undefined)?.[key], value);
      });

      // [같은 내용이면 저장을 생략해 렌더 루프를 끊는 안전장치] (중복 업데이트 차단, Redundant Update Guard)
      if (!hasChanged) {
        return previous;
      }

      return {
        ...previous,
        stepData: {
          ...previous.stepData,
          [stepNo]: nextStepData,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const completeStep = (stepNo: FlowStepNo, options?: CompleteStepOptions): boolean => {
    let didComplete = false;
    setFlowState((previous) => {
      const next = completeFlowStep(previous, stepNo, options);
      didComplete = next !== previous;
      return next;
    });
    return didComplete;
  };

  const canAccessStep = (stepNo: FlowStepNo): boolean =>
    canAccessStepWithState(state, stepNo);

  const resetFlow = (): void => {
    flowState = createInitialFlowState();
    clearFlowState();
    emit();
  };

  return {
    state,
    updateStepData,
    completeStep,
    canAccessStep,
    resetFlow,
  };
};
