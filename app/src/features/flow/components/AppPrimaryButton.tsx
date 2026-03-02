import type { ReactNode } from "react";

type AppPrimaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
};

export default function AppPrimaryButton({
  children,
  onClick,
  className,
  type = "button",
}: AppPrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={[
        "inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-sage-600 px-8 text-lg font-medium text-white shadow-soft transition-colors hover:bg-sage-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
