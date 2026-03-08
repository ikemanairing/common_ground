import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import Step7Screen from "./step7/Step7Screen";

export default function Step7() {
  const navigate = useNavigate();
  const { state, updateStepData, completeStep } = useFlowStore();

  const summaryLines = useMemo(() => {
    const lines: string[] = [];
    const nickname = state.stepData[1]?.nickname;
    const interestsCount = state.stepData[2]?.interests?.length ?? 0;
    const hasQ1Response =
      !!state.stepData[5]?.q1Content?.trim() ||
      !!state.stepData[5]?.q1Reason?.trim() ||
      !!state.stepData[5]?.answer?.trim() ||
      !!state.stepData[5]?.q1?.trim();

    if (nickname?.trim()) {
      lines.push(`닉네임: ${nickname}`);
    }
    if (interestsCount > 0) {
      lines.push(`관심사 ${interestsCount}개 선택`);
    }
    if (hasQ1Response) {
      lines.push("내 답변 저장 완료");
    }
    return lines;
  }, [state.stepData]);

  const markStep7 = useCallback(
    (continueMode: "next" | "finish") => {
      updateStepData(7, {
        continueMode,
        wrapViewedAt: new Date().toISOString(),
      });
      return completeStep(7, continueMode === "finish" ? { nextStep: 10 } : undefined);
    },
    [completeStep, updateStepData],
  );

  const handleBack = useCallback(() => {
    navigate("/compare");
  }, [navigate]);

  const handleNext = useCallback(() => {
    if (markStep7("next")) {
      navigate("/emotion");
    }
  }, [markStep7, navigate]);

  const handleFinish = useCallback(() => {
    if (markStep7("finish")) {
      navigate("/mission");
    }
  }, [markStep7, navigate]);

  return (
    <Step7Screen
      summaryLines={summaryLines}
      onBack={handleBack}
      onNext={handleNext}
      onFinish={handleFinish}
    />
  );
}
