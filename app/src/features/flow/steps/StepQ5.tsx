import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import StepQ5Screen from "./step5/StepQ5Screen";

export default function StepQ5() {
  const navigate = useNavigate();
  const { state, updateStepData } = useFlowStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const answer = state.stepData[5]?.q5 ?? "";

  const handleChangeAnswer = useCallback(
    (value: string) => {
      updateStepData(5, { q5: value });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, updateStepData],
  );

  const handleBack = useCallback(() => {
    navigate("/q4");
  }, [navigate]);

  const handleNext = useCallback(() => {
    const normalized = answer.trim();
    updateStepData(5, { q5: normalized });
    navigate("/q6");
  }, [answer, navigate, updateStepData]);

  return (
    <StepQ5Screen
      answer={answer}
      errorMessage={errorMessage}
      onChangeAnswer={handleChangeAnswer}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
