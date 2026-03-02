import { useEffect, useState } from "react";
import { STEP9_SUMMARY_OPTIONS } from "./summaryOptions";

type Step9ScreenProps = {
  selectedValue: string;
  errorMessage: string | null;
  onSelectValue: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

const TITLE_TEXT = "오늘의 의미를\n한 줄로 말하면";
const SUBTITLE_TEXT = "가장 마음에 와닿는 문장을 선택해주세요.";
const TITLE_TYPING_DURATION_MS = 2000;
const SUBTITLE_TYPING_DURATION_MS = 2000;

type Step9IntroPhase = "title" | "subtitle" | "options" | "button" | "done";

const STEP9_PHASE_ORDER: Record<Step9IntroPhase, number> = {
  title: 0,
  subtitle: 1,
  options: 2,
  button: 3,
  done: 4,
};

const isStep9PhaseAtLeast = (phase: Step9IntroPhase, target: Step9IntroPhase): boolean => {
  return STEP9_PHASE_ORDER[phase] >= STEP9_PHASE_ORDER[target];
};

export default function Step9Screen({
  selectedValue,
  errorMessage,
  onSelectValue,
  onBack,
  onNext,
}: Step9ScreenProps) {
  const [introPhase, setIntroPhase] = useState<Step9IntroPhase>("title");
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

  const showTitle = isStep9PhaseAtLeast(introPhase, "title");
  const showSubtitle = isStep9PhaseAtLeast(introPhase, "subtitle");
  const showOptions = isStep9PhaseAtLeast(introPhase, "options");
  const showButton = isStep9PhaseAtLeast(introPhase, "button");

  const visibleTitle = introPhase === "title" ? TITLE_TEXT.slice(0, titleLength) : TITLE_TEXT;
  const visibleSubtitle =
    introPhase === "subtitle" ? SUBTITLE_TEXT.slice(0, subtitleLength) : SUBTITLE_TEXT;

  const isTitleTyping = introPhase === "title" && titleLength < TITLE_TEXT.length;
  const isSubtitleTyping = introPhase === "subtitle" && subtitleLength < SUBTITLE_TEXT.length;

  return (
    <section className="no-scrollbar flex min-h-screen flex-col overflow-x-hidden bg-background-light font-display text-slate-900 antialiased dark:bg-background-dark dark:text-slate-100">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background-light/95 px-4 py-3 backdrop-blur-sm dark:bg-background-dark/95">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-black/5 dark:text-slate-100 dark:hover:bg-white/10"
          aria-label="뒤로 가기"
        >
          <span aria-hidden className="material-symbols-outlined text-2xl">
            arrow_back
          </span>
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">오늘의 정리</h1>
        <div className="flex w-12 items-center justify-center text-base font-bold text-primary">4/5</div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-24 pt-2">
        <div className="mb-8 mt-4">
          <h2 className="mb-2 min-h-[5rem] whitespace-pre-line text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            {showTitle ? visibleTitle : "\u00A0"}
            {isTitleTyping ? (
              <span aria-hidden className="cg-step1-type-caret">
                |
              </span>
            ) : null}
          </h2>
          <p className="min-h-[1.6rem] text-sm text-slate-500 dark:text-slate-400">
            {showSubtitle ? visibleSubtitle : "\u00A0"}
            {isSubtitleTyping ? (
              <span aria-hidden className="cg-step1-type-caret">
                |
              </span>
            ) : null}
          </p>
        </div>

        <form
          className={[
            "flex-1 space-y-4",
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
              setIntroPhase("button");
            }
          }}
        >
          {STEP9_SUMMARY_OPTIONS.map((option) => {
            const selected = selectedValue === option.value;
            return (
              <label key={option.value} className="group relative block cursor-pointer">
                <input
                  type="radio"
                  name="summary"
                  value={option.value}
                  checked={selected}
                  onChange={() => onSelectValue(option.value)}
                  className="peer sr-only"
                />
                <div className="relative flex h-[160px] flex-col justify-end overflow-hidden rounded-xl border-2 border-transparent bg-surface-light p-5 shadow-sm transition-all duration-300 ease-out peer-checked:border-primary peer-checked:bg-primary/5 dark:bg-surface-dark">
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-70 transition-opacity group-hover:opacity-80"
                    aria-label={option.imageAlt}
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%), url('${option.imageUrl}')`,
                    }}
                  />
                  <div className="absolute right-4 top-4 z-10 flex h-6 w-6 scale-90 items-center justify-center rounded-full bg-white/20 text-transparent opacity-0 backdrop-blur-md transition-all peer-checked:scale-100 peer-checked:bg-primary peer-checked:text-white peer-checked:opacity-100">
                    <span aria-hidden className="material-symbols-outlined text-sm font-bold">
                      check
                    </span>
                  </div>
                  <div className="relative z-10 w-full pr-8">
                    <p className="text-lg font-bold leading-snug text-white drop-shadow-md">
                      {option.text.split("\n").map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </form>
      </main>

      <footer
        className={[
          "fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/50 bg-background-light/80 p-4 backdrop-blur-lg dark:border-slate-800/50 dark:bg-background-dark/80",
          showButton ? "" : "cg-step1-hidden",
          introPhase === "button" ? "cg-step5-fade-2s" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget) {
            return;
          }
          if (introPhase === "button") {
            setIntroPhase("done");
          }
        }}
      >
        <div className="mx-auto max-w-md">
          {errorMessage ? (
            <p role="alert" className="mb-3 text-center text-sm font-semibold text-red-500">
              {errorMessage}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <span>이 문장 저장하고 계속</span>
            <span aria-hidden className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </button>
        </div>
      </footer>
    </section>
  );
}
