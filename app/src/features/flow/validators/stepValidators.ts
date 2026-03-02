import {
  FLOW_STEPS,
  type FlowState,
  type FlowStepDataMap,
  type FlowStepNo,
} from "../state/flowTypes";
import { getStep2CategoryRuleError } from "../steps/step2/step2.constants";

export interface StepValidationResult {
  isValid: boolean;
  reason?: string;
}

export type StepValidator<TStep extends FlowStepNo> = (
  payload: Partial<FlowStepDataMap[TStep]> | undefined,
  state: FlowState,
) => StepValidationResult;

const valid = (): StepValidationResult => ({ isValid: true });

const invalid = (reason: string): StepValidationResult => ({
  isValid: false,
  reason,
});

const countTruthyStrings = (values: string[] | undefined): number => {
  if (!Array.isArray(values)) {
    return 0;
  }

  return values.filter((value) => value.trim().length > 0).length;
};

export const stepValidators: { [K in FlowStepNo]: StepValidator<K> } = {
  1: (payload) =>
    payload?.nickname?.trim()
      ? valid()
      : invalid("닉네임을 입력해주세요."),
  2: (payload) => {
    const categoryRuleError = getStep2CategoryRuleError(payload?.interests ?? []);
    return categoryRuleError ? invalid(categoryRuleError) : valid();
  },
  3: (payload) => {
    const selectedTopics = countTruthyStrings(payload?.topics);
    if (selectedTopics < 2) {
      return invalid("대화 주제를 2개 이상 선택해주세요.");
    }

    if (!payload?.activity?.trim()) {
      return invalid("같이 해보고 싶은 활동 1개를 선택해주세요.");
    }

    return valid();
  },
  4: (payload) =>
    payload?.agreementAccepted || payload?.promiseAccepted
      ? valid()
      : invalid("약속 동의 체크가 필요합니다."),
  5: (payload) => {
    const hasNewShape = typeof payload?.q1Content === "string" || typeof payload?.q1Reason === "string";
    if (hasNewShape) {
      if (!payload?.q1Content?.trim()) {
        return invalid("콘텐츠 1개를 입력해주세요.");
      }
      if (!payload?.q1Reason?.trim()) {
        return invalid("재미있게 본 이유를 입력해주세요.");
      }
      return valid();
    }

    return payload?.answer?.trim() || payload?.q1?.trim()
      ? valid()
      : invalid("질문 답변을 입력해주세요.");
  },
  // [중간 비교/정리 화면은 입력 없이도 통과할 수 있게 둔 숨 고르기 단계] (읽기 단계, Passive Step)
  6: () => valid(),
  7: () => valid(),
  8: (payload) => {
    if (payload?.skipped) {
      return valid();
    }

    return payload?.emotion?.trim()
      ? valid()
      : invalid("지금 감정을 하나 선택해주세요.");
  },
  9: (payload) =>
    payload?.summaryValue?.trim() || payload?.summaryText?.trim()
      ? valid()
      : invalid("오늘의 문장을 선택해주세요."),
  10: (payload) =>
    payload?.mission?.trim()
      ? valid()
      : invalid("내일 미션을 하나 선택해주세요."),
};

export const validateStep = <TStep extends FlowStepNo>(
  stepNo: TStep,
  state: FlowState,
): StepValidationResult => {
  const stepData = state.stepData[stepNo] as
    | Partial<FlowStepDataMap[TStep]>
    | undefined;
  return stepValidators[stepNo](stepData, state);
};

export const validateAllSteps = (
  state: FlowState,
): Record<FlowStepNo, StepValidationResult> => {
  return FLOW_STEPS.reduce((accumulator, stepNo) => {
    accumulator[stepNo] = validateStep(stepNo, state);
    return accumulator;
  }, {} as Record<FlowStepNo, StepValidationResult>);
};
