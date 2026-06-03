"use client";

// ─────────────────────────────────────────────
// OnboardingStepper
//
// Usage:
//   <OnboardingStepper currentStep={2} steps={ONBOARDING_STEPS} />
//
// Steps are 1-indexed: currentStep=1 means first step is active.
// ─────────────────────────────────────────────

export interface StepConfig {
  label: string;
}

export const ONBOARDING_STEPS: StepConfig[] = [
  { label: "Profile" },
  { label: "Resume" },
  { label: "GitHub" },
  { label: "Verify" },
  { label: "Prefs" },
];

interface OnboardingStepperProps {
  currentStep: number;          // 1-indexed
  steps?: StepConfig[];         // defaults to ONBOARDING_STEPS
  showLabels?: boolean;         // default true
}

export default function OnboardingStepper({
  currentStep,
  steps = ONBOARDING_STEPS,
  showLabels = true,
}: OnboardingStepperProps) {
  return (
    <>
      <style>{`
        .stepper-wrap {
          width: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 0;
          margin-bottom: 2rem;
        }

        /* ── Each step unit ── */
        .stepper-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
        }

        /* ── Connector line (sits between circles) ── */
        .stepper-item:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 14px;
          left: calc(50% + 14px);
          right: calc(-50% + 14px);
          height: 2px;
          border-radius: 1px;
          background: #E8E4DF;
          transition: background 0.3s ease;
          z-index: 0;
        }

        .stepper-item.completed::after {
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
        }

        /* ── Circle ── */
        .stepper-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
        }

        /* Upcoming */
        .stepper-circle.upcoming {
          background: #FFFFFF;
          border: 2px solid #E8E4DF;
          color: #B0A89E;
        }

        /* Current */
        .stepper-circle.current {
          background: #FFFFFF;
          border: 2px solid #FF6B4D;
          color: #FF6B4D;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.12);
        }

        /* Completed */
        .stepper-circle.completed {
          background: linear-gradient(135deg, #FF6B4D, #FFB347);
          border: 2px solid transparent;
          color: white;
          box-shadow: 0 2px 8px rgba(255,107,77,0.25);
        }

        /* ── Label ── */
        .stepper-label {
          margin-top: 6px;
          font-size: 10.5px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
          text-align: center;
          transition: color 0.2s;
        }

        .stepper-label.upcoming { color: #B0A89E; }
        .stepper-label.current  { color: #FF6B4D; }
        .stepper-label.completed { color: #FF6B4D; }
      `}</style>

      <nav className="stepper-wrap" aria-label="Onboarding progress">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const state =
            stepNumber < currentStep
              ? "completed"
              : stepNumber === currentStep
              ? "current"
              : "upcoming";

          return (
            <div
              key={step.label}
              className={`stepper-item ${state}`}
              aria-current={state === "current" ? "step" : undefined}
            >
              <div className={`stepper-circle ${state}`}>
                {state === "completed" ? (
                  // Checkmark
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <polyline
                      points="2,6 5,9 10,3"
                      stroke="white"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              {showLabels && (
                <span className={`stepper-label ${state}`}>{step.label}</span>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}