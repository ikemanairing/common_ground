type FlowFooterNavProps = {
  canProceed: boolean;
  onNext: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  hidePrev?: boolean;
  stepNo?: number;
  totalSteps?: number;
};

export default function FlowFooterNav({
  canProceed,
  onNext,
  onPrev,
  nextLabel = "Next",
  prevLabel = "Back",
  hidePrev = false,
  stepNo,
  totalSteps = 5,
}: FlowFooterNavProps) {
  return (
    <footer className="sticky bottom-0 mt-8 border-t border-slate-200 bg-white/95 px-4 pb-4 pt-3 backdrop-blur">
      {typeof stepNo === "number" ? (
        <p className="mb-3 text-center text-xs font-medium text-slate-500">
          Step {stepNo} / {totalSteps}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-md gap-3">
        {!hidePrev ? (
          <button
            type="button"
            onClick={onPrev}
            disabled={!onPrev}
            className="h-12 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {prevLabel}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="h-12 flex-[1.4] rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {nextLabel}
        </button>
      </div>
    </footer>
  );
}
