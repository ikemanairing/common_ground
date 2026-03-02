import { useEffect, useState } from "react";
import { STEP10_MISSION_OPTIONS } from "./missionOptions";

type Step10ScreenProps = {
  selectedMissionId: string | null;
  errorMessage: string | null;
  onSelectMission: (missionId: string) => void;
  onBack: () => void;
  onFinish: () => void;
};

const TITLE_TEXT = "오늘 여기서 끝내면\n내일도 똑같이 어색해.\n딱 1개만 해보자.";
const SUBTITLE_TEXT = "가장 할 수 있을 것 같은 미션을 골라보세요.";
const TITLE_TYPING_DURATION_MS = 2000;
const SUBTITLE_TYPING_DURATION_MS = 2000;

type Step10IntroPhase = "title" | "subtitle" | "missions" | "footer" | "done";

const STEP10_PHASE_ORDER: Record<Step10IntroPhase, number> = {
  title: 0,
  subtitle: 1,
  missions: 2,
  footer: 3,
  done: 4,
};

const isStep10PhaseAtLeast = (
  phase: Step10IntroPhase,
  target: Step10IntroPhase,
): boolean => {
  return STEP10_PHASE_ORDER[phase] >= STEP10_PHASE_ORDER[target];
};

export default function Step10Screen({
  selectedMissionId,
  errorMessage,
  onSelectMission,
  onBack,
  onFinish,
}: Step10ScreenProps) {
  const [introPhase, setIntroPhase] = useState<Step10IntroPhase>("title");
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
        setIntroPhase("missions");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  const showTitle = isStep10PhaseAtLeast(introPhase, "title");
  const showSubtitle = isStep10PhaseAtLeast(introPhase, "subtitle");
  const showMissions = isStep10PhaseAtLeast(introPhase, "missions");
  const showFooter = isStep10PhaseAtLeast(introPhase, "footer");

  const visibleTitle = introPhase === "title" ? TITLE_TEXT.slice(0, titleLength) : TITLE_TEXT;
  const visibleSubtitle =
    introPhase === "subtitle" ? SUBTITLE_TEXT.slice(0, subtitleLength) : SUBTITLE_TEXT;

  const isTitleTyping = introPhase === "title" && titleLength < TITLE_TEXT.length;
  const isSubtitleTyping = introPhase === "subtitle" && subtitleLength < SUBTITLE_TEXT.length;

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-background-light font-display antialiased dark:bg-background-dark">
      <div className="relative flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-background-light shadow-2xl dark:bg-background-dark">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light p-4 pb-2 dark:bg-background-dark">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-text-main transition-colors hover:bg-surface-light dark:text-slate-100 dark:hover:bg-surface-dark"
          >
            <span aria-hidden className="material-symbols-outlined text-[24px]">
              arrow_back
            </span>
          </button>
          <h2 className="flex-1 pr-12 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-text-main dark:text-slate-100">
            내일을 위한 미션
          </h2>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto p-4 pb-32">
          <div className="pb-6 pt-2">
            <h1 className="min-h-[7.8rem] whitespace-pre-line text-left text-[28px] font-bold leading-[1.3] tracking-tight text-text-main dark:text-slate-100">
              {showTitle ? visibleTitle : "\u00A0"}
              {isTitleTyping ? (
                <span aria-hidden className="cg-step1-type-caret">
                  |
                </span>
              ) : null}
            </h1>
            <p className="mt-3 min-h-[1.3rem] text-sm font-medium text-text-muted dark:text-slate-400">
              {showSubtitle ? visibleSubtitle : "\u00A0"}
              {isSubtitleTyping ? (
                <span aria-hidden className="cg-step1-type-caret">
                  |
                </span>
              ) : null}
            </p>
          </div>

          <div
            className={[
              "flex flex-col gap-3",
              showMissions ? "" : "cg-step1-hidden",
              introPhase === "missions" ? "cg-step5-fade-2s" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onAnimationEnd={(event) => {
              if (event.target !== event.currentTarget) {
                return;
              }
              if (introPhase === "missions") {
                setIntroPhase("footer");
              }
            }}
          >
            {STEP10_MISSION_OPTIONS.map((option) => {
              const selected = selectedMissionId === option.id;
              return (
                <section
                  key={option.id}
                  className={[
                    "overflow-hidden rounded-xl border transition-all duration-300",
                    selected
                      ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                      : "border-transparent bg-surface-light hover:border-primary/20 dark:bg-surface-dark",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => onSelectMission(option.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-pressed={selected}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={[
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          selected ? "border-primary bg-primary" : "border-primary/40",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <span
                          aria-hidden
                          className={[
                            "material-symbols-outlined text-[16px] text-white transition-opacity",
                            selected ? "opacity-100" : "opacity-0",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          check
                        </span>
                      </div>
                      <p className="text-[15px] font-semibold leading-normal text-text-main dark:text-slate-100">
                        {option.title}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className={[
                        "material-symbols-outlined text-text-muted transition-transform duration-300 dark:text-slate-400",
                        selected ? "rotate-180" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      expand_more
                    </span>
                  </button>
                  {selected ? (
                    <div className="px-5 pb-5 pl-[3.25rem]">
                      <div className="relative border-l-2 border-primary/30 pl-3">
                        <p className="text-sm font-normal leading-relaxed text-text-muted dark:text-slate-300">
                          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-primary">
                            Script
                          </span>
                          {option.script}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </main>

        <footer
          className={[
            "fixed bottom-0 z-20 w-full max-w-md border-t border-surface-light bg-background-light/95 p-6 pb-8 backdrop-blur-sm dark:border-surface-dark dark:bg-background-dark/95",
            showFooter ? "" : "cg-step1-hidden",
            introPhase === "footer" ? "cg-step5-fade-2s" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) {
              return;
            }
            if (introPhase === "footer") {
              setIntroPhase("done");
            }
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-text-muted dark:text-slate-400">
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                sentiment_satisfied
              </span>
              <p className="text-center text-sm font-medium leading-normal">
                첫날은 원래 어색해. 하지만 오늘은 말 걸 소재가 생겼어.
              </p>
            </div>
            {errorMessage ? (
              <p role="alert" className="text-center text-sm font-semibold text-red-500">
                {errorMessage}
              </p>
            ) : null}
            <button
              type="button"
              onClick={onFinish}
              className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-full bg-primary text-[17px] font-bold text-primary-content shadow-lg shadow-primary/25 transition-all active:scale-[0.98] dark:text-white"
            >
              <span className="relative z-10 flex items-center gap-2">
                미션 선택 완료 & 끝내기
                <span
                  aria-hidden
                  className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1"
                >
                  arrow_forward
                </span>
              </span>
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-black/10" />
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
