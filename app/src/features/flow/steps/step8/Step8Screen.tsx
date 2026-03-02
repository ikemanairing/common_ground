import { useEffect, useState } from "react";
import { STEP8_EMOTION_OPTIONS } from "./step8.constants";

type Step8ScreenProps = {
  selectedEmotion: string;
  errorMessage: string | null;
  onSelectEmotion: (emotion: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
};

const TITLE_TEXT = "지금 느낌이\n제일 가까운 건 뭐야?";
const SUBTITLE_TEXT = "오늘 대화 뒤의 감정을 하나 골라줘.";
const TITLE_TYPING_DURATION_MS = 2000;
const SUBTITLE_TYPING_DURATION_MS = 2000;

type Step8IntroPhase = "title" | "subtitle" | "options" | "buttons" | "done";

const STEP8_PHASE_ORDER: Record<Step8IntroPhase, number> = {
  title: 0,
  subtitle: 1,
  options: 2,
  buttons: 3,
  done: 4,
};

const isStep8PhaseAtLeast = (phase: Step8IntroPhase, target: Step8IntroPhase): boolean => {
  return STEP8_PHASE_ORDER[phase] >= STEP8_PHASE_ORDER[target];
};

export default function Step8Screen({
  selectedEmotion,
  errorMessage,
  onSelectEmotion,
  onBack,
  onSkip,
  onNext,
}: Step8ScreenProps) {
  const [introPhase, setIntroPhase] = useState<Step8IntroPhase>("title");
  const [titleLength, setTitleLength] = useState(0);
  const [subtitleLength, setSubtitleLength] = useState(0);

  useEffect(() => {
    if (introPhase !== "title") {
      return;
    }

    setTitleLength(0);
    const stepMs = Math.max(40, Math.floor(TITLE_TYPING_DURATION_MS / Math.max(1, TITLE_TEXT.length)));
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / TITLE_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * TITLE_TEXT.length);
      setTitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setTitleLength(TITLE_TEXT.length);
        setIntroPhase("subtitle");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  useEffect(() => {
    if (introPhase !== "subtitle") {
      return;
    }

    setSubtitleLength(0);
    const stepMs = Math.max(
      40,
      Math.floor(SUBTITLE_TYPING_DURATION_MS / Math.max(1, SUBTITLE_TEXT.length)),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / SUBTITLE_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * SUBTITLE_TEXT.length);
      setSubtitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setSubtitleLength(SUBTITLE_TEXT.length);
        setIntroPhase("options");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  const showTitle = isStep8PhaseAtLeast(introPhase, "title");
  const showSubtitle = isStep8PhaseAtLeast(introPhase, "subtitle");
  const showOptions = isStep8PhaseAtLeast(introPhase, "options");
  const showButtons = isStep8PhaseAtLeast(introPhase, "buttons");

  const visibleTitle = introPhase === "title" ? TITLE_TEXT.slice(0, titleLength) : TITLE_TEXT;
  const visibleSubtitle =
    introPhase === "subtitle" ? SUBTITLE_TEXT.slice(0, subtitleLength) : SUBTITLE_TEXT;

  const isTitleTyping = introPhase === "title" && titleLength < TITLE_TEXT.length;
  const isSubtitleTyping = introPhase === "subtitle" && subtitleLength < SUBTITLE_TEXT.length;

  return (
    <section className="selection:bg-primary/30 flex min-h-screen w-full flex-col bg-background-light font-display antialiased dark:bg-background-dark">
      <div className="relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col overflow-hidden bg-background-light shadow-2xl transition-colors duration-300 dark:bg-background-dark">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light px-4 py-3 dark:bg-background-dark">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex items-center justify-center rounded-full p-2 text-text-primary-light transition-colors hover:bg-black/5 dark:text-text-primary-dark dark:hover:bg-white/5"
          >
            <span aria-hidden className="material-symbols-outlined !text-[24px]">
              arrow_back
            </span>
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onSkip}
            className={[
              "cursor-pointer px-3 py-1 text-sm font-bold text-text-secondary-light transition-colors hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary",
              showButtons ? "" : "cg-step1-hidden",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            Skip
          </button>
        </header>

        <div className="w-full px-6 pb-4 pt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-light dark:bg-border-dark">
            <div className="h-full w-2/5 rounded-full bg-primary" />
          </div>
        </div>

        <main className="flex flex-1 flex-col overflow-y-auto px-6 pb-6">
          <h1 className="mb-3 min-h-[4.6rem] whitespace-pre-line text-[26px] font-bold leading-[1.3] tracking-tight text-text-primary-light dark:text-text-primary-dark">
            {showTitle ? visibleTitle : "\u00A0"}
            {isTitleTyping ? (
              <span aria-hidden className="cg-step1-type-caret">
                |
              </span>
            ) : null}
          </h1>

          <p className="mb-8 min-h-[2rem] text-base font-normal leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
            {showSubtitle ? visibleSubtitle : "\u00A0"}
            {isSubtitleTyping ? (
              <span aria-hidden className="cg-step1-type-caret">
                |
              </span>
            ) : null}
          </p>

          <form
            className={[
              "flex flex-col gap-3",
              showOptions ? "" : "cg-step1-hidden",
              introPhase === "options" ? "cg-step5-fade-2s" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onAnimationEnd={(event) => {
              if (event.target !== event.currentTarget) {
                return;
              }
              if (introPhase === "options") {
                setIntroPhase("buttons");
              }
            }}
          >
            {STEP8_EMOTION_OPTIONS.map((emotion) => {
              const checked = selectedEmotion === emotion;
              return (
                <label
                  key={emotion}
                  className={[
                    "custom-radio-container group relative flex cursor-pointer items-center gap-4 rounded-xl border border-solid border-border-light bg-surface-light p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-sm dark:border-border-dark dark:bg-surface-dark dark:hover:border-primary/50",
                    checked ? "border-primary bg-primary/5" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="emotion"
                    checked={checked}
                    onChange={() => onSelectEmotion(emotion)}
                    className="h-5 w-5 appearance-none rounded-full border-2 border-border-light transition-all checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-500"
                  />
                  <div className="flex grow flex-col">
                    <span className="text-[15px] font-medium leading-normal text-text-primary-light transition-colors group-hover:text-primary dark:text-text-primary-dark">
                      {emotion}
                    </span>
                  </div>
                </label>
              );
            })}
          </form>
        </main>

        <footer
          className={[
            "w-full bg-background-light p-4 dark:bg-background-dark",
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
          {errorMessage ? (
            <p role="alert" className="mb-3 text-center text-sm font-semibold text-red-500">
              {errorMessage}
            </p>
          ) : null}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onNext}
              className="flex h-14 w-full cursor-pointer items-center justify-center rounded-full bg-primary px-6 text-[16px] font-bold tracking-wide text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#d97b20] active:scale-[0.98] dark:text-surface-dark"
            >
              선택하고 계속
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-transparent px-6 text-sm font-semibold text-text-secondary-light transition-colors hover:bg-primary/5 dark:text-text-secondary-dark"
            >
              건너뛰기
            </button>
          </div>
        </footer>

        <div className="h-2 w-full bg-background-light dark:bg-background-dark" />
      </div>
    </section>
  );
}
