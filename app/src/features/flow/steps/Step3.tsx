import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import Step3Screen from "./step3/Step3Screen";
import {
  STEP3_DEFAULT_ACTIVITY,
  STEP3_DEFAULT_TOPICS,
} from "./step3/step3.constants";

const STEP3_TOPIC_LIMIT = 2;

const normalizeList = (values: string[] | undefined): string[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) => value.trim()).filter((value) => value.length > 0);
};

export default function Step3() {
  const navigate = useNavigate();
  const { state, updateStepData, completeStep } = useFlowStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const step3Data = state.stepData[3];
  const selectedTopics = useMemo(() => {
    const fromState = normalizeList(step3Data?.topics);
    if (Array.isArray(step3Data?.topics)) {
      return fromState.slice(0, STEP3_TOPIC_LIMIT);
    }
    return STEP3_DEFAULT_TOPICS.slice(0, STEP3_TOPIC_LIMIT);
  }, [step3Data?.topics]);
  const selectedActivity =
    step3Data && "activity" in step3Data
      ? step3Data.activity?.trim() ?? ""
      : STEP3_DEFAULT_ACTIVITY;

  const handleToggleTopic = useCallback(
    (topic: string) => {
      const set = new Set(selectedTopics);
      if (set.has(topic)) {
        set.delete(topic);
      } else {
        if (set.size >= STEP3_TOPIC_LIMIT) {
          setErrorMessage("대화 주제는 2개까지 선택할 수 있어요.");
          return;
        }
        set.add(topic);
      }
      updateStepData(3, { topics: Array.from(set), activity: selectedActivity });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, selectedActivity, selectedTopics, updateStepData],
  );

  const handleSelectActivity = useCallback(
    (activity: string) => {
      updateStepData(3, { topics: selectedTopics, activity });
      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, selectedTopics, updateStepData],
  );

  const handleBack = useCallback(() => {
    navigate("/interests");
  }, [navigate]);

  const handleNext = useCallback(() => {
    if (selectedTopics.length < 2) {
      setErrorMessage("대화 주제 2개를 선택해주세요.");
      return;
    }
    if (!selectedActivity.trim()) {
      setErrorMessage("같이 해보고 싶은 활동 1개를 선택해주세요.");
      return;
    }

    updateStepData(3, { topics: selectedTopics, activity: selectedActivity });
    if (completeStep(3)) {
      navigate("/promise");
    }
  }, [completeStep, navigate, selectedActivity, selectedTopics, updateStepData]);

  return (
    <Step3Screen
      selectedTopics={selectedTopics}
      selectedActivity={selectedActivity}
      errorMessage={errorMessage}
      onToggleTopic={handleToggleTopic}
      onSelectActivity={handleSelectActivity}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
