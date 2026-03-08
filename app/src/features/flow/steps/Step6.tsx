import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import Step6Screen from "./step6/Step6Screen";
import { generatePeerDraft, type PeerDraft } from "./step6/peerAnswerGenerator";
import {
  buildStep5AnswerPayload,
  fetchRandomPeerComparison,
  saveStep5AnswersToSession,
} from "./step6/sessionCompareClient";

const isNonEmpty = (value: string | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

const buildFallbackPeerAnswers = (primaryAnswer: string): string[] => {
  return [
    primaryAnswer,
    '"주말마다 가는 동네 단골 카페"',
    '"친구랑 웃었던 실수담"',
    '"아침 10분 스트레칭 챌린지"',
    '"서로 편하게 공감하고 웃는 대화"',
    '"설렘, 새로운 인연을 기대하는 마음"',
    '"천천히 들어주는 말 한마디"',
    '"오늘도 괜찮다고 스스로를 다독이는 문장"',
  ];
};

const buildEmptyPeerAnswers = (): string[] => ["", "", "", "", "", "", "", ""];

export default function Step6() {
  const navigate = useNavigate();
  const { state, updateStepData, completeStep } = useFlowStore();
  const step1Data = state.stepData[1];
  const step5Data = state.stepData[5];
  const step6Data = state.stepData[6];

  const generatedDraftRef = useRef<PeerDraft | null>(null);
  if (!generatedDraftRef.current) {
    generatedDraftRef.current = generatePeerDraft(state.stepData[2]?.interests);
  }
  const generatedDraft = generatedDraftRef.current;

  const step5AnswerPayload = useMemo(
    () =>
      buildStep5AnswerPayload({
        q1Content: step5Data?.q1Content,
        q1Reason: step5Data?.q1Reason,
        q1: step5Data?.q1,
        answer: step5Data?.answer,
        q2: step5Data?.q2,
        q3: step5Data?.q3,
        q4: step5Data?.q4,
        q5: step5Data?.q5,
        q6: step5Data?.q6,
        q7: step5Data?.q7,
        q8: step5Data?.q8,
      }),
    [
      step5Data?.answer,
      step5Data?.q1,
      step5Data?.q1Content,
      step5Data?.q1Reason,
      step5Data?.q2,
      step5Data?.q3,
      step5Data?.q4,
      step5Data?.q5,
      step5Data?.q6,
      step5Data?.q7,
      step5Data?.q8,
    ],
  );

  const myAnswers = useMemo(
    () => [
      step5AnswerPayload.q1,
      step5AnswerPayload.q2,
      step5AnswerPayload.q3,
      step5AnswerPayload.q4,
      step5AnswerPayload.q5,
      step5AnswerPayload.q6,
      step5AnswerPayload.q7,
      step5AnswerPayload.q8,
    ],
    [step5AnswerPayload],
  );

  const fallbackPeerAnswers = useMemo(
    () => buildFallbackPeerAnswers(generatedDraft.peerAnswerMain),
    [generatedDraft.peerAnswerMain],
  );
  const [peerAnswers, setPeerAnswers] = useState<string[]>(
    Array.isArray(step6Data?.peerAnswers) && step6Data.peerAnswers.length === 8
      ? step6Data.peerAnswers
      : fallbackPeerAnswers,
  );
  const [peerNickname, setPeerNickname] = useState<string>(
    isNonEmpty(step6Data?.peerNickname) ? step6Data.peerNickname : generatedDraft.peerNickname,
  );
  const [peerAnswerSub, setPeerAnswerSub] = useState<string>(
    isNonEmpty(step6Data?.peerAnswerSub) ? step6Data.peerAnswerSub : generatedDraft.peerAnswerSub,
  );
  const [peerSource, setPeerSource] = useState<"session" | "fallback" | "none">(
    step6Data?.peerSource ?? "fallback",
  );
  const [isPeerLoading, setIsPeerLoading] = useState(true);

  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) {
      return;
    }
    didInitRef.current = true;

    let isDisposed = false;
    const comparedAt = step6Data?.comparedAt ?? new Date().toISOString();

    const applyFallback = (message: string): void => {
      const nextNickname = generatedDraft.peerNickname;
      if (isDisposed) {
        return;
      }
      setPeerNickname(nextNickname);
      setPeerAnswers(fallbackPeerAnswers);
      setPeerAnswerSub(message);
      setPeerSource("fallback");
      updateStepData(6, {
        activePeerId: undefined,
        peerNickname: nextNickname,
        peerAnswerMain: fallbackPeerAnswers[0] ?? "",
        peerAnswerSub: message,
        peerAnswers: fallbackPeerAnswers,
        peerSource: "fallback",
        comparedAt,
      });
    };

    const syncPeer = async (): Promise<void> => {
      if (!step1Data?.sessionId || !step1Data?.participantId) {
        applyFallback("세션 연결 정보가 없어 임시 예시 답변을 보여주고 있어요.");
        if (!isDisposed) {
          setIsPeerLoading(false);
        }
        return;
      }

      try {
        await saveStep5AnswersToSession({
          sessionId: step1Data.sessionId,
          participantId: step1Data.participantId,
          answers: step5AnswerPayload,
        });

        const result = await fetchRandomPeerComparison({
          sessionId: step1Data.sessionId,
          participantId: step1Data.participantId,
        });

        if (isDisposed) {
          return;
        }

        if (result.matched) {
          const nextPeerNickname = result.peerNickname?.trim() || generatedDraft.peerNickname;
          const nextPeerAnswers =
            result.peerAnswers.length === 8 ? result.peerAnswers : fallbackPeerAnswers;
          const nextPeerSub = "같은 세션 친구의 실제 답변이에요.";

          setPeerNickname(nextPeerNickname);
          setPeerAnswers(nextPeerAnswers);
          setPeerAnswerSub(nextPeerSub);
          setPeerSource("session");
          updateStepData(6, {
            activePeerId: result.peerParticipantId ?? undefined,
            peerNickname: nextPeerNickname,
            peerAnswerMain: nextPeerAnswers[0] ?? "",
            peerAnswerSub: nextPeerSub,
            peerAnswers: nextPeerAnswers,
            peerSource: "session",
            comparedAt,
          });
        } else {
          const nextPeerAnswers = buildEmptyPeerAnswers();
          const nextPeerSub =
            result.candidateCount > 0
              ? "친구 답변을 정리 중이에요. 잠시 후 다시 들어오면 보여줄 수 있어요."
              : "아직 같은 세션에서 Q1~Q8을 완료한 친구가 없어요.";

          setPeerNickname("대기중");
          setPeerAnswers(nextPeerAnswers);
          setPeerAnswerSub(nextPeerSub);
          setPeerSource("none");
          updateStepData(6, {
            activePeerId: undefined,
            peerNickname: "대기중",
            peerAnswerMain: "",
            peerAnswerSub: nextPeerSub,
            peerAnswers: nextPeerAnswers,
            peerSource: "none",
            comparedAt,
          });
        }
      } catch {
        applyFallback("네트워크 상태가 불안정해서 임시 예시 답변을 보여주고 있어요.");
      } finally {
        if (!isDisposed) {
          setIsPeerLoading(false);
        }
      }
    };

    void syncPeer();

    return () => {
      isDisposed = true;
    };
  }, [
    fallbackPeerAnswers,
    generatedDraft.peerNickname,
    step1Data?.participantId,
    step1Data?.sessionId,
    step5AnswerPayload,
    step6Data?.comparedAt,
    updateStepData,
  ]);

  const handleBack = useCallback(() => {
    navigate("/q8");
  }, [navigate]);

  const handleNext = useCallback(() => {
    updateStepData(6, {
      peerNickname,
      peerAnswerMain: peerAnswers[0] ?? "",
      peerAnswerSub,
      peerAnswers,
      peerSource,
      comparedAt: step6Data?.comparedAt ?? new Date().toISOString(),
    });
    if (completeStep(6)) {
      navigate("/wrap-up");
    }
  }, [
    completeStep,
    navigate,
    peerAnswerSub,
    peerAnswers,
    peerNickname,
    peerSource,
    step6Data?.comparedAt,
    updateStepData,
  ]);

  return (
    <Step6Screen
      myAnswers={myAnswers}
      peerAnswers={peerAnswers}
      peerNickname={peerNickname}
      peerAnswerSub={peerAnswerSub}
      isPeerLoading={isPeerLoading}
      hasSessionMatch={peerSource === "session"}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
