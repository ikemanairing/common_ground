import Step1Hero from "./Step1Hero";

export type Step1ScreenProps = {
  liveParticipantCount: number | null;
  isPresenceLoading: boolean;
  isEntering: boolean;
  onEnter: () => void;
  isBackDisabled: boolean;
  shouldAnimateIntro: boolean;
};

export default function Step1Screen({
  liveParticipantCount,
  isPresenceLoading,
  isEntering,
  onEnter,
  isBackDisabled,
  shouldAnimateIntro,
}: Step1ScreenProps) {
  return (
    <section className="flex h-full min-h-full w-full items-stretch justify-center bg-sage-50 p-4">
      <div className="hide-scrollbar relative mx-auto flex h-full w-full max-w-[400px] flex-col overflow-y-auto rounded-[2.5rem] bg-beige-100 shadow-2xl">
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <Step1Hero
            onEnter={onEnter}
            liveParticipantCount={liveParticipantCount}
            isPresenceLoading={isPresenceLoading}
            isEntering={isEntering}
            isBackDisabled={isBackDisabled}
            shouldAnimateIntro={shouldAnimateIntro}
          />

          <div
            className="pointer-events-none mt-auto flex w-full justify-center pb-6 pt-2"
            aria-hidden="true"
          >
            <div className="h-1.5 w-1/3 rounded-full bg-warm-gray-800/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
