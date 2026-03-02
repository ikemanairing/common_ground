import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import StepQ3Screen from "./step5/StepQ3Screen";

export default function StepQ3() {
  const navigate = useNavigate();
  const { state, updateStepData } = useFlowStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const answer = state.stepData[5]?.q3 ?? "";

  const handleChangeAnswer = useCallback(
    (value: string) => {
      updateStepData(5, { q3: value });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, updateStepData],
  );

  const handleBack = useCallback(() => {
    navigate("/q2");
  }, [navigate]);

  const handleNext = useCallback(() => {
    const normalized = answer.trim();
    if (!normalized) {
      setErrorMessage("답변을 한 줄 이상 입력해주세요.");
      return;
    }

    updateStepData(5, { q3: normalized });
    navigate("/q4");
  }, [answer, navigate, updateStepData]);

  return (
    <StepQ3Screen
      answer={answer}
      errorMessage={errorMessage}
      onChangeAnswer={handleChangeAnswer}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
