import type {
  FlowCompletedSteps,
  FlowStepData,
  FlowStepDataMap,
  FlowStepNo,
} from "../features/flow/state/flowTypes";

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
}

export interface FlowProgressSnapshot {
  currentStep: FlowStepNo;
  completedSteps: FlowCompletedSteps;
  stepData: FlowStepData;
  updatedAt: string;
}

export interface JoinFlowRequest {
  classroomId: string;
  nickname: string;
  avatarSeed?: string;
}

export interface JoinFlowResponse {
  sessionId: string;
  participantId: string;
  joinedAt: string;
  progress: FlowProgressSnapshot;
}

export interface MatchFlowRequest {
  sessionId: string;
  interests: string[];
  preferredGroupSize?: 2 | 3;
}

export interface MatchFlowResponse {
  sessionId: string;
  matchId: string;
  status: "pending" | "matched";
  groupSize: 2 | 3;
  peerParticipantIds: string[];
}

export interface SaveFlowRequest {
  sessionId: string;
  progress: FlowProgressSnapshot;
}

export interface SaveFlowResponse {
  sessionId: string;
  revision: number;
  savedAt: string;
}

export interface ResumeFlowRequest {
  sessionId: string;
}

export interface ResumeFlowResponse {
  sessionId: string;
  participantId: string;
  matchId?: string;
  resumedAt: string;
  progress: FlowProgressSnapshot;
}

export interface CompleteFlowRequest {
  sessionId: string;
  completedAt?: string;
  finalSelection?: {
    emotion?: FlowStepDataMap[8]["emotion"];
    summaryValue?: FlowStepDataMap[9]["summaryValue"];
    summaryText?: FlowStepDataMap[9]["summaryText"];
    mission?: FlowStepDataMap[10]["mission"];
  };
}

export interface CompleteFlowResponse {
  sessionId: string;
  status: "completed";
  completedAt: string;
}
