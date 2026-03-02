export type ProfileIntroPhase = "title" | "step" | "avatar" | "name" | "quote" | "buttons" | "done";

const PROFILE_INTRO_PHASE_INDEX: Record<ProfileIntroPhase, number> = {
  title: 0,
  step: 1,
  avatar: 2,
  name: 3,
  quote: 4,
  buttons: 5,
  done: 6,
};

export const isProfileIntroPhaseAtLeast = (
  phase: ProfileIntroPhase,
  target: ProfileIntroPhase,
): boolean => {
  return PROFILE_INTRO_PHASE_INDEX[phase] >= PROFILE_INTRO_PHASE_INDEX[target];
};

