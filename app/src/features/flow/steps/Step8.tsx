import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import Step8Screen from "./step8/Step8Screen";

export default function Step8() {
  const navigate = useNavigate();
  const { state, updateStepData, completeStep } = useFlowStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedEmotion = state.stepData[8]?.skipped
    ? ""
    : state.stepData[8]?.emotion?.trim() || "";

  const handleSelectEmotion = useCallback(
    (emotion: string) => {
      updateStepData(8, {
        emotion,
        skipped: false,
      });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, updateStepData],
  );

  const handleBack = useCallback(() => {
    navigate("/wrap-up");
  }, [navigate]);

  const handleSkip = useCallback(() => {
    updateStepData(8, {
      emotion: "",
      skipped: true,
      confirmedAt: new Date().toISOString(),
    });
    if (completeStep(8)) {
      navigate("/summary");
    }
  }, [completeStep, navigate, updateStepData]);

  const handleNext = useCallback(() => {
    if (!selectedEmotion.trim()) {
      setErrorMessage("지금 감정을 하나 선택해주세요.");
      return;
    }

    updateStepData(8, {
      emotion: selectedEmotion,
      skipped: false,
      confirmedAt: new Date().toISOString(),
    });
    if (completeStep(8)) {
      navigate("/summary");
    }
  }, [completeStep, navigate, selectedEmotion, updateStepData]);

  return (
    <Step8Screen
      selectedEmotion={selectedEmotion}
      errorMessage={errorMessage}
      onSelectEmotion={handleSelectEmotion}
      onBack={handleBack}
      onSkip={handleSkip}
      onNext={handleNext}
    />
  );
}
