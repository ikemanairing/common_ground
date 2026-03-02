type ValidationResult = {
  valid: boolean;
  errors: string[];
};

type StepValidator = (payload: unknown) => ValidationResult;

type ValidatorExpectation = {
  stepId: string;
  caseName: string;
  payload: unknown;
  expectedValid: boolean;
  expectedErrorTokens?: string[];
};

type Outcome = {
  status: "pass" | "skip" | "fail";
  message: string;
};

declare const describe:
  | undefined
  | ((name: string, callback: () => void) => void);
declare const it: undefined | ((name: string, callback: () => void) => void);
declare const process: undefined | { env?: Record<string, string | undefined> };

const expectations: ValidatorExpectation[] = [
  {
    stepId: "step1",
    caseName: "rejects empty nickname",
    payload: { nickname: "" },
    expectedValid: false,
    expectedErrorTokens: ["nickname"],
  },
  {
    stepId: "step2",
    caseName: "accepts supported team size",
    payload: { teamSize: 2 },
    expectedValid: true,
  },
  {
    stepId: "step2",
    caseName: "rejects unsupported team size",
    payload: { teamSize: 4 },
    expectedValid: false,
    expectedErrorTokens: ["teamSize"],
  },
  {
    stepId: "step3",
    caseName: "rejects missing selections",
    payload: { selections: [] },
    expectedValid: false,
    expectedErrorTokens: ["selections"],
  },
];

const validators: Record<string, StepValidator | undefined> = {
};

function evaluateExpectation(item: ValidatorExpectation): Outcome {
  const validator = validators[item.stepId];
  if (!validator) {
    return {
      status: "skip",
      message: `[skip] ${item.stepId} is not wired yet`,
    };
  }

  const result = validator(item.payload);
  if (result.valid !== item.expectedValid) {
    return {
      status: "fail",
      message: `[fail] ${item.stepId}/${item.caseName}: expected valid=${item.expectedValid}, got ${result.valid}`,
    };
  }

  if (item.expectedErrorTokens && item.expectedErrorTokens.length > 0) {
    const mergedErrors = result.errors.join(" ");
    for (const token of item.expectedErrorTokens) {
      if (!mergedErrors.includes(token)) {
        return {
          status: "fail",
          message: `[fail] ${item.stepId}/${item.caseName}: missing error token "${token}"`,
        };
      }
    }
  }

  return { status: "pass", message: `[pass] ${item.stepId}/${item.caseName}` };
}

function registerRunnerSuite(): void {
  describe!("step validator expectations", () => {
    for (const item of expectations) {
      it!(`[${item.stepId}] ${item.caseName}`, () => {
        const outcome = evaluateExpectation(item);
        if (outcome.status === "skip") {
          return;
        }
        if (outcome.status === "fail") {
          throw new Error(outcome.message);
        }
      });
    }
  });
}

export function runPseudoStepValidatorSpec(): void {
  let failCount = 0;

  for (const item of expectations) {
    const outcome = evaluateExpectation(item);
    if (outcome.status === "fail") {
      failCount += 1;
      console.error(outcome.message);
      continue;
    }
    console.log(outcome.message);
  }

  if (failCount > 0) {
    throw new Error(`step validator pseudo suite failed with ${failCount} case(s)`);
  }
}

if (typeof describe === "function" && typeof it === "function") {
  registerRunnerSuite();
} else if (
  typeof process !== "undefined" &&
  process.env &&
  process.env.RUN_PSEUDO_VALIDATOR_SPEC === "1"
) {
  runPseudoStepValidatorSpec();
}
