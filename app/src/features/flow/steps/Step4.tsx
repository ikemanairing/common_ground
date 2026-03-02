import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import Step4Screen from "./step4/Step4Screen";

export default function Step4() {
  const navigate = useNavigate();
  const { state, updateStepData, completeStep } = useFlowStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const agreementChecked = Boolean(
    state.stepData[4]?.agreementAccepted || state.stepData[4]?.promiseAccepted,
  );

  const handleToggleAgreement = useCallback(
    (checked: boolean) => {
      updateStepData(4, {
        agreementAccepted: checked,
        promiseAccepted: checked,
      });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, updateStepData],
  );

  const handleBack = useCallback(() => {
    navigate("/topics");
  }, [navigate]);

  const handleNext = useCallback(() => {
    if (!agreementChecked) {
      setErrorMessage("약속 동의 체크가 필요합니다.");
      return;
    }

    updateStepData(4, {
      agreementAccepted: true,
      promiseAccepted: true,
    });
    completeStep(4);
    navigate("/q1");
  }, [agreementChecked, completeStep, navigate, updateStepData]);

  return (
    <Step4Screen
      agreementChecked={agreementChecked}
      errorMessage={errorMessage}
      onToggleAgreement={handleToggleAgreement}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
