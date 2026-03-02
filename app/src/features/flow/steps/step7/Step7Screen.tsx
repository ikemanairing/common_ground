import { useEffect, useMemo, useState } from "react";

type Step7ScreenProps = {
  summaryLines: string[];
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
};

const WRAP_TITLE_TEXT = "오늘 어색함이 조금은 줄었어?";
const WRAP_TITLE_TYPING_DURATION_MS = 2000;
const WRAP_BODY_TYPING_DURATION_MS = 2500;

type Step7IntroPhase = "hero" | "title" | "body" | "buttons" | "done";

const STEP7_PHASE_ORDER: Record<Step7IntroPhase, number> = {
  hero: 0,
  title: 1,
  body: 2,
  buttons: 3,
  done: 4,
};

const isStep7PhaseAtLeast = (phase: Step7IntroPhase, target: Step7IntroPhase): boolean => {
  return STEP7_PHASE_ORDER[phase] >= STEP7_PHASE_ORDER[target];
};

export default function Step7Screen({
  summaryLines,
  onBack,
  onNext,
  onFinish,
}: Step7ScreenProps) {
  const bodyText = useMemo(() => {
    if (summaryLines.length > 0) {
      return summaryLines.join("\n");
    }

    return [
      "작은 대답들이 모여서 우리 반이 만들어졌어.",
      "개인 점수나 순위는 없고,",
      "오늘은 연결만 남겨요.",
    ].join("\n");
  }, [summaryLines]);

  const [introPhase, setIntroPhase] = useState<Step7IntroPhase>("hero");
  const [titleLength, setTitleLength] = useState(0);
  const [bodyLength, setBodyLength] = useState(0);

  useEffect(() => {
    if (introPhase !== "title") {
      return;
    }

    setTitleLength(0);
    const stepMs = Math.max(
      40,
      Math.floor(WRAP_TITLE_TYPING_DURATION_MS / Math.max(1, WRAP_TITLE_TEXT.length)),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / WRAP_TITLE_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * WRAP_TITLE_TEXT.length);
      setTitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setTitleLength(WRAP_TITLE_TEXT.length);
        setIntroPhase("body");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  useEffect(() => {
    if (introPhase !== "body") {
      return;
    }

    setBodyLength(0);
    const stepMs = Math.max(
      35,
      Math.floor(WRAP_BODY_TYPING_DURATION_MS / Math.max(1, bodyText.length)),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / WRAP_BODY_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * bodyText.length);
      setBodyLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setBodyLength(bodyText.length);
        setIntroPhase("buttons");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [bodyText, introPhase]);

  const showTitle = isStep7PhaseAtLeast(introPhase, "title");
  const showBody = isStep7PhaseAtLeast(introPhase, "body");
  const showButtons = isStep7PhaseAtLeast(introPhase, "buttons");

  const visibleTitle = introPhase === "title" ? WRAP_TITLE_TEXT.slice(0, titleLength) : WRAP_TITLE_TEXT;
  const visibleBody = introPhase === "body" ? bodyText.slice(0, bodyLength) : bodyText;

  const isTitleTyping = introPhase === "title" && titleLength < WRAP_TITLE_TEXT.length;
  const isBodyTyping = introPhase === "body" && bodyLength < bodyText.length;

  return (
    <section className="selection:bg-primary/30 flex min-h-screen w-full flex-col bg-background-light font-body text-text-main-light antialiased dark:bg-background-dark dark:text-text-main-dark">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-background-light shadow-2xl dark:bg-background-dark">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light/95 px-4 py-3 backdrop-blur-sm dark:bg-background-dark/95">
          <button
            type="button"
            onClick={onBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-text-main-light transition-colors hover:bg-black/5 dark:text-text-main-dark dark:hover:bg-white/10"
            aria-label="뒤로 가기"
          >
            <span aria-hidden className="material-symbols-outlined">
              arrow_back
            </span>
          </button>
          <h2 className="flex-1 pr-10 text-center text-lg font-bold leading-tight tracking-tight">마무리</h2>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-4 text-center">
          <div
            className={[
              "relative mb-8 flex items-center justify-center",
              introPhase === "hero" ? "cg-step5-fade-2s" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onAnimationEnd={(event) => {
              if (event.target !== event.currentTarget) {
                return;
              }
              if (introPhase === "hero") {
                setIntroPhase("title");
              }
            }}
          >
            <div className="absolute h-64 w-64 animate-pulse rounded-full bg-primary/10 blur-3xl" />
            <div className="relative z-10 flex h-48 w-48 items-center justify-center rounded-full border border-primary/10 bg-surface-light shadow-lg dark:bg-surface-dark">
              <div
                className="h-full w-full rounded-full bg-cover bg-center opacity-90"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBPzw5QkQlePP2FzVy7rU19cNPWFoFYROt8mqG0b3aKoQPMg6rzonlT8Fjy62Ldz2O4onv3C7F-l285_1qKPlacwgisWkdXAkT4UrAFl5-YBCEeM3JGh7jappRdjjta8250Yn5NDENiA5xLiG-QElkhDCJzyxrFf4H9omRDNHMeIa8Z7k8VK6PhiKLLMNKagQzjAtTJQPc_Gaoj5bj66MzQQPQ-I3TSLEuUH6YcBtGv6e507Blb4Qi05u3bno004WmEMqxlf1le_gU')",
                }}
              />
              <div className="absolute inset-0 rounded-full bg-primary/5" />
            </div>
            <div
              className="absolute -bottom-2 -right-2 animate-bounce rounded-full bg-surface-light p-3 text-primary shadow-md dark:bg-surface-dark"
              style={{ animationDuration: "3s" }}
            >
              <span aria-hidden className="material-symbols-outlined text-3xl">
                favorite
              </span>
            </div>
          </div>

          <div className="mx-auto max-w-xs space-y-4">
            <h1 className="min-h-[2.8rem] whitespace-pre-line text-[28px] font-bold leading-tight tracking-tight">
              {showTitle ? visibleTitle : "\u00A0"}
              {isTitleTyping ? (
                <span aria-hidden className="cg-step1-type-caret">
                  |
                </span>
              ) : null}
            </h1>
            <p className="min-h-[5.2rem] whitespace-pre-line text-base font-normal leading-relaxed text-text-sub-light dark:text-text-sub-dark">
              {showBody ? visibleBody : "\u00A0"}
              {isBodyTyping ? (
                <span aria-hidden className="cg-step1-type-caret">
                  |
                </span>
              ) : null}
            </p>
          </div>

          <div className="min-h-[40px] flex-1" />

          <div
            className={[
              "mt-auto flex w-full flex-col gap-3",
              showButtons ? "" : "cg-step1-hidden",
              introPhase === "buttons" ? "cg-step5-fade-2s" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onAnimationEnd={(event) => {
              if (event.target !== event.currentTarget) {
                return;
              }
              if (introPhase === "buttons") {
                setIntroPhase("done");
              }
            }}
          >
            <button
              type="button"
              onClick={onNext}
              className="group relative flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary px-6 text-lg font-bold tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90"
            >
              <span className="relative z-10">다음</span>
              <div className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0" />
            </button>
            <button
              type="button"
              onClick={onFinish}
              className="flex h-14 w-full cursor-pointer items-center justify-center rounded-full bg-transparent px-6 text-base font-medium text-text-sub-light transition-colors hover:bg-black/5 dark:text-text-sub-dark dark:hover:bg-white/5"
            >
              바로 끝내기
            </button>
          </div>
        </main>

        <div className="h-6 w-full" />
      </div>
    </section>
  );
}
