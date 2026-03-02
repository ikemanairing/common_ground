import { useCallback, useEffect, useState, type AnimationEventHandler } from "react";

export type QuestionIntroPhase =
  | "badge"
  | "title"
  | "subtitle"
  | "answerField"
  | "button"
  | "done";

const QUESTION_PHASE_ORDER: Record<QuestionIntroPhase, number> = {
  badge: 0,
  title: 1,
  subtitle: 2,
  answerField: 3,
  button: 4,
  done: 5,
};

const isQuestionPhaseAtLeast = (
  phase: QuestionIntroPhase,
  target: QuestionIntroPhase,
): boolean => {
  return QUESTION_PHASE_ORDER[phase] >= QUESTION_PHASE_ORDER[target];
};

type UseQuestionIntroAnimationParams = {
  titleText: string;
  subtitleText: string;
  titleDurationMs?: number;
  subtitleDurationMs?: number;
};

type UseQuestionIntroAnimationResult = {
  introPhase: QuestionIntroPhase;
  typedTitle: string;
  typedSubtitle: string;
  showTitle: boolean;
  showSubtitle: boolean;
  showAnswerField: boolean;
  showButton: boolean;
  isTitleTyping: boolean;
  isSubtitleTyping: boolean;
  badgeAnimationClass: string;
  answerFieldAnimationClass: string;
  buttonAnimationClass: string;
  onBadgeAnimationEnd: AnimationEventHandler<HTMLElement>;
  onAnswerFieldAnimationEnd: AnimationEventHandler<HTMLElement>;
  onButtonAnimationEnd: AnimationEventHandler<HTMLElement>;
};

const DEFAULT_TITLE_DURATION_MS = 2000;
const DEFAULT_SUBTITLE_DURATION_MS = 2000;

export const useQuestionIntroAnimation = ({
  titleText,
  subtitleText,
  titleDurationMs = DEFAULT_TITLE_DURATION_MS,
  subtitleDurationMs = DEFAULT_SUBTITLE_DURATION_MS,
}: UseQuestionIntroAnimationParams): UseQuestionIntroAnimationResult => {
  const [introPhase, setIntroPhase] = useState<QuestionIntroPhase>("badge");
  const [titleLength, setTitleLength] = useState(0);
  const [subtitleLength, setSubtitleLength] = useState(0);

  useEffect(() => {
    if (introPhase !== "title") {
      return;
    }

    setTitleLength(0);
    const stepMs = Math.max(40, Math.floor(titleDurationMs / Math.max(1, titleText.length)));
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / titleDurationMs);
      const nextLength = Math.ceil(progress * titleText.length);
      setTitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setTitleLength(titleText.length);
        setIntroPhase("subtitle");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase, titleDurationMs, titleText]);

  useEffect(() => {
    if (introPhase !== "subtitle") {
      return;
    }

    setSubtitleLength(0);
    const stepMs = Math.max(
      40,
      Math.floor(subtitleDurationMs / Math.max(1, subtitleText.length)),
    );
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / subtitleDurationMs);
      const nextLength = Math.ceil(progress * subtitleText.length);
      setSubtitleLength(nextLength);

      if (progress >= 1) {
        window.clearInterval(intervalId);
        setSubtitleLength(subtitleText.length);
        setIntroPhase("answerField");
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [introPhase, subtitleDurationMs, subtitleText]);

  const showTitle = isQuestionPhaseAtLeast(introPhase, "title");
  const showSubtitle = isQuestionPhaseAtLeast(introPhase, "subtitle");
  const showAnswerField = isQuestionPhaseAtLeast(introPhase, "answerField");
  const showButton = isQuestionPhaseAtLeast(introPhase, "button");

  const typedTitle = introPhase === "title" ? titleText.slice(0, titleLength) : titleText;
  const typedSubtitle =
    introPhase === "subtitle" ? subtitleText.slice(0, subtitleLength) : subtitleText;

  const isTitleTyping = introPhase === "title" && titleLength < titleText.length;
  const isSubtitleTyping = introPhase === "subtitle" && subtitleLength < subtitleText.length;

  const badgeAnimationClass = introPhase === "badge" ? "cg-step5-fade-2s" : "";
  const answerFieldAnimationClass = introPhase === "answerField" ? "cg-step5-fade-2s" : "";
  const buttonAnimationClass = introPhase === "button" ? "cg-step5-fade-2s" : "";

  const onBadgeAnimationEnd = useCallback<AnimationEventHandler<HTMLElement>>(
    (event) => {
      if (event.target !== event.currentTarget) {
        return;
      }
      if (introPhase === "badge") {
        setIntroPhase("title");
      }
    },
    [introPhase],
  );

  const onAnswerFieldAnimationEnd = useCallback<AnimationEventHandler<HTMLElement>>(
    (event) => {
      if (event.target !== event.currentTarget) {
        return;
      }
      if (introPhase === "answerField") {
        setIntroPhase("button");
      }
    },
    [introPhase],
  );

  const onButtonAnimationEnd = useCallback<AnimationEventHandler<HTMLElement>>(
    (event) => {
      if (event.target !== event.currentTarget) {
        return;
      }
      if (introPhase === "button") {
        setIntroPhase("done");
      }
    },
    [introPhase],
  );

  return {
    introPhase,
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
  };
};
