export type FlowStepNo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const FLOW_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const LAST_FLOW_STEP: FlowStepNo = 10;

export interface Step1Data {
  nickname: string;
  sessionCode?: string;
  sessionId?: string;
  participantId?: string;
  joinToken?: string;
  liveParticipantCount?: number;
  avatarSeed?: string;
  orientationIntroPlayed?: boolean;
}

export interface Step2Data {
  interests: string[];
}

export interface Step3Data {
  topics: string[];
  activity: string;
}

export interface Step4Data {
  agreementAccepted: boolean;
  promiseAccepted?: boolean;
}

export interface Step5Data {
  answer: string;
  q1?: string;
  q1Content?: string;
  q1Reason?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
  q7?: string;
  q8?: string;
}

export interface Step6Data {
  activePeerId?: string;
  activePeerIndex?: number;
  comparedAt?: string;
  peerNickname?: string;
  peerAnswerMain?: string;
  peerAnswerSub?: string;
  peerAnswers?: string[];
  peerSource?: "session" | "fallback" | "none";
}

export interface Step7Data {
  reflectionNote?: string;
  continueMode?: "next" | "finish";
  wrapViewedAt?: string;
}

export interface Step8Data {
  emotion: string;
  skipped?: boolean;
  confirmedAt?: string;
}

export interface Step9Data {
  summaryValue: string;
  summaryText: string;
  confirmedAt?: string;
}

export interface Step10Data {
  mission: string;
  missionId?: string;
  missionScript?: string;
  confirmedAt?: string;
}

export interface FlowStepDataMap {
  1: Step1Data;
  2: Step2Data;
  3: Step3Data;
  4: Step4Data;
  5: Step5Data;
  6: Step6Data;
  7: Step7Data;
  8: Step8Data;
  9: Step9Data;
  10: Step10Data;
}

export type FlowCompletedSteps = Partial<Record<FlowStepNo, boolean>>;

export type FlowStepData = Partial<{
  [K in FlowStepNo]: Partial<FlowStepDataMap[K]>;
}>;

export interface FlowState {
  sessionId?: string;
  matchId?: string;
  currentStep: FlowStepNo;
  completedSteps: FlowCompletedSteps;
  stepData: FlowStepData;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

export const NEXT_STEP_BY_STEP: Record<FlowStepNo, FlowStepNo> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 8,
  8: 9,
  9: 10,
  10: 10,
};

export const createInitialFlowState = (): FlowState => {
  // [새 여정을 시작할 때 같은 기준 시각을 찍어두는 시작점] (기준 시각, Baseline Timestamp)
  const now = new Date().toISOString();
  return {
    currentStep: 1,
    completedSteps: {},
    stepData: {},
    startedAt: now,
    updatedAt: now,
  };
};
