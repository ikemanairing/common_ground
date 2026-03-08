import type { FlowState } from "../features/flow/state/flowTypes";

export type AppRoutePath =
  | "/"
  | "/profile"
  | "/interests"
  | "/topics"
  | "/promise"
  | "/q1"
  | "/q2"
  | "/q3"
  | "/q4"
  | "/q5"
  | "/q6"
  | "/q7"
  | "/q8"
  | "/compare"
  | "/wrap-up"
  | "/emotion"
  | "/summary"
  | "/mission"
  | "/done";

const STEP5_FOLLOW_UP_ROUTES = [
  { path: "/q2", key: "q2" },
  { path: "/q3", key: "q3" },
  { path: "/q4", key: "q4" },
  { path: "/q5", key: "q5" },
  { path: "/q6", key: "q6" },
  { path: "/q7", key: "q7" },
  { path: "/q8", key: "q8" },
] as const;

const hasNonEmptyText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const hasStep1Draft = (state: FlowState): boolean => {
  const step1 = state.stepData[1];
  return (
    hasNonEmptyText(step1?.nickname) ||
    hasNonEmptyText(step1?.sessionCode) ||
    hasNonEmptyText(step1?.joinToken) ||
    hasNonEmptyText(step1?.avatarSeed)
  );
};

const isStep5FollowUpAnswered = (
  state: FlowState,
  key: (typeof STEP5_FOLLOW_UP_ROUTES)[number]["key"],
): boolean => {
  return hasNonEmptyText(state.stepData[5]?.[key]);
};

export const getResumePath = (state: FlowState): AppRoutePath => {
  if (state.completedSteps[10]) {
    return "/done";
  }

  if (state.completedSteps[9]) {
    return "/mission";
  }

  if (state.completedSteps[8]) {
    return "/summary";
  }

  if (state.completedSteps[7]) {
    return state.stepData[7]?.continueMode === "finish" ? "/mission" : "/emotion";
  }

  if (state.completedSteps[6]) {
    return "/wrap-up";
  }

  if (state.completedSteps[5]) {
    const nextFollowUpRoute = STEP5_FOLLOW_UP_ROUTES.find(({ key }) => {
      return !isStep5FollowUpAnswered(state, key);
    });
    return nextFollowUpRoute?.path ?? "/compare";
  }

  if (state.completedSteps[4]) {
    return "/q1";
  }

  if (state.completedSteps[3]) {
    return "/promise";
  }

  if (state.completedSteps[2]) {
    return "/topics";
  }

  if (state.completedSteps[1]) {
    return "/interests";
  }

  if (hasStep1Draft(state)) {
    return "/profile";
  }

  return "/";
};

export const canAccessRoute = (state: FlowState, path: AppRoutePath): boolean => {
  switch (path) {
    case "/":
      return true;
    case "/profile":
      return hasStep1Draft(state) || !!state.completedSteps[1];
    case "/interests":
      return !!state.completedSteps[1];
    case "/topics":
      return !!state.completedSteps[2];
    case "/promise":
      return !!state.completedSteps[3];
    case "/q1":
      return !!state.completedSteps[4];
    case "/q2":
      return !!state.completedSteps[5];
    case "/q3":
      return !!state.completedSteps[5] && isStep5FollowUpAnswered(state, "q2");
    case "/q4":
      return !!state.completedSteps[5] && isStep5FollowUpAnswered(state, "q3");
    case "/q5":
      return !!state.completedSteps[5] && isStep5FollowUpAnswered(state, "q4");
    case "/q6":
      return !!state.completedSteps[5] && isStep5FollowUpAnswered(state, "q5");
    case "/q7":
      return !!state.completedSteps[5] && isStep5FollowUpAnswered(state, "q6");
    case "/q8":
      return !!state.completedSteps[5] && isStep5FollowUpAnswered(state, "q7");
    case "/compare":
      return (
        !!state.completedSteps[6] ||
        (!!state.completedSteps[5] && isStep5FollowUpAnswered(state, "q8"))
      );
    case "/wrap-up":
      return !!state.completedSteps[6];
    case "/emotion":
      return !!state.completedSteps[7] && state.stepData[7]?.continueMode !== "finish";
    case "/summary":
      return !!state.completedSteps[8] || !!state.completedSteps[9] || !!state.completedSteps[10];
    case "/mission":
      return (
        !!state.completedSteps[9] ||
        !!state.completedSteps[10] ||
        (!!state.completedSteps[7] && state.stepData[7]?.continueMode === "finish")
      );
    case "/done":
      return !!state.completedSteps[10];
    default:
      return false;
  }
};
