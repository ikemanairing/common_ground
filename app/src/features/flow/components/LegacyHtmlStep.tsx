import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type LegacyHtmlStepProps = {
  page: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
};

const PAGE_ROUTE: Record<number, string> = {
  1: "/",
  2: "/interests",
  3: "/topics",
  4: "/promise",
  5: "/q1",
  6: "/compare",
  7: "/wrap-up",
  8: "/emotion",
  9: "/summary",
  10: "/mission",
};

function getTargetRoute(page: number, action: "next" | "back" | "finish"): string | null {
  if (action === "next") {
    return page >= 10 ? null : PAGE_ROUTE[page + 1];
  }
  if (action === "back") {
    return page <= 1 ? null : PAGE_ROUTE[page - 1];
  }
  if (page === 7) {
    return PAGE_ROUTE[10];
  }
  return null;
}

export default function LegacyHtmlStep({ page }: LegacyHtmlStepProps) {
  const navigate = useNavigate();
  const [bodyClass, setBodyClass] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [inlineStyles, setInlineStyles] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const response = await fetch(`/legacy/${page}.html`);
      const html = await response.text();
      if (cancelled) return;

      const bodyMatch = html.match(
        /<body[^>]*class=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/body>/i,
      );
      const fallbackBodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const styles = Array.from(
        html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi),
      )
        .map((match) => match[1])
        .join("\n");

      setBodyClass(bodyMatch?.[2] ?? "");
      setBodyHtml(bodyMatch?.[3] ?? fallbackBodyMatch?.[1] ?? html);
      setInlineStyles(styles);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const wrappedClass = useMemo(() => {
    const base = "legacy-html-step";
    return bodyClass ? `${base} ${bodyClass}` : base;
  }, [bodyClass]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const control = target?.closest<HTMLElement>("[data-nav]");
      if (!control) return;

      event.preventDefault();
      const action = control.getAttribute("data-nav");
      if (action !== "next" && action !== "back" && action !== "finish") {
        return;
      }
      const route = getTargetRoute(page, action);
      if (route) {
        navigate(route);
        return;
      }
      if (action === "finish") {
        alert("모바일 여정이 완료되었습니다!");
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate, page]);

  return (
    <section className="legacy-html-step-shell">
      {inlineStyles ? <style dangerouslySetInnerHTML={{ __html: inlineStyles }} /> : null}
      <div className={wrappedClass} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </section>
  );
}
