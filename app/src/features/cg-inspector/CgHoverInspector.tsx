import { useCallback, useEffect, useRef, useState } from "react";

type CgHoverInspectorProps = {
  enabled: boolean;
};

type TooltipState = {
  visible: boolean;
  label: string;
  id: string;
  top: number;
  left: number;
  placeBelow: boolean;
};

const INTERACTIVE_SELECTOR = [
  "[data-cg-label]",
  "[data-cg-id]",
  "button",
  "a[href]",
  "input",
  "select",
  "textarea",
  "summary",
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const NON_INSPECTABLE_TAGS = new Set([
  "HTML",
  "BODY",
  "HEAD",
  "SCRIPT",
  "STYLE",
  "META",
  "LINK",
  "TITLE",
  "NOSCRIPT",
]);

const INSPECTOR_UI_ATTR = "data-cg-inspector-ui";
const ACTIVE_HOVER_ATTR = "data-cg-hover-active";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const compactText = (value: string): string => value.replace(/\s+/g, " ").trim();

const truncateText = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
};

const readLabel = (element: HTMLElement): string => {
  const fromCgLabel = compactText(element.getAttribute("data-cg-label") ?? "");
  if (fromCgLabel) {
    return fromCgLabel;
  }

  const fromAria = compactText(element.getAttribute("aria-label") ?? "");
  if (fromAria) {
    return fromAria;
  }

  const fromTitle = compactText(element.getAttribute("title") ?? "");
  if (fromTitle) {
    return fromTitle;
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    const fromPlaceholder = compactText(
      element.getAttribute("placeholder") ?? element.getAttribute("name") ?? "",
    );
    if (fromPlaceholder) {
      return truncateText(fromPlaceholder, 48);
    }
  }

  const fromText = compactText(element.textContent ?? "");
  if (fromText) {
    return truncateText(fromText, 48);
  }

  const fromId = compactText(element.getAttribute("data-cg-id") ?? "");
  if (fromId) {
    return fromId;
  }

  return `<${element.tagName.toLowerCase()}>`;
};

const findInspectableElement = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const isInspectable = (element: HTMLElement): boolean => {
    if (NON_INSPECTABLE_TAGS.has(element.tagName)) {
      return false;
    }

    if (element.closest(`[${INSPECTOR_UI_ATTR}="true"]`)) {
      return false;
    }

    return true;
  };

  const preferred = target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
  if (preferred && isInspectable(preferred)) {
    return preferred;
  }

  let cursor: HTMLElement | null = target;
  while (cursor) {
    if (isInspectable(cursor)) {
      return cursor;
    }
    cursor = cursor.parentElement;
  }

  return null;
};

const createTooltipState = (element: HTMLElement): TooltipState => {
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const centerX = rect.left + rect.width / 2;
  const left = clamp(centerX, 16, Math.max(16, viewportWidth - 16));
  const placeBelow = rect.top < 72;
  const top = placeBelow ? rect.bottom + 8 : rect.top - 8;
  const label = readLabel(element);
  const id = compactText(element.getAttribute("data-cg-id") ?? "");

  return {
    visible: true,
    label,
    id,
    top,
    left,
    placeBelow,
  };
};

const HIDDEN_TOOLTIP: TooltipState = {
  visible: false,
  label: "",
  id: "",
  top: 0,
  left: 0,
  placeBelow: false,
};

export default function CgHoverInspector({ enabled }: CgHoverInspectorProps) {
  const activeElementRef = useRef<HTMLElement | null>(null);
  const pendingElementRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(HIDDEN_TOOLTIP);

  const clearActiveElement = useCallback(() => {
    if (activeElementRef.current) {
      activeElementRef.current.removeAttribute(ACTIVE_HOVER_ATTR);
      activeElementRef.current = null;
    }
    setTooltip(HIDDEN_TOOLTIP);
  }, []);

  const syncTooltipForElement = useCallback((element: HTMLElement | null) => {
    if (!element) {
      setTooltip(HIDDEN_TOOLTIP);
      return;
    }
    setTooltip(createTooltipState(element));
  }, []);

  const setActiveElement = useCallback(
    (element: HTMLElement | null) => {
      if (activeElementRef.current === element) {
        syncTooltipForElement(element);
        return;
      }

      if (activeElementRef.current) {
        activeElementRef.current.removeAttribute(ACTIVE_HOVER_ATTR);
      }

      activeElementRef.current = element;

      if (activeElementRef.current) {
        activeElementRef.current.setAttribute(ACTIVE_HOVER_ATTR, "true");
      }

      syncTooltipForElement(activeElementRef.current);
    },
    [syncTooltipForElement],
  );

  useEffect(() => {
    if (!enabled) {
      clearActiveElement();
      return;
    }

    const flushPending = () => {
      rafRef.current = null;
      setActiveElement(pendingElementRef.current);
    };

    const scheduleFlush = () => {
      if (rafRef.current !== null) {
        return;
      }
      rafRef.current = window.requestAnimationFrame(flushPending);
    };

    const onMouseMove = (event: MouseEvent) => {
      pendingElementRef.current = findInspectableElement(event.target);
      scheduleFlush();
    };

    const onMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        clearActiveElement();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      const focused = findInspectableElement(event.target);
      setActiveElement(focused);
    };

    const onViewportChange = () => {
      if (activeElementRef.current) {
        syncTooltipForElement(activeElementRef.current);
      }
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      clearActiveElement();
    };
  }, [clearActiveElement, enabled, setActiveElement, syncTooltipForElement]);

  if (!enabled || !tooltip.visible) {
    return null;
  }

  return (
    <div aria-hidden className="cg-hover-layer" data-cg-inspector-ui="true">
      <div
        className={[
          "cg-hover-label",
          tooltip.placeBelow ? "cg-hover-label--below" : "cg-hover-label--above",
        ].join(" ")}
        style={{
          top: `${tooltip.top}px`,
          left: `${tooltip.left}px`,
        }}
      >
        <p className="cg-hover-label__title">{tooltip.label}</p>
        {tooltip.id ? <p className="cg-hover-label__id">{tooltip.id}</p> : null}
      </div>
    </div>
  );
}
