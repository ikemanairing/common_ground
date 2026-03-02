import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import StepQ8Screen from "./step5/StepQ8Screen";
import {
  buildStep5AnswerPayload,
  saveStep5AnswersToSession,
} from "./step6/sessionCompareClient";

export default function StepQ8() {
  const navigate = useNavigate();
  const { state, updateStepData } = useFlowStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const step1Data = state.stepData[1];
  const answer = state.stepData[5]?.q8 ?? "";

  const handleChangeAnswer = useCallback(
    (value: string) => {
      updateStepData(5, { q8: value });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, updateStepData],
  );

  const handleBack = useCallback(() => {
    navigate("/q7");
  }, [navigate]);

  const handleNext = useCallback(() => {
    const normalized = answer.trim();
    if (!normalized) {
      setErrorMessage("답변을 한 줄 이상 입력해주세요.");
      return;
    }

    const mergedStep5Data = {
      ...(state.stepData[5] ?? {}),
      q8: normalized,
    };
    updateStepData(5, { q8: normalized });

    if (step1Data?.sessionId && step1Data?.participantId) {
      const answers = buildStep5AnswerPayload(mergedStep5Data);
      void saveStep5AnswersToSession({
        sessionId: step1Data.sessionId,
        participantId: step1Data.participantId,
        answers,
      }).catch(() => {
        // [저장이 실패해도 다음 흐름은 유지하는 완충 처리] (장애 허용, Graceful Degradation)
      });
    }

    navigate("/compare");
  }, [answer, navigate, state.stepData, step1Data?.participantId, step1Data?.sessionId, updateStepData]);

  return (
    <StepQ8Screen
      answer={answer}
      errorMessage={errorMessage}
      onChangeAnswer={handleChangeAnswer}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
