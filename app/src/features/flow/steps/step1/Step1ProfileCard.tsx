import { useEffect, useMemo, useState } from "react";
import AppSectionCard from "../../components/AppSectionCard";
import {
  isProfileIntroPhaseAtLeast,
  type ProfileIntroPhase,
} from "./profileIntroPhases";

type Step1ProfileCardProps = {
  nickname: string;
  onReroll: () => void;
  onConfirm: () => void;
  isEntering: boolean;
  introPhase: ProfileIntroPhase;
  onAdvancePhase: (nextPhase: ProfileIntroPhase) => void;
};

const PROFILE_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCCcGSVBrttlM8CsP1JzrclbEZC1vSnNlKh7jgl9P642T3Gins2xCYEiJtzd4I5EJiDxhB5HSkaD6xrIndpt5PjkXJtqjxZgf-11-UKh4za9AvOtP263rSw9jzBSE5mRoabl2KB-kJsrv7uRNUkayOyp9K8sv5X-0WxFWryeEJ46HoqqV6AhGYthOodw04vW9RkMWc9OClvvQ_Vv1Mcp4Y4NNKHHXTryXJgSSTP3Cv0jEKi07iiijaUtf5o6EaVKiGOpY04pN45zMg";
const PROFILE_SUBTITLE = "랜덤으로 배정된 닉네임이에요";
const PROFILE_MESSAGE = "진짜 이름은 잠시 내려두세요.\n오늘은 편안하게 마음만 나눠요.";
const NAME_AND_SUBTITLE_TYPING_DURATION_MS = 3000;
const MESSAGE_TYPING_DURATION_MS = 3000;

function RefreshIcon() {
  return (
    <span aria-hidden className="material-symbols-outlined text-[18px] leading-none">
      autorenew
    </span>
  );
}

export default function Step1ProfileCard({
  nickname,
  onReroll,
  onConfirm,
  isEntering,
  introPhase,
  onAdvancePhase,
}: Step1ProfileCardProps) {
  const [typedNameCount, setTypedNameCount] = useState(0);
  const [typedMessageCount, setTypedMessageCount] = useState(0);
  const nameAndSubtitleTotalLength = nickname.length + PROFILE_SUBTITLE.length;
  const isNamePhaseOrAfter = isProfileIntroPhaseAtLeast(introPhase, "name");
  const isQuotePhaseOrAfter = isProfileIntroPhaseAtLeast(introPhase, "quote");
  const isButtonsPhaseOrAfter = isProfileIntroPhaseAtLeast(introPhase, "buttons");

  useEffect(() => {
    if (introPhase !== "name") {
      if (isNamePhaseOrAfter) {
        setTypedNameCount(nameAndSubtitleTotalLength);
      } else {
        setTypedNameCount(0);
      }
      return;
    }

    setTypedNameCount(0);
    const typingStepMs = Math.max(
      50,
      Math.floor(NAME_AND_SUBTITLE_TYPING_DURATION_MS / Math.max(1, nameAndSubtitleTotalLength)),
    );
    const typingStartedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsedMs = Date.now() - typingStartedAt;
      const progress = Math.min(1, elapsedMs / NAME_AND_SUBTITLE_TYPING_DURATION_MS);
      const nextCount = Math.ceil(progress * nameAndSubtitleTotalLength);
      setTypedNameCount(nextCount);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setTypedNameCount(nameAndSubtitleTotalLength);
        onAdvancePhase("quote");
      }
    }, typingStepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase, isNamePhaseOrAfter, nameAndSubtitleTotalLength, onAdvancePhase]);

  useEffect(() => {
    if (introPhase !== "quote") {
      if (isQuotePhaseOrAfter) {
        setTypedMessageCount(PROFILE_MESSAGE.length);
      } else {
        setTypedMessageCount(0);
      }
      return;
    }

    setTypedMessageCount(0);
    const typingStepMs = Math.max(
      50,
      Math.floor(MESSAGE_TYPING_DURATION_MS / Math.max(1, PROFILE_MESSAGE.length)),
    );
    const typingStartedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsedMs = Date.now() - typingStartedAt;
      const progress = Math.min(1, elapsedMs / MESSAGE_TYPING_DURATION_MS);
      const nextCount = Math.ceil(progress * PROFILE_MESSAGE.length);
      setTypedMessageCount(nextCount);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setTypedMessageCount(PROFILE_MESSAGE.length);
        onAdvancePhase("buttons");
      }
    }, typingStepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase, isQuotePhaseOrAfter, onAdvancePhase]);

  const typedNickname = useMemo(() => {
    if (!isNamePhaseOrAfter) {
      return "";
    }
    return nickname.slice(0, Math.min(typedNameCount, nickname.length));
  }, [isNamePhaseOrAfter, nickname, typedNameCount]);

  const typedSubtitle = useMemo(() => {
    if (!isNamePhaseOrAfter) {
      return "";
    }
    const subtitleTypedCount = Math.max(0, typedNameCount - nickname.length);
    return PROFILE_SUBTITLE.slice(0, subtitleTypedCount);
  }, [isNamePhaseOrAfter, nickname.length, typedNameCount]);

  const typedMessage = useMemo(() => {
    if (!isQuotePhaseOrAfter) {
      return "";
    }
    return PROFILE_MESSAGE.slice(0, typedMessageCount);
  }, [isQuotePhaseOrAfter, typedMessageCount]);

  const isNameTyping =
    introPhase === "name" && typedNameCount < nameAndSubtitleTotalLength;
  const isTypingNicknameLine = typedNameCount < nickname.length;
  const isQuoteTyping = introPhase === "quote" && typedMessageCount < PROFILE_MESSAGE.length;

  return (
    <AppSectionCard className="flex flex-col items-center text-center">
      <div className="relative mb-5">
        <div
          className={[
            "h-24 w-24 rounded-full bg-white p-1.5 shadow-soft ring-1 ring-sage-100",
            isProfileIntroPhaseAtLeast(introPhase, "avatar") ? "" : "cg-step1-hidden",
            introPhase === "avatar" ? "cg-step1-profile-fade-2s" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) {
              return;
            }
            if (introPhase === "avatar") {
              onAdvancePhase("name");
            }
          }}
        >
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-sage-50">
            <img
              alt="Illustrated avatar of a student with glasses"
              className="h-full w-full object-cover opacity-90"
              src={PROFILE_IMAGE_URL}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onReroll}
          disabled={isEntering}
          className={[
            "absolute bottom-0 right-0 rounded-full border border-sage-100 bg-white p-2 text-sage-600 shadow-md transition-colors hover:bg-sage-50",
            isButtonsPhaseOrAfter ? "" : "cg-step1-hidden",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="닉네임 다시 뽑기"
        >
          <RefreshIcon />
        </button>
      </div>

      <h4
        className={[
          "mb-1 min-h-[2.1rem] text-2xl font-bold text-warm-gray-800",
          isNamePhaseOrAfter ? "" : "cg-step1-hidden",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {typedNickname || "\u00A0"}
        {isNameTyping && isTypingNicknameLine ? (
          <span aria-hidden className="cg-step1-type-caret">
            |
          </span>
        ) : null}
      </h4>
      <p
        className={[
          "mb-5 min-h-[1.25rem] text-sm font-medium text-sage-500",
          isNamePhaseOrAfter ? "" : "cg-step1-hidden",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {typedSubtitle || "\u00A0"}
        {isNameTyping && !isTypingNicknameLine ? (
          <span aria-hidden className="cg-step1-type-caret">
            |
          </span>
        ) : null}
      </p>

      <div
        className={[
          "mb-5 w-full rounded-xl border border-sage-100 bg-white p-4",
          isQuotePhaseOrAfter ? "" : "cg-step1-hidden",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <p className="min-h-[3rem] whitespace-pre-line text-sm leading-relaxed text-warm-gray-600">
          {typedMessage || "\u00A0"}
          {isQuoteTyping ? (
            <span aria-hidden className="cg-step1-type-caret">
              |
            </span>
          ) : null}
        </p>
      </div>

      <div
        className={[
          "flex w-full gap-3",
          isButtonsPhaseOrAfter ? "" : "cg-step1-hidden",
          introPhase === "buttons" ? "cg-step1-profile-fade-2s" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget) {
            return;
          }
          if (introPhase === "buttons") {
            onAdvancePhase("done");
          }
        }}
      >
        <button
          type="button"
          onClick={onReroll}
          disabled={isEntering}
          className="flex-1 rounded-xl border border-sage-200 py-3.5 text-sm font-medium text-sage-600 transition-colors hover:bg-sage-50 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="다시 뽑기"
        >
          다시 뽑기
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isEntering}
          className="flex-1 rounded-xl bg-peach-500 py-3.5 text-sm font-bold text-white shadow-sm transition-opacity hover:bg-peach-500/90 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="확인"
        >
          {isEntering ? "입장 중..." : "확인"}
        </button>
      </div>
    </AppSectionCard>
  );
}
