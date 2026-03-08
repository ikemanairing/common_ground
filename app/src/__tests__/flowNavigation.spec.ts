import { createInitialFlowState, type FlowState } from "../features/flow/state/flowTypes";
import { completeFlowStep } from "../features/flow/state/useFlowStore";
import { canAccessRoute, getResumePath, type AppRoutePath } from "../router/flowNavigation";

const assert = (condition: unknown, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const createState = (overrides: Partial<FlowState> = {}): FlowState => {
  return {
    ...createInitialFlowState(),
    ...overrides,
    completedSteps: {
      ...createInitialFlowState().completedSteps,
      ...(overrides.completedSteps ?? {}),
    },
    stepData: {
      ...createInitialFlowState().stepData,
      ...(overrides.stepData ?? {}),
    },
  };
};

const expectResumePath = (state: FlowState, expected: AppRoutePath): void => {
  const actual = getResumePath(state);
  assert(actual === expected, `expected resume path ${expected}, got ${actual}`);
};

const expectAccess = (state: FlowState, path: AppRoutePath, expected: boolean): void => {
  const actual = canAccessRoute(state, path);
  assert(actual === expected, `expected access ${path}=${expected}, got ${actual}`);
};

const run = (): void => {
  expectResumePath(createState(), "/");

  expectResumePath(
    createState({
      stepData: {
        1: { nickname: "새싹" },
      },
    }),
    "/profile",
  );

  expectResumePath(
    createState({
      completedSteps: { 1: true, 2: true, 3: true, 4: true, 5: true },
      stepData: {
        5: {
          q2: "A",
        },
      },
    }),
    "/q3",
  );

  const q3State = createState({
    completedSteps: { 1: true, 2: true, 3: true, 4: true, 5: true },
    stepData: {
      5: {
        q2: "A",
      },
    },
  });
  expectAccess(q3State, "/q2", true);
  expectAccess(q3State, "/q3", true);
  expectAccess(q3State, "/q4", false);

  const finishBranchState = createState({
    completedSteps: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true },
    stepData: {
      7: {
        continueMode: "finish",
      },
    },
  });
  expectResumePath(finishBranchState, "/mission");
  expectAccess(finishBranchState, "/emotion", false);
  expectAccess(finishBranchState, "/mission", true);

  const completedWrapUpState = completeFlowStep(
    createState({
      completedSteps: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true },
      stepData: {
        7: {
          continueMode: "finish",
          wrapViewedAt: new Date().toISOString(),
        },
      },
    }),
    7,
    { nextStep: 10 },
  );
  assert(
    completedWrapUpState.currentStep === 10,
    `expected wrap-up finish branch currentStep=10, got ${completedWrapUpState.currentStep}`,
  );
  expectResumePath(completedWrapUpState, "/mission");

  const completedState = createState({
    completedSteps: {
      1: true,
      2: true,
      3: true,
      4: true,
      5: true,
      6: true,
      7: true,
      8: true,
      9: true,
      10: true,
    },
  });
  expectResumePath(completedState, "/done");
  expectAccess(completedState, "/done", true);

  console.log("[pass] flowNavigation.spec");
};

run();
