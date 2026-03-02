import { useEffect, useMemo, useState } from "react";
import {
  STEP3_ACTIVITY_OPTIONS,
  STEP3_TOPIC_OPTIONS,
  type Step3ActivityOption,
} from "./step3.constants";

type Step3ScreenProps = {
  selectedTopics: string[];
  selectedActivity: string;
  errorMessage: string | null;
  onToggleTopic: (topic: string) => void;
  onSelectActivity: (activity: string) => void;
  onBack: () => void;
  onNext: () => void;
};

const STEP3_QUESTION_TITLE = "어떤 이야기를 나누고 싶나요?";
const STEP3_QUESTION_SUBTITLE = "친구들과 자연스럽게 대화할 수 있는 주제를\n2가지 선택해주세요.";
const STEP3_ACTIVITY_TITLE = "같이 해보고 싶은 활동은요?";
const STEP3_ACTIVITY_SUBTITLE = "새로운 친구와 함께 하고싶은 활동 한가지를 골라주세요.";
const STEP3_TITLE_TYPING_DURATION_MS = 2000;
const STEP3_SUBTITLE_TYPING_DURATION_MS = 2000;
const STEP3_ACTIVITY_TITLE_TYPING_DURATION_MS = 2000;
const STEP3_ACTIVITY_SUBTITLE_TYPING_DURATION_MS = 2500;

type Step3IntroPhase =
  | "questionTitle"
  | "questionSubtitle"
  | "topicsFade"
  | "waitTopicsSelection"
  | "activityTitle"
  | "activitySubtitle"
  | "activitiesFade"
  | "done";

const STEP3_PHASE_ORDER: Record<Step3IntroPhase, number> = {
  questionTitle: 0,
  questionSubtitle: 1,
  topicsFade: 2,
  waitTopicsSelection: 3,
  activityTitle: 4,
  activitySubtitle: 5,
  activitiesFade: 6,
  done: 7,
};

const isStep3PhaseAtLeast = (phase: Step3IntroPhase, target: Step3IntroPhase): boolean => {
  return STEP3_PHASE_ORDER[phase] >= STEP3_PHASE_ORDER[target];
};

function Step3TopicChip({
  topic,
  selected,
  onToggle,
}: {
  topic: string;
  selected: boolean;
  onToggle: (topic: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(topic)}
      className={[
        "flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all",
        selected
          ? "bg-warm-primary text-white shadow-md shadow-warm-primary/30"
          : "border border-warm-border/50 bg-white text-warm-text hover:bg-warm-secondary/40",
      ].join(" ")}
      aria-pressed={selected}
    >
      <span className={selected ? "text-sm font-bold" : "text-sm font-medium"}>
        {topic}
      </span>
      {selected ? (
        <span aria-hidden className="material-symbols-outlined text-[16px] leading-none">
          check
        </span>
      ) : null}
    </button>
  );
}

function Step3ActivityCard({
  option,
  selected,
  onSelect,
}: {
  option: Step3ActivityOption;
  selected: boolean;
  onSelect: (activity: string) => void;
}) {
  const iconClassName = selected
    ? option.iconClassName
        .split(" ")
        .filter((token) => !token.startsWith("group-hover:"))
        .join(" ")
    : option.iconClassName;

  return (
    <button
      type="button"
      onClick={() => onSelect(option.title)}
      className={[
        "group relative flex flex-col items-start gap-3 rounded-2xl p-5 text-left transition-all",
        selected
          ? "border-2 border-warm-primary bg-warm-secondary/50 shadow-md"
          : "border border-warm-border/40 bg-white shadow-soft hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
      aria-pressed={selected}
    >
      {selected ? (
        <div className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-warm-primary text-white shadow-sm">
          <span aria-hidden className="material-symbols-outlined text-[16px] font-bold">
            check
          </span>
        </div>
      ) : null}
      <div className={["rounded-xl p-2.5 transition-colors", iconClassName].join(" ")}>
        <span aria-hidden className="material-symbols-outlined">
          {option.icon}
        </span>
      </div>
      <div>
        <h3 className="text-[15px] font-bold text-warm-text">{option.title}</h3>
        <p className="mt-1 text-xs text-warm-text-light">{option.subtitle}</p>
      </div>
    </button>
  );
}

export default function Step3Screen({
  selectedTopics,
  selectedActivity,
  errorMessage,
  onToggleTopic,
  onSelectActivity,
  onBack,
  onNext,
}: Step3ScreenProps) {
  const selectedTopicSet = new Set(selectedTopics);
  const [introPhase, setIntroPhase] = useState<Step3IntroPhase>("questionTitle");
  const [questionTitleLength, setQuestionTitleLength] = useState(0);
  const [questionSubtitleLength, setQuestionSubtitleLength] = useState(0);
  const [activityTitleLength, setActivityTitleLength] = useState(0);
  const [activitySubtitleLength, setActivitySubtitleLength] = useState(0);

  useEffect(() => {
    if (introPhase !== "questionTitle") {
      return;
    }

    setQuestionTitleLength(0);
    const stepMs = Math.max(
      40,
      Math.floor(STEP3_TITLE_TYPING_DURATION_MS / Math.max(1, STEP3_QUESTION_TITLE.length)),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / STEP3_TITLE_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * STEP3_QUESTION_TITLE.length);
      setQuestionTitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setQuestionTitleLength(STEP3_QUESTION_TITLE.length);
        setIntroPhase("questionSubtitle");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  useEffect(() => {
    if (introPhase !== "questionSubtitle") {
      return;
    }

    setQuestionSubtitleLength(0);
    const stepMs = Math.max(
      40,
      Math.floor(STEP3_SUBTITLE_TYPING_DURATION_MS / Math.max(1, STEP3_QUESTION_SUBTITLE.length)),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / STEP3_SUBTITLE_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * STEP3_QUESTION_SUBTITLE.length);
      setQuestionSubtitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setQuestionSubtitleLength(STEP3_QUESTION_SUBTITLE.length);
        setIntroPhase("topicsFade");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  useEffect(() => {
    if (introPhase !== "activityTitle") {
      return;
    }

    setActivityTitleLength(0);
    const stepMs = Math.max(
      40,
      Math.floor(STEP3_ACTIVITY_TITLE_TYPING_DURATION_MS / Math.max(1, STEP3_ACTIVITY_TITLE.length)),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / STEP3_ACTIVITY_TITLE_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * STEP3_ACTIVITY_TITLE.length);
      setActivityTitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setActivityTitleLength(STEP3_ACTIVITY_TITLE.length);
        setIntroPhase("activitySubtitle");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  useEffect(() => {
    if (introPhase !== "waitTopicsSelection") {
      return;
    }

    if (selectedTopics.length >= 2) {
      setIntroPhase("activityTitle");
    }
  }, [introPhase, selectedTopics.length]);

  useEffect(() => {
    if (introPhase !== "activitySubtitle") {
      return;
    }

    setActivitySubtitleLength(0);
    const stepMs = Math.max(
      40,
      Math.floor(
        STEP3_ACTIVITY_SUBTITLE_TYPING_DURATION_MS / Math.max(1, STEP3_ACTIVITY_SUBTITLE.length),
      ),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / STEP3_ACTIVITY_SUBTITLE_TYPING_DURATION_MS);
      const nextLength = Math.ceil(progress * STEP3_ACTIVITY_SUBTITLE.length);
      setActivitySubtitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setActivitySubtitleLength(STEP3_ACTIVITY_SUBTITLE.length);
        setIntroPhase("activitiesFade");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase]);

  const questionTitleText = isStep3PhaseAtLeast(introPhase, "questionSubtitle")
    ? STEP3_QUESTION_TITLE
    : STEP3_QUESTION_TITLE.slice(0, questionTitleLength);
  const questionSubtitleText = isStep3PhaseAtLeast(introPhase, "topicsFade")
    ? STEP3_QUESTION_SUBTITLE
    : STEP3_QUESTION_SUBTITLE.slice(0, questionSubtitleLength);
  const activityTitleText = isStep3PhaseAtLeast(introPhase, "activitySubtitle")
    ? STEP3_ACTIVITY_TITLE
    : STEP3_ACTIVITY_TITLE.slice(0, activityTitleLength);
  const activitySubtitleText = isStep3PhaseAtLeast(introPhase, "activitiesFade")
    ? STEP3_ACTIVITY_SUBTITLE
    : STEP3_ACTIVITY_SUBTITLE.slice(0, activitySubtitleLength);
  const showQuestionSubtitle = isStep3PhaseAtLeast(introPhase, "questionSubtitle");
  const showTopics = isStep3PhaseAtLeast(introPhase, "topicsFade");
  const showActivitySection = isStep3PhaseAtLeast(introPhase, "activityTitle");
  const showActivitySubtitle = isStep3PhaseAtLeast(introPhase, "activitySubtitle");
  const showActivities = isStep3PhaseAtLeast(introPhase, "activitiesFade");
  const isQuestionTitleTyping =
    introPhase === "questionTitle" && questionTitleLength < STEP3_QUESTION_TITLE.length;
  const isQuestionSubtitleTyping =
    introPhase === "questionSubtitle" && questionSubtitleLength < STEP3_QUESTION_SUBTITLE.length;
  const isActivityTitleTyping =
    introPhase === "activityTitle" && activityTitleLength < STEP3_ACTIVITY_TITLE.length;
  const isActivitySubtitleTyping =
    introPhase === "activitySubtitle" &&
    activitySubtitleLength < STEP3_ACTIVITY_SUBTITLE.length;

  return (
    <section className="relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-warm-bg text-warm-text shadow-xl">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-warm-border/30 bg-warm-bg/95 p-4 pb-2 backdrop-blur-sm">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-warm-text transition-colors hover:bg-warm-secondary/30"
          aria-label="뒤로 가기"
        >
          <span aria-hidden className="material-symbols-outlined">
            arrow_back
          </span>
        </button>
        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-warm-text">
          나의 카드 만들기
        </h2>
        <div className="w-10" />
      </header>

      <div className="flex w-full items-center justify-center gap-2 px-6 py-3">
        <div className="h-2 w-2 rounded-full bg-warm-primary/20" />
        <div className="h-2 w-2 rounded-full bg-warm-primary/20" />
        <div className="h-2 w-8 rounded-full bg-warm-primary shadow-sm" />
        <div className="h-2 w-2 rounded-full bg-warm-primary/20" />
        <div className="h-2 w-2 rounded-full bg-warm-primary/20" />
      </div>

      <main className="flex flex-1 flex-col overflow-y-auto px-6 pb-32">
        <section className="mb-8">
          <h1 className="mb-3 text-[26px] font-bold leading-tight text-warm-text">
            {questionTitleText || "\u00A0"}
            {isQuestionTitleTyping ? (
              <span aria-hidden className="cg-step1-type-caret">
                |
              </span>
            ) : null}
          </h1>
          <p
            className={[
              "mb-6 min-h-[3.4rem] whitespace-pre-line text-[15px] font-medium leading-relaxed text-warm-text-light",
              showQuestionSubtitle ? "" : "opacity-0",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {questionSubtitleText || "\u00A0"}
            {isQuestionSubtitleTyping ? (
              <span aria-hidden className="cg-step1-type-caret">
                |
              </span>
            ) : null}
          </p>
          <div
            className={[
              "flex flex-wrap gap-3",
              showTopics ? "" : "cg-step1-hidden",
              introPhase === "topicsFade" ? "cg-step3-fade-2s" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onAnimationEnd={(event) => {
              if (event.target !== event.currentTarget) {
                return;
              }
              if (introPhase === "topicsFade") {
                if (selectedTopics.length >= 2) {
                  setIntroPhase("activityTitle");
                } else {
                  setIntroPhase("waitTopicsSelection");
                }
              }
            }}
          >
            {STEP3_TOPIC_OPTIONS.map((topic) => (
              <Step3TopicChip
                key={topic}
                topic={topic}
                selected={selectedTopicSet.has(topic)}
                onToggle={onToggleTopic}
              />
            ))}
          </div>
        </section>

        {showActivitySection ? (
          <>
            <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-warm-border/70 to-transparent" />

            <section>
              <h2 className="mb-3 text-[22px] font-bold leading-tight text-warm-text">
                {activityTitleText || "\u00A0"}
                {isActivityTitleTyping ? (
                  <span aria-hidden className="cg-step1-type-caret">
                    |
                  </span>
                ) : null}
              </h2>
              <p
                className={[
                  "mb-6 min-h-[2.6rem] text-sm font-medium text-warm-text-light",
                  showActivitySubtitle ? "" : "opacity-0",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {activitySubtitleText || "\u00A0"}
                {isActivitySubtitleTyping ? (
                  <span aria-hidden className="cg-step1-type-caret">
                    |
                  </span>
                ) : null}
              </p>
              <div
                className={[
                  "grid grid-cols-2 gap-4",
                  showActivities ? "" : "cg-step1-hidden",
                  introPhase === "activitiesFade" ? "cg-step3-fade-2s" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onAnimationEnd={(event) => {
                  if (event.target !== event.currentTarget) {
                    return;
                  }
                  if (introPhase === "activitiesFade") {
                    setIntroPhase("done");
                  }
                }}
              >
                {STEP3_ACTIVITY_OPTIONS.map((option) => (
                  <Step3ActivityCard
                    key={option.title}
                    option={option}
                    selected={selectedActivity === option.title}
                    onSelect={onSelectActivity}
                  />
                ))}
              </div>
            </section>
          </>
        ) : introPhase === "waitTopicsSelection" ? (
          <p className="mb-8 text-center text-sm font-medium text-warm-text-light">
            주제를 2개 선택하면 활동 선택이 열려요.
          </p>
        ) : null}
      </main>

      <div className="sticky bottom-0 w-full border-t border-warm-border/30 bg-warm-bg/95 p-4 pb-8 shadow-inner backdrop-blur-sm">
        {errorMessage ? (
          <p role="alert" className="mb-3 text-center text-sm font-semibold text-red-500">
            {errorMessage}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onNext}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-warm-primary text-lg font-bold text-white shadow-soft transition-colors hover:bg-warm-primary/90 active:scale-[0.98]"
        >
          다음 단계로
          <span aria-hidden className="material-symbols-outlined">
            arrow_forward
          </span>
        </button>
      </div>
    </section>
  );
}
