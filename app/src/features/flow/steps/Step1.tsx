import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFlowStore } from "../state/useFlowStore";
import Step1Screen from "./step1/Step1Screen";
import {
  fetchSessionParticipantCount,
  joinSessionAndFetchCount,
  resolveSessionCodeFromSearch,
} from "./step1/sessionPresenceClient";
import { useStep1Profile } from "./step1/useStep1Profile";

const PRESENCE_POLL_INTERVAL_MS = 10000;

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

export default function Step1() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, updateStepData } = useFlowStore();
  const step1Data = state.stepData[1];
  const initialNickname = step1Data?.nickname;
  const { nickname, ensureNickname } = useStep1Profile(initialNickname);
  const avatarSeedRef = useRef<string>(step1Data?.avatarSeed ?? createAvatarSeed());
  const joinTokenRef = useRef<string>(step1Data?.joinToken ?? createJoinToken());
  const liveCountRef = useRef<number | null>(step1Data?.liveParticipantCount ?? null);
  const didSyncOnMountRef = useRef(false);
  const [liveParticipantCount, setLiveParticipantCount] = useState<number | null>(
    step1Data?.liveParticipantCount ?? null,
  );
  const [isPresenceLoading, setIsPresenceLoading] = useState(true);
  const [isEntering, setIsEntering] = useState(false);
  const sessionCode = useMemo(
    () => resolveSessionCodeFromSearch(location.search, step1Data?.sessionCode),
    [location.search, step1Data?.sessionCode],
  );
  const shouldAnimateIntro = true;

  useEffect(() => {
    liveCountRef.current = liveParticipantCount;
  }, [liveParticipantCount]);

  useEffect(() => {
    if (didSyncOnMountRef.current) {
      return;
    }

    didSyncOnMountRef.current = true;
    const ensuredNickname = ensureNickname();
    const existingAvatarSeed = step1Data?.avatarSeed;
    if (typeof existingAvatarSeed === "string" && existingAvatarSeed.length > 0) {
      avatarSeedRef.current = existingAvatarSeed;
    }

    updateStepData(1, {
      nickname: ensuredNickname,
      avatarSeed: avatarSeedRef.current,
      sessionCode,
      joinToken: joinTokenRef.current,
      orientationIntroPlayed: true,
    });
  }, [ensureNickname, sessionCode, step1Data?.avatarSeed, updateStepData]);

  useEffect(() => {
    let isDisposed = false;
    let intervalId: number | null = null;

    const syncPresence = async () => {
      try {
        const count = await fetchSessionParticipantCount(sessionCode);
        if (isDisposed) {
          return;
        }
        setLiveParticipantCount(count);
      } catch {
        if (isDisposed) {
          return;
        }
        if (liveCountRef.current === null) {
          setLiveParticipantCount(0);
        }
      } finally {
        if (!isDisposed) {
          setIsPresenceLoading(false);
        }
      }
    };

    void syncPresence();
    intervalId = window.setInterval(() => {
      void syncPresence();
    }, PRESENCE_POLL_INTERVAL_MS);

    return () => {
      isDisposed = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [sessionCode]);

  useEffect(() => {
    if (liveParticipantCount === null) {
      return;
    }
    updateStepData(1, {
      sessionCode,
      liveParticipantCount,
    });
  }, [liveParticipantCount, sessionCode, updateStepData]);

  const persistStep1Data = useCallback(
    (nicknameOverride?: string, sessionId?: string | null, participantId?: string | null): void => {
      const ensuredNickname = nicknameOverride?.trim() || ensureNickname().trim();
      updateStepData(1, {
        nickname: ensuredNickname,
        avatarSeed: avatarSeedRef.current,
        sessionCode,
        sessionId: sessionId ?? step1Data?.sessionId,
        participantId: participantId ?? step1Data?.participantId,
        joinToken: joinTokenRef.current,
        liveParticipantCount: liveParticipantCount ?? undefined,
      });
    },
    [
      ensureNickname,
      liveParticipantCount,
      sessionCode,
      step1Data?.participantId,
      step1Data?.sessionId,
      updateStepData,
    ],
  );

  const handleEnter = useCallback(async () => {
    if (isEntering) {
      return;
    }
    setIsEntering(true);

    try {
      const result = await joinSessionAndFetchCount({
        sessionCode,
        displayName: nickname,
        joinToken: joinTokenRef.current,
      });

      joinTokenRef.current = result.joinToken;
      setLiveParticipantCount(result.participantCount);
      persistStep1Data(nickname, result.sessionId, result.participantId);
    } catch {
      persistStep1Data(nickname);
    }

    setIsEntering(false);
    navigate("/profile");
  }, [isEntering, navigate, nickname, persistStep1Data, sessionCode]);

  return (
    <Step1Screen
      liveParticipantCount={liveParticipantCount}
      isPresenceLoading={isPresenceLoading}
      isEntering={isEntering}
      onEnter={handleEnter}
      isBackDisabled
      shouldAnimateIntro={shouldAnimateIntro}
    />
  );
}
