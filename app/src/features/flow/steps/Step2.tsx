import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import Step2Screen from "./step2/Step2Screen";
import {
  STEP2_DEFAULT_INTERESTS,
  STEP2_MAX_INTERESTS_PER_CATEGORY,
  STEP2_REQUIRED_CATEGORIES,
  getStep2CategoryIdByInterest,
  getStep2CategoryRuleError,
  getStep2ProgressiveVisibleCategoryCount,
  isStep2CategoryRuleSatisfied,
  normalizeStep2Interests,
} from "./step2/step2.constants";

const areStringArraysEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }
  return true;
};

export default function Step2() {
  const navigate = useNavigate();
  const { state, updateStepData, completeStep } = useFlowStore();
  const existingInterests = state.stepData[2]?.interests;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const totalRequiredCategoryCount = STEP2_REQUIRED_CATEGORIES.length;
  const selectedInterests = useMemo(() => {
    if (Array.isArray(existingInterests)) {
      return normalizeStep2Interests(existingInterests);
    }
    return normalizeStep2Interests(STEP2_DEFAULT_INTERESTS);
  }, [existingInterests]);
  const [revealedCategoryCount, setRevealedCategoryCount] = useState<number>(() => {
    if (totalRequiredCategoryCount === 0) {
      return 0;
    }

    const initialVisibleCount = getStep2ProgressiveVisibleCategoryCount(selectedInterests);
    return Math.max(1, Math.min(totalRequiredCategoryCount, initialVisibleCount || 1));
  });

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    setErrorMessage(getStep2CategoryRuleError(selectedInterests));
  }, [errorMessage, selectedInterests]);

  useEffect(() => {
    if (!Array.isArray(existingInterests)) {
      return;
    }

    if (areStringArraysEqual(existingInterests, selectedInterests)) {
      return;
    }

    updateStepData(2, { interests: selectedInterests });
  }, [existingInterests, selectedInterests, updateStepData]);

  useEffect(() => {
    if (totalRequiredCategoryCount === 0) {
      setRevealedCategoryCount(0);
      return;
    }

    const nextVisibleCount = Math.max(
      1,
      Math.min(totalRequiredCategoryCount, getStep2ProgressiveVisibleCategoryCount(selectedInterests) || 1),
    );

    setRevealedCategoryCount((previous) => Math.max(previous, nextVisibleCount));
  }, [selectedInterests, totalRequiredCategoryCount]);

  const selectedSet = useMemo(() => new Set(selectedInterests), [selectedInterests]);
  const isReadyToProceed = useMemo(
    () => isStep2CategoryRuleSatisfied(selectedInterests),
    [selectedInterests],
  );

  const handleToggleInterest = useCallback(
    (interest: string) => {
      const set = new Set(selectedInterests);

      if (set.has(interest)) {
        set.delete(interest);
      } else {
        const categoryId = getStep2CategoryIdByInterest(interest);
        if (!categoryId) {
          return;
        }

        const selectedCountInCategory = selectedInterests.reduce((count, value) => {
          return count + (getStep2CategoryIdByInterest(value) === categoryId ? 1 : 0);
        }, 0);

        if (selectedCountInCategory >= STEP2_MAX_INTERESTS_PER_CATEGORY) {
          return;
        }

        set.add(interest);
      }

      updateStepData(2, { interests: normalizeStep2Interests(Array.from(set)) });
    },
    [selectedInterests, updateStepData],
  );

  const handleClearAll = useCallback(() => {
    if (totalRequiredCategoryCount > 0) {
      setRevealedCategoryCount(1);
    }
    setErrorMessage(null);
    updateStepData(2, { interests: [] });
  }, [totalRequiredCategoryCount, updateStepData]);

  const handleBack = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleNext = useCallback(() => {
    if (!isReadyToProceed) {
      setErrorMessage(getStep2CategoryRuleError(selectedInterests));
      return;
    }

    updateStepData(2, { interests: selectedInterests });
    completeStep(2);
    navigate("/topics");
  }, [completeStep, isReadyToProceed, navigate, selectedInterests, updateStepData]);

  return (
    <Step2Screen
      selectedInterests={selectedInterests}
      selectedSet={selectedSet}
      revealedCategoryCount={revealedCategoryCount}
      isReadyToProceed={isReadyToProceed}
      errorMessage={errorMessage}
      onToggleInterest={handleToggleInterest}
      onClearAll={handleClearAll}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
