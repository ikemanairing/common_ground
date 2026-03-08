import { useQuestionIntroAnimation } from "./useQuestionIntroAnimation";

type StepQ3ScreenProps = {
  answer: string;
  errorMessage: string | null;
  onChangeAnswer: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

const ANSWER_LIMIT = 100;
const Q3_TITLE_TEXT = "요즘 나를 가장 많이 웃게 한\n순간은?";
const Q3_SUBTITLE_TEXT = "사소해도 좋아요. 최근에 기분이 좋아졌던 장면을 짧게 남겨주세요.";

export default function StepQ3Screen({
  answer,
  errorMessage,
  onChangeAnswer,
  onBack,
  onNext,
}: StepQ3ScreenProps) {
  const {
    typedTitle,
    typedSubtitle,
    showTitle,
    showSubtitle,
    showAnswerField,
    showButton,
    isTitleTyping,
    isSubtitleTyping,
    badgeAnimationClass,
    answerFieldAnimationClass,
    buttonAnimationClass,
    onBadgeAnimationEnd,
    onAnswerFieldAnimationEnd,
    onButtonAnimationEnd,
  } = useQuestionIntroAnimation({
    titleText: Q3_TITLE_TEXT,
    subtitleText: Q3_SUBTITLE_TEXT,
  });

  return (
    <section className="m-0 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f3fbff] via-background-light to-[#eff8ff] p-0 font-display text-text-main dark:bg-background-dark dark:text-slate-100">
      <div className="relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col overflow-hidden bg-background-light shadow-2xl dark:bg-background-dark">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 top-16 h-48 w-48 rounded-full bg-[#c7ecff]/50 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-36 h-56 w-56 rounded-full bg-[#d7f4ff]/60 blur-3xl"
        />

        <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light/90 p-4 pb-2 backdrop-blur-sm dark:bg-background-dark">
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
            Deep Dive
          </h2>
        </header>

        <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 pb-6 pt-2">
          <div className="mb-2 flex w-full items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f6ff] px-2.5 py-1 text-sm font-semibold text-[#2e7ca3]">
              <span aria-hidden className="material-symbols-outlined text-[14px]">
                chat
              </span>
              질문 3
            </span>
            <span className="text-sm font-medium text-text-secondary dark:text-slate-400">
              3 / 8
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#d5e8f3] dark:bg-gray-700">
            <div className="h-full w-[37.5%] rounded-full bg-gradient-to-r from-[#5fbde6] to-[#3aa7d6] transition-all duration-300 ease-out" />
          </div>
        </div>

        <main className="no-scrollbar relative z-10 flex flex-1 flex-col overflow-y-auto px-6 pb-6">
          <div className="flex flex-1 flex-col items-center justify-center py-8">
            <div className="w-full">
              <span
                className={[
                  "mb-4 inline-block rounded-full bg-[#e8f6ff] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#2e7ca3] dark:bg-primary/20",
                  badgeAnimationClass,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onAnimationEnd={onBadgeAnimationEnd}
              >
                질문 03
              </span>
              <h1 className="mb-4 min-h-[5rem] break-keep whitespace-pre-line text-left text-[32px] font-bold leading-tight tracking-tight text-text-main dark:text-slate-100">
                {showTitle ? typedTitle : "\u00A0"}
                {isTitleTyping ? (
                  <span aria-hidden className="cg-step1-type-caret">
                    |
                  </span>
                ) : null}
              </h1>
              <p className="mb-8 min-h-[3rem] text-left text-base font-normal leading-relaxed text-text-secondary dark:text-slate-400">
                {showSubtitle ? typedSubtitle : "\u00A0"}
                {isSubtitleTyping ? (
                  <span aria-hidden className="cg-step1-type-caret">
                    |
                  </span>
                ) : null}
              </p>
            </div>

            <div className="w-full">
              <label
                className={[
                  "block w-full",
                  showAnswerField ? "" : "cg-step1-hidden",
                  answerFieldAnimationClass,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onAnimationEnd={onAnswerFieldAnimationEnd}
              >
                <div className="relative">
                  <textarea
                    value={answer}
                    onChange={(event) => onChangeAnswer(event.target.value.slice(0, ANSWER_LIMIT))}
                    className="form-textarea min-h-[120px] w-full resize-none rounded-2xl border border-[#b9ddf0] bg-[#fbfeff] p-5 text-lg font-normal leading-relaxed text-text-main shadow-sm transition-all placeholder:text-[#6b94aa]/70 focus:border-[#5fbde6] focus:ring-2 focus:ring-[#5fbde6]/20 dark:border-gray-700 dark:bg-surface-dark dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="예: 친구랑 통화하다가 엉뚱한 말실수로 한참 웃었어요."
                  />
                  <div className="absolute bottom-4 right-4 text-xs font-medium text-text-secondary dark:text-slate-500">
                    {answer.length} / {ANSWER_LIMIT}
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex-1" />
        </main>

        <div className="sticky bottom-0 z-10 flex w-full bg-background-light/95 px-6 py-6 backdrop-blur-sm dark:bg-background-dark">
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
                "flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#5fbde6] to-[#3aa7d6] text-lg font-bold leading-normal tracking-[0.015em] text-white shadow-lg shadow-[#5fbde6]/30 transition-all hover:brightness-105 active:scale-[0.98]",
                showButton ? "" : "cg-step1-hidden",
                buttonAnimationClass,
              ]
                .filter(Boolean)
                .join(" ")}
              onAnimationEnd={onButtonAnimationEnd}
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
