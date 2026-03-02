import { useEffect, useState } from "react";

type Step4ScreenProps = {
  agreementChecked: boolean;
  errorMessage: string | null;
  onToggleAgreement: (checked: boolean) => void;
  onBack: () => void;
  onNext: () => void;
};

const PROMISE_TITLE = "따뜻한 대화를 위한 약속";
const PROMISE_SUBTITLE = "랜덤한 반 친구와 대화가 시작됩니다.\n질문이 나오면 답해주세요.";
const STEP4_TITLE_TYPING_DURATION_MS = 2000;
const STEP4_SUBTITLE_TYPING_DURATION_MS = 2000;

const PROMISE_ITEMS = [
  {
    icon: "favorite",
    iconShellClassName: "bg-orange-50 text-[#FF9F76]",
    title: "진솔한 마음 담기",
    description:
      "자신의 진짜 이야기를 들려주세요. 솔직한 답변이 우리를 더 가깝게 만들어줍니다.",
  },
  {
    icon: "diversity_1",
    iconShellClassName: "bg-blue-50 text-blue-400",
    title: "상대방 존중하기",
    description:
      "나와 다른 생각이더라도 귀 기울여주세요. 따뜻한 리액션은 큰 힘이 됩니다.",
  },
  {
    icon: "lock",
    iconShellClassName: "bg-green-50 text-green-400",
    title: "비밀 유지하기",
    description:
      "여기서 나눈 대화는 우리 둘만의 비밀이에요. 캡처나 외부 공유는 절대 금지!",
  },
] as const;

type Step4IntroPhase =
  | "hero"
  | "title"
  | "subtitle"
  | "label"
  | "cards"
  | "agreement"
  | "button"
  | "done";

const STEP4_PHASE_ORDER: Record<Step4IntroPhase, number> = {
  hero: 0,
  title: 1,
  subtitle: 2,
  label: 3,
  cards: 4,
  agreement: 5,
  button: 6,
  done: 7,
};

const isStep4PhaseAtLeast = (phase: Step4IntroPhase, target: Step4IntroPhase): boolean => {
  return STEP4_PHASE_ORDER[phase] >= STEP4_PHASE_ORDER[target];
};

export default function Step4Screen({
  agreementChecked,
  errorMessage,
  onToggleAgreement,
  onBack,
  onNext,
}: Step4ScreenProps) {
  const [introPhase, setIntroPhase] = useState<Step4IntroPhase>("hero");
  const [titleLength, setTitleLength] = useState(0);
  const [subtitleLength, setSubtitleLength] = useState(0);

  useEffect(() => {
    if (introPhase !== "title") {
      return;
    }

    setTitleLength(0);
    const stepMs = Math.max(
      40,
      Math.floor(STEP4_TITLE_TYPING_DURATION_MS / Math.max(1, PROMISE_TITLE.length)),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / STEP4_TITLE_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * PROMISE_TITLE.length);
      setTitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setTitleLength(PROMISE_TITLE.length);
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
      Math.floor(STEP4_SUBTITLE_TYPING_DURATION_MS / Math.max(1, PROMISE_SUBTITLE.length)),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / STEP4_SUBTITLE_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * PROMISE_SUBTITLE.length);
      setSubtitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setSubtitleLength(PROMISE_SUBTITLE.length);
        setIntroPhase("label");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  const titleText = isStep4PhaseAtLeast(introPhase, "subtitle")
    ? PROMISE_TITLE
    : PROMISE_TITLE.slice(0, titleLength);
  const subtitleText = isStep4PhaseAtLeast(introPhase, "label")
    ? PROMISE_SUBTITLE
    : PROMISE_SUBTITLE.slice(0, subtitleLength);
  const showTitle = isStep4PhaseAtLeast(introPhase, "title");
  const showSubtitle = isStep4PhaseAtLeast(introPhase, "subtitle");
  const showLabel = isStep4PhaseAtLeast(introPhase, "label");
  const showCards = isStep4PhaseAtLeast(introPhase, "cards");
  const showAgreement = isStep4PhaseAtLeast(introPhase, "agreement");
  const showButton = isStep4PhaseAtLeast(introPhase, "button");
  const isTitleTyping = introPhase === "title" && titleLength < PROMISE_TITLE.length;
  const isSubtitleTyping = introPhase === "subtitle" && subtitleLength < PROMISE_SUBTITLE.length;

  return (
    <section
      className="flex min-h-screen items-center justify-center bg-[#f3f4f6] text-[#5D5449] antialiased"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden border-white bg-[#FFFBF7] shadow-2xl sm:h-[90vh] sm:rounded-3xl sm:border">
        <header className="z-10 flex shrink-0 items-center justify-between px-6 pb-2 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-[#F2EFEB]"
            aria-label="닫기"
          >
            <span aria-hidden className="material-symbols-outlined text-[#5D5449]/70">
              close
            </span>
          </button>
          <div className="w-10" />
        </header>

        <main className="custom-scrollbar flex-1 overflow-y-auto px-6 pb-40">
          <div className="flex flex-col items-center pb-8 pt-4">
            <div
              className={[
                "relative mb-6",
                isStep4PhaseAtLeast(introPhase, "hero") ? "" : "cg-step1-hidden",
                introPhase === "hero" ? "cg-step4-fade-2s" : "",
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
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFD6A5]/30 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span aria-hidden className="material-symbols-outlined text-[40px] text-[#FF9F76]">
                  spa
                </span>
              </div>
            </div>
            <h2
              className={[
                "mb-3 text-center text-2xl font-bold leading-tight tracking-tight",
                showTitle ? "" : "cg-step1-hidden",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {titleText || "\u00A0"}
              {isTitleTyping ? (
                <span aria-hidden className="cg-step1-type-caret">
                  |
                </span>
              ) : null}
            </h2>
            <p
              className={[
                "max-w-[280px] whitespace-pre-line text-center text-sm font-normal leading-relaxed text-[#5D5449]/70",
                showSubtitle ? "" : "cg-step1-hidden",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {subtitleText || "\u00A0"}
              {isSubtitleTyping ? (
                <span aria-hidden className="cg-step1-type-caret">
                  |
                </span>
              ) : null}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div
              className={[
                "mb-2 px-1",
                showLabel ? "" : "cg-step1-hidden",
                introPhase === "label" ? "cg-step4-fade-2s" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget) {
                  return;
                }
                if (introPhase === "label") {
                  setIntroPhase("cards");
                }
              }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5D5449]/50">
                답변 시 유의사항
              </h4>
            </div>

            <div
              className={[
                "flex flex-col gap-4",
                showCards ? "" : "cg-step1-hidden",
                introPhase === "cards" ? "cg-step4-fade-2s" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget) {
                  return;
                }
                if (introPhase === "cards") {
                  setIntroPhase("agreement");
                }
              }}
            >
              {PROMISE_ITEMS.map((item) => (
                <article
                  key={item.title}
                  className="flex flex-col rounded-2xl border border-[#FFD6A5]/20 bg-white p-6 shadow-card transition-shadow duration-300 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <div className={["rounded-full p-2", item.iconShellClassName].join(" ")}>
                      <span aria-hidden className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold tracking-tight">{item.title}</h3>
                  </div>
                  <p className="pl-[3.25rem] text-[13px] leading-relaxed text-[#5D5449]/60">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="h-8" />
        </main>

        <footer className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#FFFBF7] via-[#FFFBF7] to-transparent p-6 pt-12">
          <label
            className={[
              "group mb-6 flex cursor-pointer select-none items-center justify-center gap-x-3 rounded-xl border border-transparent bg-white/50 py-3 transition-all backdrop-blur-sm hover:border-[#FFD6A5]/30",
              showAgreement ? "" : "cg-step1-hidden",
              introPhase === "agreement" ? "cg-step4-fade-2s" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onAnimationEnd={(event) => {
              if (event.target !== event.currentTarget) {
                return;
              }
              if (introPhase === "agreement") {
                setIntroPhase("button");
              }
            }}
          >
            <div className="relative flex items-center">
              <input
                id="agree-check"
                type="checkbox"
                checked={agreementChecked}
                onChange={(event) => onToggleAgreement(event.target.checked)}
                className="peer h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-[#5D5449]/20 bg-white transition-all checked:border-[#FF9F76] checked:bg-[#FF9F76] hover:border-[#FF9F76] focus:ring-0 focus:ring-offset-0"
              />
              <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] font-bold text-white opacity-0 peer-checked:opacity-100 material-symbols-outlined">
                check
              </span>
            </div>
            <p className="text-[15px] font-bold transition-colors group-hover:text-[#FF9F76]">
              위 약속을 지키며 대화할게요
            </p>
          </label>
          {errorMessage ? (
            <p role="alert" className="mb-3 text-center text-sm font-semibold text-red-500">
              {errorMessage}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onNext}
            disabled={!agreementChecked}
            className={[
              "flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF9F76] py-4 text-lg font-bold text-white shadow-soft transition-all hover:bg-[#FF8A5B] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#FF9F76] disabled:active:scale-100",
              showButton ? "" : "cg-step1-hidden",
              introPhase === "button" ? "cg-step4-fade-2s" : "",
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
            <span>시작하기</span>
            <span aria-hidden className="material-symbols-outlined text-[22px]">
              arrow_forward
            </span>
          </button>
        </footer>
      </div>
    </section>
  );
}

