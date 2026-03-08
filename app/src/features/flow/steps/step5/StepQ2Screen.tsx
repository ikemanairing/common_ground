import { useQuestionIntroAnimation } from "./useQuestionIntroAnimation";

type StepQ2ScreenProps = {
  answer: string;
  errorMessage: string | null;
  onChangeAnswer: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

const ANSWER_LIMIT = 100;
const Q2_TITLE_TEXT = "최근에 가장 좋았던\n나만의 장소 1곳은?";
const Q2_SUBTITLE_TEXT =
  "카페, 공원, 전시, 산책길처럼 다시 가고 싶은 곳과 이유를 함께 적어주세요.";

export default function StepQ2Screen({
  answer,
  errorMessage,
  onChangeAnswer,
  onBack,
  onNext,
}: StepQ2ScreenProps) {
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
    titleText: Q2_TITLE_TEXT,
    subtitleText: Q2_SUBTITLE_TEXT,
  });

  return (
    <section className="m-0 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#fff7f0] via-background-light to-[#fffaf6] p-0 font-display text-text-main dark:bg-background-dark dark:text-slate-100">
      <div className="relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col overflow-hidden bg-background-light shadow-2xl dark:bg-background-dark">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-20 h-44 w-44 rounded-full bg-[#ffd4bb]/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-40 h-52 w-52 rounded-full bg-[#ffe7c8]/60 blur-3xl"
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
            질문 이어가기
          </h2>
        </header>

        <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 pb-6 pt-2">
          <div className="mb-2 flex w-full items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0e5] px-2.5 py-1 text-sm font-semibold text-[#c9692f]">
              <span aria-hidden className="material-symbols-outlined text-[14px]">
                location_on
              </span>
              질문 2
            </span>
            <span className="text-sm font-medium text-text-secondary dark:text-slate-400">
              2 / 8
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#e7d9cf] dark:bg-gray-700">
            <div className="h-full w-[25%] rounded-full bg-gradient-to-r from-[#ff9b5e] to-[#ff7d4d] transition-all duration-300 ease-out" />
          </div>
        </div>

        <main className="no-scrollbar relative z-10 flex flex-1 flex-col overflow-y-auto px-6 pb-6">
          <div className="flex flex-1 flex-col items-center justify-center py-8">
            <div className="w-full">
              <span
                className={[
                  "mb-4 inline-block rounded-full bg-[#fff0e5] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#c9692f] dark:bg-primary/20",
                  badgeAnimationClass,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onAnimationEnd={onBadgeAnimationEnd}
              >
                질문 02
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
                    className="form-textarea min-h-[120px] w-full resize-none rounded-2xl border border-[#f2c9a8] bg-[#fffdfa] p-5 text-lg font-normal leading-relaxed text-text-main shadow-sm transition-all placeholder:text-[#a97755]/70 focus:border-[#ff9b5e] focus:ring-2 focus:ring-[#ff9b5e]/20 dark:border-gray-700 dark:bg-surface-dark dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="예: 한강공원. 해 질 때 바람이 좋아서 마음이 편해져요."
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
                "flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#ff9b5e] to-[#ff7d4d] text-lg font-bold leading-normal tracking-[0.015em] text-white shadow-lg shadow-[#ff9b5e]/30 transition-all hover:brightness-105 active:scale-[0.98]",
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
