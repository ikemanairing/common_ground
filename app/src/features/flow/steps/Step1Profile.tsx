import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import Step1ProfileSetupScreen from "./step1/Step1ProfileSetupScreen";
import { useStep1Profile } from "./step1/useStep1Profile";

const createAvatarSeed = (): string => {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `avatar-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const createJoinToken = (): string => {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `join-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

export default function Step1Profile() {
  const navigate = useNavigate();
  const { state, updateStepData, completeStep } = useFlowStore();
  const step1Data = state.stepData[1];
  const { nickname, rerollNickname, ensureNickname } = useStep1Profile(step1Data?.nickname);
  const avatarSeedRef = useRef<string>(step1Data?.avatarSeed ?? createAvatarSeed());
  const joinTokenRef = useRef<string>(step1Data?.joinToken ?? createJoinToken());
  const didSyncOnMountRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (didSyncOnMountRef.current) {
      return;
    }

    didSyncOnMountRef.current = true;
    const ensuredNickname = ensureNickname();
    const hasAvatarSeed = typeof step1Data?.avatarSeed === "string" && step1Data.avatarSeed.length > 0;
    if (hasAvatarSeed) {
      avatarSeedRef.current = step1Data.avatarSeed;
    }

    updateStepData(1, {
      nickname: ensuredNickname,
      avatarSeed: avatarSeedRef.current,
      joinToken: joinTokenRef.current,
    });
  }, [ensureNickname, step1Data?.avatarSeed, updateStepData]);

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleRerollNickname = useCallback((): void => {
    const nextNickname = rerollNickname();
    updateStepData(1, {
      nickname: nextNickname,
      avatarSeed: avatarSeedRef.current,
      joinToken: joinTokenRef.current,
    });
  }, [rerollNickname, updateStepData]);

  const handleConfirm = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    updateStepData(1, {
      nickname: nickname.trim() || ensureNickname().trim(),
      avatarSeed: avatarSeedRef.current,
      joinToken: joinTokenRef.current,
    });
    completeStep(1);
    navigate("/interests");
    setIsSubmitting(false);
  }, [completeStep, ensureNickname, isSubmitting, navigate, nickname, updateStepData]);

  return (
    <Step1ProfileSetupScreen
      nickname={nickname}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onReroll={handleRerollNickname}
      onConfirm={handleConfirm}
    />
  );
}
