import { useEffect, useMemo, useState } from "react";

type Step6ScreenProps = {
  myAnswers: string[];
  peerAnswers: string[];
  peerNickname: string;
  peerAnswerSub: string;
  isPeerLoading: boolean;
  hasSessionMatch: boolean;
  onBack: () => void;
  onNext: () => void;
};

type AnimatedTextProps = {
  text: string;
  className?: string;
  startDelayMs?: number;
  charIntervalMs?: number;
};

function AnimatedText({
  text,
  className,
  startDelayMs = 0,
  charIntervalMs = 24,
}: AnimatedTextProps) {
  const chars = Array.from(text);
  const [visibleCharCount, setVisibleCharCount] = useState(0);

  useEffect(() => {
    setVisibleCharCount(0);

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setVisibleCharCount((count) => {
          if (count >= chars.length) {
            if (intervalId) {
              window.clearInterval(intervalId);
            }
            return count;
          }
          return count + 1;
        });
      }, charIntervalMs);
    }, startDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [charIntervalMs, chars.length, startDelayMs, text]);

  return <p className={className}>{chars.slice(0, visibleCharCount).join("")}</p>;
}

export default function Step6Screen({
  myAnswers,
  peerAnswers,
  peerNickname,
  peerAnswerSub,
  isPeerLoading,
  hasSessionMatch,
  onBack,
  onNext,
}: Step6ScreenProps) {
  const questionTitles = [
    "요즘 가장 재밌게 본 콘텐츠 1개는?",
    "최근에 가장 좋았던 나만의 장소 1곳은?",
    "요즘 나를 가장 많이 웃게 한 순간은?",
    "이번 주에 꼭 해보고 싶은 작은 도전은?",
    "오늘 대화에서 얻고 싶은 한 가지는?",
    "지금 내 상태를 가장 잘 담는 한 단어는?",
    "오늘 대화에서 기억하고 싶은 한 문장은?",
    "지금 이 순간 나에게 건네는 응원 한마디는?",
  ];

  const typingPlan = useMemo(() => {
    const titleCharMs = 70;
    const bodyCharMs = 85;
    const myAfterTitleGap = 450;
    const peerAfterMyGap = 600;
    const nextQuestionGap = 700;

    let timelineCursor = 0;

    return questionTitles.map((questionTitle, index) => {
      const myText = myAnswers[index] || "아직 입력하지 않았어요";
      const peerText = isPeerLoading
        ? "같은 세션 답변을 불러오는 중..."
        : peerAnswers[index] || "아직 답변이 없어요.";

      const titleStart = timelineCursor;
      const myStart =
        titleStart + Array.from(`Q${index + 1}. ${questionTitle}`).length * titleCharMs + myAfterTitleGap;
      const peerStart = myStart + Array.from(myText).length * bodyCharMs + peerAfterMyGap;

      const questionEnd = peerStart + Array.from(peerText).length * bodyCharMs + nextQuestionGap;
      timelineCursor = questionEnd;

      return { titleStart, myStart, peerStart, titleCharMs, bodyCharMs };
    });
  }, [isPeerLoading, myAnswers, peerAnswers, questionTitles]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f3f4f6] font-display text-warm-text antialiased">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden border-white bg-warm-bg shadow-2xl sm:h-[90vh] sm:rounded-3xl sm:border">
        <header className="z-10 flex shrink-0 items-center justify-between px-6 pb-2 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-warm-text/70 shadow-sm transition-colors hover:bg-soft-gray"
            aria-label="뒤로 가기"
          >
            <span aria-hidden className="material-symbols-outlined">
              arrow_back
            </span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium uppercase tracking-widest text-warm-primary">
              연결 확인
            </span>
            <div className="mt-1 flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-warm-primary" />
              <div className="h-1.5 w-1.5 rounded-full bg-warm-primary" />
              <div className="h-1.5 w-1.5 rounded-full bg-warm-primary/30" />
              <div className="h-1.5 w-1.5 rounded-full bg-warm-primary/30" />
            </div>
          </div>
          <div className="w-10" />
        </header>

        <main className="custom-scrollbar relative flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <div className="absolute left-1/2 top-10 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-warm-accent/10 blur-3xl" />

          <div className="mb-6 mt-2 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 rotate-3 items-center justify-center rounded-2xl border border-warm-bg bg-white shadow-card">
              <span aria-hidden className="material-symbols-outlined text-2xl text-warm-primary">
                dynamic_feed
              </span>
            </div>
            <span className="mb-3 inline-block rounded-full border border-warm-accent/30 bg-white px-3 py-1 text-xs font-bold text-warm-primary shadow-sm">
              질문 01 - 08
            </span>
            <h3 className="px-4 text-lg font-bold leading-snug text-warm-text">
              Q1부터 Q8까지 답변을 서로 비교해봐요
            </h3>
            <p className="mt-2 text-xs font-medium text-warm-text/60">
              {isPeerLoading
                ? "같은 세션 친구를 찾는 중이에요..."
                : hasSessionMatch
                  ? "같은 세션의 랜덤 친구와 연결됐어요."
                  : "아직 같은 세션에서 비교 가능한 친구를 기다리고 있어요."}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            {questionTitles.map((questionTitle, index) => {
              const myAnswer = myAnswers[index] ?? "";
              const peerAnswer = peerAnswers[index] ?? "";
              const resolvedPeerAnswer = isPeerLoading
                ? "같은 세션 답변을 불러오는 중..."
                : peerAnswer || "아직 답변이 없어요.";
              const plan = typingPlan[index];

              return (
                <section key={questionTitle} className="flex flex-col gap-2">
                  <AnimatedText
                    text={`Q${index + 1}. ${questionTitle}`}
                    className="text-xs font-bold text-warm-text/60"
                    startDelayMs={plan.titleStart}
                    charIntervalMs={plan.titleCharMs}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <article className="glass-card group relative overflow-hidden rounded-[1.2rem] border border-white/60 p-4 shadow-card transition-all duration-300 hover:shadow-soft">
                      <div className="absolute left-0 top-0 h-full w-1 bg-warm-text/20" />
                      <p className="mb-2 text-xs font-bold text-warm-text/50">나의 답변</p>
                      <AnimatedText
                        text={myAnswer || "아직 입력하지 않았어요"}
                        className="break-keep text-sm font-medium leading-relaxed text-warm-text"
                        startDelayMs={plan.myStart}
                        charIntervalMs={plan.bodyCharMs}
                      />
                    </article>
                    <article className="glass-card group relative overflow-hidden rounded-[1.2rem] border border-warm-primary/20 bg-white p-4 shadow-card transition-all duration-300 hover:shadow-soft">
                      <div className="absolute right-0 top-0 h-full w-1 bg-warm-primary" />
                      <p className="mb-2 text-xs font-bold text-warm-primary">{peerNickname}님의 답변</p>
                      <AnimatedText
                        text={resolvedPeerAnswer}
                        className="break-keep text-sm font-semibold leading-relaxed text-warm-text"
                        startDelayMs={plan.peerStart}
                        charIntervalMs={plan.bodyCharMs}
                      />
                    </article>
                  </div>
                </section>
              );
            })}
          </div>
        </main>

        <footer className="z-20 shrink-0 bg-gradient-to-t from-warm-bg via-warm-bg to-transparent p-6 pb-10">
          <button
            type="button"
            onClick={onNext}
            className="group relative w-full overflow-hidden rounded-2xl bg-warm-primary py-4 text-lg font-bold text-white shadow-soft transition-all hover:bg-[#FF8A5B] active:scale-[0.98]"
          >
            <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
            <span className="relative flex items-center justify-center gap-2">
              마무리로 이동
              <span
                aria-hidden
                className="material-symbols-outlined text-[24px] transition-transform group-hover:translate-x-1"
              >
                arrow_forward
              </span>
            </span>
          </button>
          <p className="mt-4 text-center text-xs font-normal text-warm-text/40">
            {peerAnswerSub}
          </p>
        </footer>
      </div>
    </section>
  );
}
