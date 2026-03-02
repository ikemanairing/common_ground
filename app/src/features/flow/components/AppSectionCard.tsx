import type { ReactNode } from "react";

type AppSectionCardProps = {
  children: ReactNode;
  className?: string;
};

export default function AppSectionCard({ children, className }: AppSectionCardProps) {
  return (
    <section
      className={[
        "w-full rounded-2xl border border-sage-100 bg-beige-100 p-6 shadow-inner-soft",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
