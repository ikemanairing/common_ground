import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import Step5Screen from "./step5/Step5Screen";

const buildLegacyAnswer = (content: string, reason: string): string => {
  const normalizedContent = content.trim();
  const normalizedReason = reason.trim();

  if (!normalizedContent) {
    return normalizedReason;
  }

  if (!normalizedReason) {
    return normalizedContent;
  }

  return `콘텐츠: ${normalizedContent} / 이유: ${normalizedReason}`;
};

export default function Step5() {
  const navigate = useNavigate();
  const { state, updateStepData, completeStep } = useFlowStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const step5Data = state.stepData[5];
  const content = step5Data?.q1Content ?? step5Data?.q1 ?? step5Data?.answer ?? "";
  const reason = step5Data?.q1Reason ?? "";

  const handleChangeContent = useCallback(
    (value: string) => {
      const nextAnswer = buildLegacyAnswer(value, reason);
      updateStepData(5, {
        q1Content: value,
        q1Reason: reason,
        answer: nextAnswer,
        q1: nextAnswer,
      });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, reason, updateStepData],
  );

  const handleChangeReason = useCallback(
    (value: string) => {
      const nextAnswer = buildLegacyAnswer(content, value);
      updateStepData(5, {
        q1Content: content,
        q1Reason: value,
        answer: nextAnswer,
        q1: nextAnswer,
      });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [content, errorMessage, updateStepData],
  );

  const handleBack = useCallback(() => {
    navigate("/promise");
  }, [navigate]);

  const handleNext = useCallback(() => {
    const normalizedContent = content.trim();
    const normalizedReason = reason.trim();

    if (!normalizedContent) {
      setErrorMessage("콘텐츠 1개를 입력해주세요.");
      return;
    }

    if (!normalizedReason) {
      setErrorMessage("재미있게 본 이유를 입력해주세요.");
      return;
    }

    const normalizedAnswer = buildLegacyAnswer(normalizedContent, normalizedReason);

    updateStepData(5, {
      q1Content: normalizedContent,
      q1Reason: normalizedReason,
      answer: normalizedAnswer,
      q1: normalizedAnswer,
    });
    if (completeStep(5)) {
      navigate("/q2");
    }
  }, [completeStep, content, navigate, reason, updateStepData]);

  return (
    <Step5Screen
      content={content}
      reason={reason}
      errorMessage={errorMessage}
      onChangeContent={handleChangeContent}
      onChangeReason={handleChangeReason}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
