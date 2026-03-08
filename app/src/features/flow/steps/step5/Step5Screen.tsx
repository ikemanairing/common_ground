import { useEffect, useState } from "react";

type Step5ScreenProps = {
  content: string;
  reason: string;
  errorMessage: string | null;
  onChangeContent: (value: string) => void;
  onChangeReason: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

const CONTENT_LIMIT = 80;
const REASON_LIMIT = 180;
const Q1_TITLE_TEXT = "요즘 가장 재밌게 본\n콘텐츠 1개와 이유는?";
const Q1_SUBTITLE_TEXT = "콘텐츠 1개와 재미있게 본 이유를 각각 입력해주세요.";
const Q1_TITLE_TYPING_DURATION_MS = 2000;
const Q1_SUBTITLE_TYPING_DURATION_MS = 2000;

type Step5IntroPhase =
  | "badge"
  | "title"
  | "subtitle"
  | "contentField"
  | "reasonField"
  | "button"
  | "done";

const STEP5_PHASE_ORDER: Record<Step5IntroPhase, number> = {
  badge: 0,
  title: 1,
  subtitle: 2,
  contentField: 3,
  reasonField: 4,
  button: 5,
  done: 6,
};

const isStep5PhaseAtLeast = (phase: Step5IntroPhase, target: Step5IntroPhase): boolean => {
  return STEP5_PHASE_ORDER[phase] >= STEP5_PHASE_ORDER[target];
};

export default function Step5Screen({
  content,
  reason,
  errorMessage,
  onChangeContent,
  onChangeReason,
  onBack,
  onNext,
}: Step5ScreenProps) {
  const [introPhase, setIntroPhase] = useState<Step5IntroPhase>("badge");
  const [titleLength, setTitleLength] = useState(0);
  const [subtitleLength, setSubtitleLength] = useState(0);

  useEffect(() => {
    if (introPhase !== "title") {
      return;
    }

    setTitleLength(0);
    const stepMs = Math.max(
      40,
      Math.floor(Q1_TITLE_TYPING_DURATION_MS / Math.max(1, Q1_TITLE_TEXT.length)),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / Q1_TITLE_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * Q1_TITLE_TEXT.length);
      setTitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setTitleLength(Q1_TITLE_TEXT.length);
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
      Math.floor(Q1_SUBTITLE_TYPING_DURATION_MS / Math.max(1, Q1_SUBTITLE_TEXT.length)),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / Q1_SUBTITLE_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * Q1_SUBTITLE_TEXT.length);
      setSubtitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setSubtitleLength(Q1_SUBTITLE_TEXT.length);
        setIntroPhase("contentField");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  const titleText = introPhase === "title" ? Q1_TITLE_TEXT.slice(0, titleLength) : Q1_TITLE_TEXT;
  const subtitleText =
    introPhase === "subtitle" ? Q1_SUBTITLE_TEXT.slice(0, subtitleLength) : Q1_SUBTITLE_TEXT;
  const showTitle = isStep5PhaseAtLeast(introPhase, "title");
  const showSubtitle = isStep5PhaseAtLeast(introPhase, "subtitle");
  const showContentField =
    isStep5PhaseAtLeast(introPhase, "contentField");
  const showReasonField = isStep5PhaseAtLeast(introPhase, "reasonField");
  const showButton = isStep5PhaseAtLeast(introPhase, "button");
  const isTitleTyping = introPhase === "title" && titleLength < Q1_TITLE_TEXT.length;
  const isSubtitleTyping = introPhase === "subtitle" && subtitleLength < Q1_SUBTITLE_TEXT.length;

  return (
    <section className="m-0 flex min-h-screen flex-col items-center justify-center bg-background-light p-0 font-display text-text-main dark:bg-background-dark dark:text-slate-100">
      <div className="relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col overflow-hidden bg-background-light shadow-2xl dark:bg-background-dark">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light p-4 pb-2 dark:bg-background-dark">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로 가기"
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-text-main transition-colors hover:bg-primary/10 dark:text-slate-100"
          >
            <span aria-hidden className="material-symbols-outlined text-[24px]">
              arrow_back
            </span>
          </button>
          <h2 className="flex-1 pr-12 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-text-main dark:text-slate-100">
            Icebreaker
          </h2>
        </header>

        <div className="flex w-full flex-col items-center justify-center px-6 pb-6 pt-2">
          <div className="mb-2 flex w-full items-center justify-between">
            <span className="text-sm font-medium text-primary">질문 1</span>
            <span className="text-sm font-medium text-text-secondary dark:text-slate-400">
              1 / 8
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#e7d9cf] dark:bg-gray-700">
            <div className="h-full w-[12.5%] rounded-full bg-primary transition-all duration-300 ease-out" />
          </div>
        </div>

        <main className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-6 pb-6">
          <div className="flex flex-1 flex-col py-8">
            <div className="w-full">
              <span
                className={[
                  "mb-4 inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary dark:bg-primary/20",
                  introPhase === "badge" ? "cg-step5-fade-2s" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onAnimationEnd={(event) => {
                  if (event.target !== event.currentTarget) {
                    return;
                  }
                  if (introPhase === "badge") {
                    setIntroPhase("title");
                  }
                }}
              >
                질문 01
              </span>
              <h1 className="mb-4 break-keep whitespace-pre-line text-left text-[32px] font-bold leading-tight tracking-tight text-text-main dark:text-slate-100">
                {showTitle ? titleText : "\u00A0"}
                {isTitleTyping ? (
                  <span aria-hidden className="cg-step1-type-caret">
                    |
                  </span>
                ) : null}
              </h1>
              <p className="mb-8 min-h-[2.2rem] text-left text-base font-normal leading-relaxed text-text-secondary dark:text-slate-400">
                {showSubtitle ? subtitleText : "\u00A0"}
                {isSubtitleTyping ? (
                  <span aria-hidden className="cg-step1-type-caret">
                    |
                  </span>
                ) : null}
              </p>
            </div>

            <div className="w-full space-y-4">
              <label
                className={[
                  "block w-full",
                  showContentField ? "" : "cg-step1-hidden",
                  introPhase === "contentField" ? "cg-step5-fade-2s" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onAnimationEnd={(event) => {
                  if (event.target !== event.currentTarget) {
                    return;
                  }
                  if (introPhase === "contentField") {
                    setIntroPhase("reasonField");
                  }
                }}
              >
                <span className="mb-2 block text-sm font-semibold text-text-main dark:text-slate-200">
                  콘텐츠 1개
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={content}
                    onChange={(event) => onChangeContent(event.target.value.slice(0, CONTENT_LIMIT))}
                    className="h-14 w-full rounded-2xl border border-[#e7d9cf] bg-surface-light px-5 text-base font-medium text-text-main shadow-sm transition-all placeholder:text-[#9a6c4c]/60 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-surface-dark dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="예: 무빙, 스물다섯 스물하나, 침착맨 채널"
                  />
                  <div className="absolute bottom-3 right-4 text-xs font-medium text-text-secondary dark:text-slate-500">
                    {content.length} / {CONTENT_LIMIT}
                  </div>
                </div>
              </label>

              <label
                className={[
                  "block w-full",
                  showReasonField ? "" : "cg-step1-hidden",
                  introPhase === "reasonField" ? "cg-step5-fade-2s" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onAnimationEnd={(event) => {
                  if (event.target !== event.currentTarget) {
                    return;
                  }
                  if (introPhase === "reasonField") {
                    setIntroPhase("button");
                  }
                }}
              >
                <span className="mb-2 block text-sm font-semibold text-text-main dark:text-slate-200">
                  재미있게 본 이유
                </span>
                <div className="relative">
                  <textarea
                    value={reason}
                    onChange={(event) => onChangeReason(event.target.value.slice(0, REASON_LIMIT))}
                    className="form-textarea min-h-[120px] w-full resize-none rounded-2xl border border-[#e7d9cf] bg-surface-light p-5 text-base font-normal leading-relaxed text-text-main shadow-sm transition-all placeholder:text-[#9a6c4c]/60 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-surface-dark dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="예: 인물들이 진짜 살아있는 사람처럼 느껴졌고, 매 화가 짧아서 몰입이 잘 됐어요."
                  />
                  <div className="absolute bottom-4 right-4 text-xs font-medium text-text-secondary dark:text-slate-500">
                    {reason.length} / {REASON_LIMIT}
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex-1" />
        </main>

        <div className="sticky bottom-0 z-10 flex w-full bg-background-light px-6 py-6 dark:bg-background-dark">
          <div className="w-full">
            {errorMessage ? (
              <p role="alert" className="mb-3 text-center text-sm font-semibold text-red-500">
                {errorMessage}
              </p>
            ) : null}
            <button
              type="button"
              onClick={onNext}
              className={[
                "flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-primary text-lg font-bold leading-normal tracking-[0.015em] text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-dark active:scale-[0.98]",
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
              <span className="mr-2">다음</span>
              <span aria-hidden className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
