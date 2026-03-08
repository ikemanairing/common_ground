import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import Step10Screen from "./step10/Step10Screen";
import { STEP10_MISSION_OPTIONS } from "./step10/missionOptions";

export default function Step10() {
  const navigate = useNavigate();
  const { state, updateStepData, completeStep } = useFlowStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedMissionId = useMemo(() => {
    const currentMissionId = state.stepData[10]?.missionId;
    if (currentMissionId) {
      return currentMissionId;
    }

    const currentMission = state.stepData[10]?.mission;
    if (!currentMission) {
      return null;
    }

    const byText = STEP10_MISSION_OPTIONS.find((option) => option.title === currentMission);
    return byText?.id ?? null;
  }, [state.stepData]);

  const selectedMission = useMemo(
    () =>
      STEP10_MISSION_OPTIONS.find((option) => option.id === selectedMissionId) ?? null,
    [selectedMissionId],
  );

  const handleSelectMission = useCallback(
    (missionId: string) => {
      const mission = STEP10_MISSION_OPTIONS.find((option) => option.id === missionId);
      if (!mission) {
        return;
      }

      updateStepData(10, {
        missionId: mission.id,
        mission: mission.title,
        missionScript: mission.script,
      });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, updateStepData],
  );

  const handleBack = useCallback(() => {
    const shouldReturnToWrapUp =
      state.stepData[7]?.continueMode === "finish" && !state.completedSteps[9];
    navigate(shouldReturnToWrapUp ? "/wrap-up" : "/summary");
  }, [navigate, state.completedSteps, state.stepData]);

  const handleFinish = useCallback(() => {
    if (!selectedMission) {
      setErrorMessage("내일 미션을 하나 선택해주세요.");
      return;
    }

    updateStepData(10, {
      missionId: selectedMission.id,
      mission: selectedMission.title,
      missionScript: selectedMission.script,
      confirmedAt: new Date().toISOString(),
    });
    if (completeStep(10)) {
      navigate("/done");
    }
  }, [completeStep, navigate, selectedMission, updateStepData]);

  return (
    <Step10Screen
      selectedMissionId={selectedMissionId}
      errorMessage={errorMessage}
      onSelectMission={handleSelectMission}
      onBack={handleBack}
      onFinish={handleFinish}
    />
  );
}
