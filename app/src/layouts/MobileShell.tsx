import { Outlet, useLocation } from "react-router-dom";
import CgHoverInspector from "../features/cg-inspector/CgHoverInspector";

const SOURCE_LAYOUT_ROUTES = new Set([
  "/interests",
  "/topics",
  "/promise",
  "/q1",
  "/q2",
  "/q3",
  "/q4",
  "/q5",
  "/q6",
  "/q7",
  "/q8",
  "/compare",
  "/wrap-up",
  "/emotion",
  "/summary",
  "/mission",
]);

export default function MobileShell() {
  const { pathname, search } = useLocation();
  const useFramedShell = !SOURCE_LAYOUT_ROUTES.has(pathname);
  const queryValue = new URLSearchParams(search).get("cg_inspector");
  const shouldEnableByQuery =
    queryValue === "1" ? true : queryValue === "0" ? false : null;
  const persistedToggle =
    typeof window !== "undefined" ? window.localStorage.getItem("cg_inspector") : null;
  const shouldEnableByStorage =
    persistedToggle === "1" ? true : persistedToggle === "0" ? false : null;
  const inspectorEnabled = shouldEnableByQuery ?? shouldEnableByStorage ?? true;

  return (
    <div className={useFramedShell ? "mobile-shell mobile-shell--framed" : "mobile-shell"}>
      <main className="mobile-shell__content">
        <Outlet />
      </main>
      <CgHoverInspector enabled={inspectorEnabled} />
    </div>
  );
}
