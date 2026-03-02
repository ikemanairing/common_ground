import { useEffect, useMemo, useState } from "react";

import { useFlowStore } from "../state/useFlowStore";

type Step1Data = {
  nickname?: string;
};

type Step8Data = {
  emotion?: string;
};

type Step9Data = {
  summaryText?: string;
};

type Step10Data = {
  mission?: string;
};

type FlowState = {
  stepData?: {
    1?: Step1Data;
    8?: Step8Data;
    9?: Step9Data;
    10?: Step10Data;
    [key: number]: unknown;
  };
};

type FlowStoreContract = {
  state: FlowState;
  updateStepData: (stepNo: number, payload: Record<string, unknown>) => void;
};

type DoneProps = {
  onRestart?: () => void;
};

const TITLE_TEXT = "오늘 연결이 완성됐어요";
const SUBTITLE_TEXT =
  "비교와 점수 대신 서로의 답변을 모아,\n다음 대화를 시작할 준비를 끝냈어요.";
const TITLE_TYPING_DURATION_MS = 2000;
const SUBTITLE_TYPING_DURATION_MS = 2500;

type DoneIntroPhase = "badge" | "title" | "subtitle" | "summary" | "button" | "done";

const DONE_PHASE_ORDER: Record<DoneIntroPhase, number> = {
  badge: 0,
  title: 1,
  subtitle: 2,
  summary: 3,
  button: 4,
  done: 5,
};

const isDonePhaseAtLeast = (phase: DoneIntroPhase, target: DoneIntroPhase): boolean => {
  return DONE_PHASE_ORDER[phase] >= DONE_PHASE_ORDER[target];
};

export default function Done({ onRestart }: DoneProps) {
  const { state, updateStepData } = useFlowStore() as unknown as FlowStoreContract;

  const step1 = ((state as FlowState)?.stepData?.[1] ?? {}) as Step1Data;
  const step8 = ((state as FlowState)?.stepData?.[8] ?? {}) as Step8Data;
  const step9 = ((state as FlowState)?.stepData?.[9] ?? {}) as Step9Data;
  const step10 = ((state as FlowState)?.stepData?.[10] ?? {}) as Step10Data;

  const summaryRows = useMemo(
    () => [
      { label: "Nickname", value: step1.nickname ?? "익명" },
      { label: "Emotion", value: step8.emotion ?? "미선택" },
      { label: "Daily Summary", value: step9.summaryText ?? "미선택" },
      { label: "Tomorrow Mission", value: step10.mission ?? "미선택" },
    ],
    [step1.nickname, step8.emotion, step9.summaryText, step10.mission],
  );
  const [introPhase, setIntroPhase] = useState<DoneIntroPhase>("badge");
  const [titleLength, setTitleLength] = useState(0);
  const [subtitleLength, setSubtitleLength] = useState(0);
  const [visibleSummaryCount, setVisibleSummaryCount] = useState(0);

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
        setIntroPhase("summary");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  useEffect(() => {
    if (!isDonePhaseAtLeast(introPhase, "summary")) {
      setVisibleSummaryCount(0);
      return;
    }

    if (introPhase !== "summary") {
      return;
    }

    if (summaryRows.length === 0) {
      setIntroPhase("button");
      return;
    }

    setVisibleSummaryCount(1);
  }, [introPhase, summaryRows.length]);

  const showTitle = isDonePhaseAtLeast(introPhase, "title");
  const showSubtitle = isDonePhaseAtLeast(introPhase, "subtitle");
  const showSummary = isDonePhaseAtLeast(introPhase, "summary");
  const showButton = isDonePhaseAtLeast(introPhase, "button");

  const visibleTitle = introPhase === "title" ? TITLE_TEXT.slice(0, titleLength) : TITLE_TEXT;
  const visibleSubtitle =
    introPhase === "subtitle" ? SUBTITLE_TEXT.slice(0, subtitleLength) : SUBTITLE_TEXT;

  const isTitleTyping = introPhase === "title" && titleLength < TITLE_TEXT.length;
  const isSubtitleTyping = introPhase === "subtitle" && subtitleLength < SUBTITLE_TEXT.length;

  const handleRestart = () => {
    updateStepData(10, {
      doneViewedAt: new Date().toISOString(),
    });
    onRestart?.();
  };

  return (
    <section className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-orange-50/50 px-4 pb-6 pt-8">
      <div className="flex flex-1 flex-col justify-center">
        <article className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <p
            className={[
              "text-sm font-semibold text-orange-500",
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
            FLOW COMPLETED
          </p>
          <h1 className="mt-2 min-h-[2.4rem] text-3xl font-bold leading-tight text-slate-900">
            {showTitle ? visibleTitle : "\u00A0"}
            {isTitleTyping ? (
              <span aria-hidden className="cg-step1-type-caret">
                |
              </span>
            ) : null}
          </h1>
          <p className="mt-3 min-h-[2.8rem] whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {showSubtitle ? visibleSubtitle : "\u00A0"}
            {isSubtitleTyping ? (
              <span aria-hidden className="cg-step1-type-caret">
                |
              </span>
            ) : null}
          </p>
        </article>

        <article
          className={[
            "mt-4 space-y-2 rounded-2xl border border-orange-200 bg-white p-4 shadow-sm",
            showSummary ? "" : "cg-step1-hidden",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {summaryRows.map((row, index) => {
            const isVisible = index < visibleSummaryCount;
            const isActiveReveal =
              introPhase === "summary" && index === visibleSummaryCount - 1;

            return (
              <div
                key={row.label}
                className={[
                  "rounded-xl bg-orange-50 p-3",
                  isVisible ? "" : "cg-step1-hidden",
                  isActiveReveal ? "cg-step5-fade-2s" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onAnimationEnd={(event) => {
                  if (event.target !== event.currentTarget) {
                    return;
                  }
                  if (!isActiveReveal || introPhase !== "summary") {
                    return;
                  }

                  if (visibleSummaryCount < summaryRows.length) {
                    setVisibleSummaryCount((prev) => prev + 1);
                    return;
                  }

                  setIntroPhase("button");
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {row.label}
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">{row.value}</p>
              </div>
            );
          })}
        </article>
      </div>

      <button
        type="button"
        onClick={handleRestart}
        className={[
          "mt-4 h-12 w-full rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600",
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
        Start Again
      </button>
    </section>
  );
}
