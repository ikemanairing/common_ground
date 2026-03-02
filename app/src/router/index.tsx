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
          <Route index element={<Step1 />} />
          <Route path="profile" element={<Step1Profile />} />
          <Route path="interests" element={<Step2 />} />
          <Route path="topics" element={<Step3 />} />
          <Route path="promise" element={<Step4 />} />
          <Route path="q1" element={<Step5 />} />
          <Route path="q2" element={<StepQ2 />} />
          <Route path="q3" element={<StepQ3 />} />
          <Route path="q4" element={<StepQ4 />} />
          <Route path="q5" element={<StepQ5 />} />
          <Route path="q6" element={<StepQ6 />} />
          <Route path="q7" element={<StepQ7 />} />
          <Route path="q8" element={<StepQ8 />} />
          <Route path="compare" element={<Step6 />} />
          <Route path="wrap-up" element={<Step7 />} />
          <Route path="emotion" element={<Step8 />} />
          <Route path="summary" element={<Step9 />} />
          <Route path="mission" element={<Step10 />} />
          <Route path="done" element={<DoneRoute />} />
        </Route>
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}
