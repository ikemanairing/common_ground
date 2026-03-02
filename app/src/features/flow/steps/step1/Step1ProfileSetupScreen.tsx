import { useCallback, useEffect, useMemo, useState } from "react";
import Step1ProfileCard from "./Step1ProfileCard";
import {
  isProfileIntroPhaseAtLeast,
  type ProfileIntroPhase,
} from "./profileIntroPhases";

type Step1ProfileSetupScreenProps = {
  nickname: string;
  isSubmitting: boolean;
  onBack: () => void;
  onReroll: () => void;
  onConfirm: () => void;
};

const PROFILE_TITLE_TEXT = "프로필 설정";
const PROFILE_TITLE_TYPING_DURATION_MS = 3000;

export default function Step1ProfileSetupScreen({
  nickname,
  isSubmitting,
  onBack,
  onReroll,
  onConfirm,
}: Step1ProfileSetupScreenProps) {
  const [introPhase, setIntroPhase] = useState<ProfileIntroPhase>("title");
  const [typedTitleCount, setTypedTitleCount] = useState(0);

  useEffect(() => {
    if (introPhase !== "title") {
      return;
    }

    setTypedTitleCount(0);
    const typingStepMs = Math.max(
      50,
      Math.floor(PROFILE_TITLE_TYPING_DURATION_MS / Math.max(1, PROFILE_TITLE_TEXT.length)),
    );
    const typingStartedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsedMs = Date.now() - typingStartedAt;
      const progress = Math.min(1, elapsedMs / PROFILE_TITLE_TYPING_DURATION_MS);
      const nextCount = Math.ceil(progress * PROFILE_TITLE_TEXT.length);
      setTypedTitleCount(nextCount);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setTypedTitleCount(PROFILE_TITLE_TEXT.length);
        setIntroPhase("step");
      }
    }, typingStepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  const handleAdvancePhase = useCallback((nextPhase: ProfileIntroPhase) => {
    setIntroPhase((prevPhase) => {
      if (!isProfileIntroPhaseAtLeast(nextPhase, prevPhase)) {
        return prevPhase;
      }
      return nextPhase;
    });
  }, []);

  const typedTitle = useMemo(() => {
    if (isProfileIntroPhaseAtLeast(introPhase, "step")) {
      return PROFILE_TITLE_TEXT;
    }
    return PROFILE_TITLE_TEXT.slice(0, typedTitleCount);
  }, [introPhase, typedTitleCount]);

  const isTitleTyping =
    introPhase === "title" && typedTitleCount < PROFILE_TITLE_TEXT.length;
  const showStepBadge = isProfileIntroPhaseAtLeast(introPhase, "step");

  return (
    <section className="flex h-full min-h-full w-full items-stretch justify-center bg-sage-50 p-4">
      <div className="hide-scrollbar relative mx-auto flex h-full w-full max-w-[400px] flex-col overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl">
        <header className="flex items-center justify-between p-4 pb-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full p-2 text-warm-gray-600 transition-colors hover:bg-sage-100"
            aria-label="뒤로 가기"
          >
            <span aria-hidden className="material-symbols-outlined">
              arrow_back
            </span>
          </button>
          <h2 className="flex-1 text-center text-lg font-medium leading-tight tracking-[-0.015em] text-warm-gray-800">
            프로필 설정
          </h2>
          <div className="w-10" />
        </header>

        <section
          className="flex flex-1 flex-col rounded-t-[2.5rem] bg-white px-6 pb-8 pt-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]"
          aria-labelledby="step1-profile-title"
        >
          <div className="mx-auto mb-6 mt-2 h-1.5 w-12 rounded-full bg-sage-100" aria-hidden="true" />

          <div className="mb-6 flex items-center justify-between">
            <h3 id="step1-profile-title" className="text-xl font-bold text-warm-gray-800">
              {typedTitle || "\u00A0"}
              {isTitleTyping ? (
                <span aria-hidden className="cg-step1-type-caret">
                  |
                </span>
              ) : null}
            </h3>
            <span
              className={[
                "rounded-full bg-sage-50 px-3 py-1 text-sm text-sage-500",
                showStepBadge ? "" : "cg-step1-hidden",
                introPhase === "step" ? "cg-step1-profile-fade-2s" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget) {
                  return;
                }
                if (introPhase === "step") {
                  handleAdvancePhase("avatar");
                }
              }}
            >
              1 / 3 단계
            </span>
          </div>

          <Step1ProfileCard
            nickname={nickname}
            onReroll={onReroll}
            onConfirm={onConfirm}
            isEntering={isSubmitting}
            introPhase={introPhase}
            onAdvancePhase={handleAdvancePhase}
          />
        </section>
      </div>
    </section>
  );
}
