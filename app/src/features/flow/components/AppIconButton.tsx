type AppIconButtonProps = {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function AppIconButton({
  icon,
  label,
  onClick,
  disabled = false,
  className,
}: AppIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-warm-gray-600 transition-colors hover:bg-sage-100 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span aria-hidden className="material-symbols-outlined text-[22px] leading-none">
        {icon}
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
