import { createInitialFlowState, type FlowState } from "../features/flow/state/flowTypes";
import { STEP2_REQUIRED_CATEGORIES } from "../features/flow/steps/step2/step2.constants";
import { validateStep } from "../features/flow/validators/stepValidators";

const assert = (condition: unknown, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const createState = (overrides: Partial<FlowState> = {}): FlowState => {
  const initialState = createInitialFlowState();
  return {
    ...initialState,
    ...overrides,
    completedSteps: {
      ...initialState.completedSteps,
      ...(overrides.completedSteps ?? {}),
    },
    stepData: {
      ...initialState.stepData,
      ...(overrides.stepData ?? {}),
    },
  };
};

const buildValidStep2Interests = (): string[] => {
  return STEP2_REQUIRED_CATEGORIES.flatMap((category) => category.options.slice(0, 2));
};

const run = (): void => {
  const invalidStep1 = validateStep(
    1,
    createState({
      stepData: {
        1: { nickname: "" },
      },
    }),
  );
  assert(!invalidStep1.isValid, "step1 should reject empty nickname");

  const validStep2 = validateStep(
    2,
    createState({
      stepData: {
        2: { interests: buildValidStep2Interests() },
      },
    }),
  );
  assert(validStep2.isValid, "step2 should accept two interests per category");

  const invalidStep3 = validateStep(
    3,
    createState({
      stepData: {
        3: { topics: ["한 가지"], activity: "" },
      },
    }),
  );
  assert(!invalidStep3.isValid, "step3 should reject insufficient topic/activity selections");

  const validStep5 = validateStep(
    5,
    createState({
      stepData: {
        5: {
          q1Content: "축구 하이라이트",
          q1Reason: "같이 얘기하기 쉽다",
        },
      },
    }),
  );
  assert(validStep5.isValid, "step5 should accept q1 content/reason pair");

  const validStep8Skip = validateStep(
    8,
    createState({
      stepData: {
        8: { skipped: true, emotion: "" },
      },
    }),
  );
  assert(validStep8Skip.isValid, "step8 should allow skip flow");

  const invalidStep9 = validateStep(
    9,
    createState({
      stepData: {
        9: { summaryValue: "", summaryText: "" },
      },
    }),
  );
  assert(!invalidStep9.isValid, "step9 should require an explicit summary selection");

  const validStep10 = validateStep(
    10,
    createState({
      stepData: {
        10: { mission: "옆자리 친구에게 점심 뭐 먹어? 묻기" },
      },
    }),
  );
  assert(validStep10.isValid, "step10 should accept selected mission");

  console.log("[pass] stepValidators.spec");
};

run();
