import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import Step9Screen from "./step9/Step9Screen";
import { STEP9_SUMMARY_OPTIONS } from "./step9/summaryOptions";

export default function Step9() {
  const navigate = useNavigate();
  const { state, updateStepData, completeStep } = useFlowStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedValue = state.stepData[9]?.summaryValue || "";

  const selectedOption = useMemo(
    () =>
      STEP9_SUMMARY_OPTIONS.find((option) => option.value === selectedValue) ??
      null,
    [selectedValue],
  );

  const handleSelectValue = useCallback(
    (value: string) => {
      const option = STEP9_SUMMARY_OPTIONS.find((item) => item.value === value);
      if (!option) {
        return;
      }

      updateStepData(9, {
        summaryValue: option.value,
        summaryText: option.text.replace(/\n/g, " "),
      });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, updateStepData],
  );

  const handleBack = useCallback(() => {
    navigate("/emotion");
  }, [navigate]);

  const handleNext = useCallback(() => {
    if (!selectedOption?.value) {
      setErrorMessage("오늘의 문장을 하나 선택해주세요.");
      return;
    }

    updateStepData(9, {
      summaryValue: selectedOption.value,
      summaryText: selectedOption.text.replace(/\n/g, " "),
      confirmedAt: new Date().toISOString(),
    });
    if (completeStep(9)) {
      navigate("/mission");
    }
  }, [completeStep, navigate, selectedOption, updateStepData]);

  return (
    <Step9Screen
      selectedValue={selectedValue}
      errorMessage={errorMessage}
      onSelectValue={handleSelectValue}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
