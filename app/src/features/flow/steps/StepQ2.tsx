import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import StepQ2Screen from "./step5/StepQ2Screen";

export default function StepQ2() {
  const navigate = useNavigate();
  const { state, updateStepData } = useFlowStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const answer = state.stepData[5]?.q2 ?? "";

  const handleChangeAnswer = useCallback(
    (value: string) => {
      updateStepData(5, { q2: value });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, updateStepData],
  );

  const handleBack = useCallback(() => {
    navigate("/q1");
  }, [navigate]);

  const handleNext = useCallback(() => {
    const normalized = answer.trim();
    if (!normalized) {
      setErrorMessage("답변을 한 줄 이상 입력해주세요.");
      return;
    }

    updateStepData(5, { q2: normalized });
    navigate("/q3");
  }, [answer, navigate, updateStepData]);

  return (
    <StepQ2Screen
      answer={answer}
      errorMessage={errorMessage}
      onChangeAnswer={handleChangeAnswer}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
