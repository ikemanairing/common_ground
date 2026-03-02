import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import StepQ4Screen from "./step5/StepQ4Screen";

export default function StepQ4() {
  const navigate = useNavigate();
  const { state, updateStepData } = useFlowStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const answer = state.stepData[5]?.q4 ?? "";

  const handleChangeAnswer = useCallback(
    (value: string) => {
      updateStepData(5, { q4: value });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, updateStepData],
  );

  const handleBack = useCallback(() => {
    navigate("/q3");
  }, [navigate]);

  const handleNext = useCallback(() => {
    const normalized = answer.trim();
    if (!normalized) {
      setErrorMessage("답변을 한 줄 이상 입력해주세요.");
      return;
    }

    updateStepData(5, { q4: normalized });
    navigate("/q5");
  }, [answer, navigate, updateStepData]);

  return (
    <StepQ4Screen
      answer={answer}
      errorMessage={errorMessage}
      onChangeAnswer={handleChangeAnswer}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
