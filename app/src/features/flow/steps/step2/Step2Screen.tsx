import { useMemo } from "react";
import {
  STEP2_MAX_INTERESTS_PER_CATEGORY,
  STEP2_MIN_INTERESTS_PER_CATEGORY,
  STEP2_REQUIRED_CATEGORIES,
  getStep2CategorySelectionCounts,
  type Step2InterestCategory,
} from "./step2.constants";

type Step2ScreenProps = {
  selectedInterests: string[];
  selectedSet: Set<string>;
  revealedCategoryCount: number;
  isReadyToProceed: boolean;
  errorMessage: string | null;
  onToggleInterest: (interest: string) => void;
  onClearAll: () => void;
  onBack: () => void;
  onNext: () => void;
};

function Step2InterestChip({
  label,
  selected,
  disabled,
  onToggle,
  chipHoverClassName,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onToggle: (interest: string) => void;
  chipHoverClassName: string;
}) {
  const isDisabled = disabled && !selected;

  return (
    <button
      type="button"
      onClick={() => onToggle(label)}
      disabled={isDisabled}
      className={[
        "flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-colors",
        selected
          ? "bg-warm-primary text-white shadow-md shadow-warm-primary/30 transition-transform active:scale-95"
          : isDisabled
            ? "cursor-not-allowed border border-warm-border/40 bg-warm-secondary/20 text-warm-text-light/60"
            : `border border-warm-border/50 bg-white ${chipHoverClassName}`,
      ].join(" ")}
      aria-pressed={selected}
    >
      <span
        className={[
          "whitespace-nowrap",
          selected ? "text-sm font-bold" : "text-sm font-medium text-warm-text-light",
        ].join(" ")}
      >
        {label}
      </span>
      {selected ? (
        <span aria-hidden className="material-symbols-outlined text-[16px] leading-none">
          check
        </span>
      ) : null}
    </button>
  );
}

function Step2InterestCategoryCard({
  category,
  selectedSet,
  selectedCount,
  onToggleInterest,
}: {
  category: Step2InterestCategory;
  selectedSet: Set<string>;
  selectedCount: number;
  onToggleInterest: (interest: string) => void;
}) {
  return (
    <article className="cg-step2-category-reveal rounded-2xl border border-warm-border/40 bg-warm-surface p-4 shadow-soft">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={[
              "flex h-10 w-10 items-center justify-center rounded-full",
              category.iconShellClassName,
            ].join(" ")}
          >
            <span aria-hidden className="material-symbols-outlined">
              {category.icon}
            </span>
          </div>
          <p className="text-base font-bold text-warm-text">{category.title}</p>
        </div>
        <span className="rounded-full bg-warm-secondary/30 px-2.5 py-1 text-xs font-semibold text-warm-text-light">
          {selectedCount} / {STEP2_MAX_INTERESTS_PER_CATEGORY}
        </span>
      </header>

      {category.options.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {category.options.map((option) => {
            const selected = selectedSet.has(option);
            const disabled = selectedCount >= STEP2_MAX_INTERESTS_PER_CATEGORY;

            return (
              <Step2InterestChip
                key={option}
                label={option}
                selected={selected}
                disabled={disabled}
                onToggle={onToggleInterest}
                chipHoverClassName={category.chipHoverClassName}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-warm-text-light">{category.placeholder ?? "준비 중입니다..."}</p>
      )}
    </article>
  );
}

export default function Step2Screen({
  selectedInterests,
  selectedSet,
  revealedCategoryCount,
  isReadyToProceed,
  errorMessage,
  onToggleInterest,
  onClearAll,
  onBack,
  onNext,
}: Step2ScreenProps) {
  const categories = useMemo(() => STEP2_REQUIRED_CATEGORIES, []);
  const totalCategoryCount = categories.length;
  const safeVisibleCount = useMemo(() => {
    if (totalCategoryCount === 0) {
      return 0;
    }
    return Math.max(1, Math.min(totalCategoryCount, revealedCategoryCount));
  }, [revealedCategoryCount, totalCategoryCount]);
  const visibleCategories = useMemo(
    () => categories.slice(0, safeVisibleCount),
    [categories, safeVisibleCount],
  );
  const selectionCounts = useMemo(
    () => getStep2CategorySelectionCounts(selectedInterests),
    [selectedInterests],
  );
  const selectionCountMap = useMemo(
    () => new Map(selectionCounts.map((count) => [count.id, count.selectedCount])),
    [selectionCounts],
  );
  const completedCategoryCount = useMemo(
    () =>
      selectionCounts.filter(
        (count) => count.selectedCount >= STEP2_MIN_INTERESTS_PER_CATEGORY,
      ).length,
    [selectionCounts],
  );
  const completionPercent = useMemo(() => {
    if (totalCategoryCount === 0) {
      return 0;
    }
    return Math.min(100, Math.round((completedCategoryCount / totalCategoryCount) * 100));
  }, [completedCategoryCount, totalCategoryCount]);

  return (
    <section className="relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-warm-bg text-warm-text shadow-xl">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-warm-border/30 bg-warm-bg/95 p-4 pb-2 backdrop-blur-sm">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-warm-text transition-colors hover:bg-warm-secondary/30"
          aria-label="뒤로 가기"
        >
          <span aria-hidden className="material-symbols-outlined">
            arrow_back
          </span>
        </button>
        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-warm-text">
          관심사 선택
        </h2>
        <div className="w-10" />
      </header>

      <section className="flex flex-col gap-2 px-6 pb-4 pt-6">
        <div className="flex items-end justify-between">
          <p className="text-base font-medium leading-normal">선택 진행률</p>
          <span className="text-xs font-bold text-warm-primary">{completionPercent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-warm-secondary/30">
          <div
            className="h-full rounded-full bg-warm-primary transition-all duration-500 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="pt-2 text-center text-sm font-normal leading-normal text-warm-text-light">
          카테고리마다{" "}
          <span className="font-bold text-warm-primary">{STEP2_MAX_INTERESTS_PER_CATEGORY}개</span>를
          선택하면 다음 카테고리가 자동으로 열려요.
        </p>
        {errorMessage ? (
          <p role="alert" className="text-center text-sm font-semibold text-red-500">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <section className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 pb-44">
        {visibleCategories.map((category) => (
          <Step2InterestCategoryCard
            key={category.id}
            category={category}
            selectedSet={selectedSet}
            selectedCount={selectionCountMap.get(category.id) ?? 0}
            onToggleInterest={onToggleInterest}
          />
        ))}
      </section>

      <footer className="sticky bottom-0 w-full border-t border-warm-border/30 bg-warm-bg/95 p-4 pb-8 shadow-inner backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wider text-warm-text-light">
            총 선택: {selectedInterests.length}개
          </p>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-warm-primary transition-colors hover:text-warm-primary/80"
          >
            처음부터 다시 선택
          </button>
        </div>

        {isReadyToProceed ? (
          <button
            type="button"
            onClick={onNext}
            className="cg-step2-cta-reveal flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-warm-primary text-sm font-bold text-white shadow-md shadow-warm-primary/30 transition-colors hover:bg-warm-primary/90 active:scale-[0.99]"
          >
            다음으로 진행하기
            <span aria-hidden className="material-symbols-outlined text-[18px] leading-none">
              arrow_forward
            </span>
          </button>
        ) : (
          <p className="text-center text-sm text-warm-text-light">
            모든 카테고리에서 {STEP2_MIN_INTERESTS_PER_CATEGORY}개씩 고르면 다음으로 이동할 수 있어요.
          </p>
        )}
      </footer>
    </section>
  );
}
