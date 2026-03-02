import { useEffect, useState } from "react";

type Step1HeroProps = {
  onEnter: () => void;
  liveParticipantCount: number | null;
  isPresenceLoading: boolean;
  isEntering: boolean;
  isBackDisabled: boolean;
  shouldAnimateIntro: boolean;
};

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCbGNR1NJRmODtcF-J1tJ6Bh9x_7_-fUXmO8hR_CqBQwg_qMP_8-kHUkzqCU2I_-9HYAHs5_wo4z3HrG15kqv4tdXWUwl4pSI-zBKp-IxyuQy_cE7GQ1O2LSxsqDXLgkz6pr-h3aUxr9HPFvOramKwuJ3qnhsZLA3K4YM4ExZqg9Bp3ZiCnXHNGkp26Uwch9M3ntaczvd3bTy4gUKIj9Odp4ykc1mNKMZh9MFS_wRe-vUdSstzT8_N_0fmTlQYE7Gf3RtkBZThsdFk";

const TITLE_TYPING_DURATION_MS = 3000;
const TITLE_LINE_1 = "마음잇기 오리엔테이션";
const TITLE_LINE_2 = "새로운 연결을 시작하세요";
const TITLE_TOTAL_CHARS = TITLE_LINE_1.length + TITLE_LINE_2.length;
type IntroPhase = "live" | "typing" | "image" | "button" | "welcome" | "done";

export default function Step1Hero({
  onEnter,
  liveParticipantCount,
  isPresenceLoading,
  isEntering,
  isBackDisabled,
  shouldAnimateIntro,
}: Step1HeroProps) {
  const liveCountText = isPresenceLoading
    ? "같은 세션 친구 수를 불러오는 중이에요"
    : `${Math.max(0, liveParticipantCount ?? 0)}명의 친구들이 대화 중이에요`;
  const [phase, setPhase] = useState<IntroPhase>(shouldAnimateIntro ? "live" : "done");
  const [typedTitleCount, setTypedTitleCount] = useState(shouldAnimateIntro ? 0 : TITLE_TOTAL_CHARS);

  useEffect(() => {
    if (!shouldAnimateIntro) {
      setPhase("done");
      setTypedTitleCount(TITLE_TOTAL_CHARS);
      return;
    }

    setPhase("live");
    setTypedTitleCount(0);
  }, [shouldAnimateIntro]);

  useEffect(() => {
    if (phase !== "typing") {
      return;
    }

    setTypedTitleCount(0);
    const typingStepMs = Math.max(
      50,
      Math.floor(TITLE_TYPING_DURATION_MS / Math.max(1, TITLE_TOTAL_CHARS)),
    );
    const typingStartedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsedMs = Date.now() - typingStartedAt;
      const progress = Math.min(1, elapsedMs / TITLE_TYPING_DURATION_MS);
      const nextCount = Math.ceil(progress * TITLE_TOTAL_CHARS);
      setTypedTitleCount(nextCount);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setTypedTitleCount(TITLE_TOTAL_CHARS);
        setPhase("image");
      }
    }, typingStepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [phase]);

  const typedLine1 = TITLE_LINE_1.slice(0, Math.min(typedTitleCount, TITLE_LINE_1.length));
  const typedLine2 = TITLE_LINE_2.slice(0, Math.max(0, typedTitleCount - TITLE_LINE_1.length));
  const isTyping = shouldAnimateIntro && phase === "typing" && typedTitleCount < TITLE_TOTAL_CHARS;
  const isTypingLine1 = typedTitleCount < TITLE_LINE_1.length;
  const showTitle = !shouldAnimateIntro || phase !== "live";
  const showImage =
    !shouldAnimateIntro || phase === "image" || phase === "button" || phase === "welcome" || phase === "done";
  const showEnterButton = !shouldAnimateIntro || phase === "button" || phase === "welcome" || phase === "done";
  const showWelcome = !shouldAnimateIntro || phase === "welcome" || phase === "done";

  return (
    <>
      <header className="flex items-center justify-between p-4 pb-2">
        <button
          type="button"
          disabled={isBackDisabled}
          className="rounded-full p-2 text-warm-gray-600 transition-colors hover:bg-sage-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="뒤로 가기"
        >
          <span aria-hidden className="material-symbols-outlined">
            arrow_back
          </span>
        </button>
        <h2 className="flex-1 text-center text-lg font-medium leading-tight tracking-[-0.015em] text-warm-gray-800">
          오리엔테이션
        </h2>
        <button
          type="button"
          className="rounded-full p-2 text-warm-gray-600 transition-colors hover:bg-sage-100"
          aria-label="더보기"
        >
          <span aria-hidden className="material-symbols-outlined">
            more_vert
          </span>
        </button>
      </header>

      <div className="flex flex-col items-center px-6 pb-8 pt-6">
        <p
          className={[
            "mb-5 inline-flex items-center justify-center rounded-full bg-peach-100 px-4 py-1.5 text-xs font-bold tracking-wide text-peach-500",
            shouldAnimateIntro && phase === "live" ? "cg-step1-live-in" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onAnimationEnd={() => {
            if (shouldAnimateIntro && phase === "live") {
              setPhase("typing");
            }
          }}
        >
          LIVE SESSION
        </p>

        <h1
          className={[
            "mb-8 min-h-[92px] w-full text-center text-[28px] font-bold leading-[1.3] tracking-tight text-warm-gray-800",
            showTitle ? "" : "cg-step1-hidden",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="block">
            {typedLine1 || "\u00A0"}
            {isTyping && isTypingLine1 ? (
              <span aria-hidden className="cg-step1-type-caret">
                |
              </span>
            ) : null}
          </span>
          <span className="block font-medium text-sage-600">
            {typedLine2 || "\u00A0"}
            {isTyping && !isTypingLine1 ? (
              <span aria-hidden className="cg-step1-type-caret">
                |
              </span>
            ) : null}
          </span>
        </h1>

        <div className="group relative mb-8 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white ring-4 ring-white shadow-soft">
          <div
            className={[
              "h-full w-full bg-cover bg-center bg-no-repeat filter sepia-[0.2]",
              showImage ? "cg-step1-image-reveal" : "cg-step1-hidden",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ backgroundImage: `url("${HERO_IMAGE_URL}")` }}
            role="img"
            aria-label="교실에서 모인 학생들"
            onAnimationEnd={() => {
              if (shouldAnimateIntro && phase === "image") {
                setPhase("button");
              }
            }}
          />
          <div
            className={[
              "absolute inset-0 z-10 bg-gradient-to-t from-warm-gray-800/40 to-transparent",
              showImage ? "cg-step1-image-overlay-reveal" : "cg-step1-hidden",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          />

          <p
            className={[
              "absolute bottom-4 left-5 z-20 flex items-center gap-2.5",
              showImage ? "cg-step1-image-overlay-reveal" : "cg-step1-hidden",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-peach-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-peach-500" />
            </span>
            <span className="text-sm font-medium text-white drop-shadow-md">
              {liveCountText}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onEnter}
          disabled={isEntering}
          className={[
            "mb-8 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-sage-600 px-8 text-lg font-medium text-white shadow-soft transition-colors hover:bg-sage-500 disabled:cursor-not-allowed disabled:opacity-60",
            showEnterButton ? "cg-step1-fade-in" : "cg-step1-hidden",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="입장하기"
          onAnimationEnd={() => {
            if (shouldAnimateIntro && phase === "button") {
              setPhase("welcome");
            }
          }}
        >
          <span>{isEntering ? "입장 중..." : "입장하기"}</span>
          <span aria-hidden className="material-symbols-outlined text-[20px] leading-none">
            login
          </span>
        </button>

        <div
          className={[
            "mb-8 flex w-full items-center gap-4",
            showWelcome ? "cg-step1-fade-in" : "cg-step1-hidden",
          ]
            .filter(Boolean)
            .join(" ")}
          onAnimationEnd={() => {
            if (shouldAnimateIntro && phase === "welcome") {
              setPhase("done");
            }
          }}
        >
          <div className="h-px flex-1 bg-sage-100" />
          <span className="text-xs font-medium text-sage-500">환영합니다</span>
          <div className="h-px flex-1 bg-sage-100" />
        </div>
      </div>
    </>
  );
}
