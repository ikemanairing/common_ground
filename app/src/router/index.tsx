import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import App from "../App";
import MobileShell from "../layouts/MobileShell";
import Step1 from "../features/flow/steps/Step1";
import Step1Profile from "../features/flow/steps/Step1Profile";
import Step2 from "../features/flow/steps/Step2";
import Step3 from "../features/flow/steps/Step3";
import Step4 from "../features/flow/steps/Step4";
import Step5 from "../features/flow/steps/Step5";
import StepQ2 from "../features/flow/steps/StepQ2";
import StepQ3 from "../features/flow/steps/StepQ3";
import StepQ4 from "../features/flow/steps/StepQ4";
import StepQ5 from "../features/flow/steps/StepQ5";
import StepQ6 from "../features/flow/steps/StepQ6";
import StepQ7 from "../features/flow/steps/StepQ7";
import StepQ8 from "../features/flow/steps/StepQ8";
import Step6 from "../features/flow/steps/Step6";
import Step7 from "../features/flow/steps/Step7";
import Step8 from "../features/flow/steps/Step8";
import Step9 from "../features/flow/steps/Step9";
import Step10 from "../features/flow/steps/Step10";
import Done from "../features/flow/steps/Done";
import { useFlowStore } from "../features/flow/state/useFlowStore";
import {
  canAccessRoute,
  getResumePath,
  type AppRoutePath,
} from "./flowNavigation";

function ResumeIndexRoute() {
  const { state } = useFlowStore();
  const resumePath = getResumePath(state);

  if (resumePath === "/") {
    return <Step1 />;
  }

  return <Navigate replace to={resumePath} />;
}

function FlowRouteGate({
  path,
  children,
}: {
  path: AppRoutePath;
  children: React.ReactElement;
}) {
  const { state } = useFlowStore();

  if (canAccessRoute(state, path)) {
    return children;
  }

  return <Navigate replace to={getResumePath(state)} />;
}

function DoneRoute() {
  const navigate = useNavigate();
  const { resetFlow } = useFlowStore();
  return (
    <Done
      onRestart={() => {
        resetFlow();
        navigate("/", { replace: true });
      }}
    />
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route element={<MobileShell />}>
          <Route index element={<ResumeIndexRoute />} />
          <Route
            path="profile"
            element={
              <FlowRouteGate path="/profile">
                <Step1Profile />
              </FlowRouteGate>
            }
          />
          <Route
            path="interests"
            element={
              <FlowRouteGate path="/interests">
                <Step2 />
              </FlowRouteGate>
            }
          />
          <Route
            path="topics"
            element={
              <FlowRouteGate path="/topics">
                <Step3 />
              </FlowRouteGate>
            }
          />
          <Route
            path="promise"
            element={
              <FlowRouteGate path="/promise">
                <Step4 />
              </FlowRouteGate>
            }
          />
          <Route
            path="q1"
            element={
              <FlowRouteGate path="/q1">
                <Step5 />
              </FlowRouteGate>
            }
          />
          <Route
            path="q2"
            element={
              <FlowRouteGate path="/q2">
                <StepQ2 />
              </FlowRouteGate>
            }
          />
          <Route
            path="q3"
            element={
              <FlowRouteGate path="/q3">
                <StepQ3 />
              </FlowRouteGate>
            }
          />
          <Route
            path="q4"
            element={
              <FlowRouteGate path="/q4">
                <StepQ4 />
              </FlowRouteGate>
            }
          />
          <Route
            path="q5"
            element={
              <FlowRouteGate path="/q5">
                <StepQ5 />
              </FlowRouteGate>
            }
          />
          <Route
            path="q6"
            element={
              <FlowRouteGate path="/q6">
                <StepQ6 />
              </FlowRouteGate>
            }
          />
          <Route
            path="q7"
            element={
              <FlowRouteGate path="/q7">
                <StepQ7 />
              </FlowRouteGate>
            }
          />
          <Route
            path="q8"
            element={
              <FlowRouteGate path="/q8">
                <StepQ8 />
              </FlowRouteGate>
            }
          />
          <Route
            path="compare"
            element={
              <FlowRouteGate path="/compare">
                <Step6 />
              </FlowRouteGate>
            }
          />
          <Route
            path="wrap-up"
            element={
              <FlowRouteGate path="/wrap-up">
                <Step7 />
              </FlowRouteGate>
            }
          />
          <Route
            path="emotion"
            element={
              <FlowRouteGate path="/emotion">
                <Step8 />
              </FlowRouteGate>
            }
          />
          <Route
            path="summary"
            element={
              <FlowRouteGate path="/summary">
                <Step9 />
              </FlowRouteGate>
            }
          />
          <Route
            path="mission"
            element={
              <FlowRouteGate path="/mission">
                <Step10 />
              </FlowRouteGate>
            }
          />
          <Route
            path="done"
            element={
              <FlowRouteGate path="/done">
                <DoneRoute />
              </FlowRouteGate>
            }
          />
        </Route>
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}
