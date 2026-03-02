import { useQuestionIntroAnimation } from "./useQuestionIntroAnimation";

type StepQ8ScreenProps = {
  answer: string;
  errorMessage: string | null;
  onChangeAnswer: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

const ANSWER_LIMIT = 100;
const Q8_TITLE_TEXT = "지금 이 순간 나에게 건네는\n응원 한마디는?";
const Q8_SUBTITLE_TEXT =
  "비교 화면으로 가기 전에 스스로에게 남길 메시지를 적어주세요.";

export default function StepQ8Screen({
  answer,
  errorMessage,
  onChangeAnswer,
  onBack,
  onNext,
}: StepQ8ScreenProps) {
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
    titleText: Q8_TITLE_TEXT,
    subtitleText: Q8_SUBTITLE_TEXT,
  });

  return (
    <section className="m-0 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f2fffb] via-background-light to-[#e9fff8] p-0 font-display text-text-main dark:bg-background-dark dark:text-slate-100">
      <div className="relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col overflow-hidden bg-background-light shadow-2xl dark:bg-background-dark">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light/90 p-4 pb-2 backdrop-blur-sm dark:bg-background-dark">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-text-main transition-colors hover:bg-primary/10 dark:text-slate-100"
          >
            <span aria-hidden className="material-symbols-outlined text-[24px]">
              arrow_back
            </span>
          </button>
          <h2 className="flex-1 pr-12 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-text-main dark:text-slate-100">
            Final Touch
          </h2>
        </header>

        <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 pb-6 pt-2">
          <div className="mb-2 flex w-full items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#dffcf2] px-2.5 py-1 text-sm font-semibold text-[#2f8e69]">
              <span aria-hidden className="material-symbols-outlined text-[14px]">
                check_circle
              </span>
              Step 8
            </span>
            <span className="text-sm font-medium text-text-secondary dark:text-slate-400">
              8 / 8
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#d3efe5] dark:bg-gray-700">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-[#56c49a] to-[#2f8e69] transition-all duration-300 ease-out" />
          </div>
        </div>

        <main className="no-scrollbar relative z-10 flex flex-1 flex-col overflow-y-auto px-6 pb-6">
          <div className="flex flex-1 flex-col items-center justify-center py-8">
            <div className="w-full">
              <span
                className={[
                  "mb-4 inline-block rounded-full bg-[#dffcf2] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#2f8e69] dark:bg-primary/20",
                  badgeAnimationClass,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onAnimationEnd={onBadgeAnimationEnd}
              >
                Question 08
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
                    className="form-textarea min-h-[120px] w-full resize-none rounded-2xl border border-[#bce6d5] bg-[#fcfffe] p-5 text-lg font-normal leading-relaxed text-text-main shadow-sm transition-all placeholder:text-[#5f9f88]/70 focus:border-[#56c49a] focus:ring-2 focus:ring-[#56c49a]/20 dark:border-gray-700 dark:bg-surface-dark dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="예: 천천히 가도 괜찮아, 오늘도 충분히 잘하고 있어."
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
                "flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#56c49a] to-[#2f8e69] text-lg font-bold leading-normal tracking-[0.015em] text-white shadow-lg shadow-[#56c49a]/30 transition-all hover:brightness-105 active:scale-[0.98]",
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
