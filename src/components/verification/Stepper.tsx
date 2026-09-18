import { PROGRESS_STEPS } from "../../types/verification";
import { CheckIcon } from "../ui/icons";

interface StepperProps {
  /** Index of the active step. Steps before it render as complete. */
  activeIndex: number;
  /** When true, the flow failed — no step renders as active/pulsing. */
  failed?: boolean;
}

/**
 * Vertical progress stepper reflecting the KLAIM verification lifecycle,
 * mapped to friendly, user-facing stages.
 */
export function Stepper({ activeIndex, failed = false }: StepperProps) {
  return (
    <div className="stepper" role="list">
      {PROGRESS_STEPS.map((step, i) => {
        const done = i < activeIndex;
        const active = !failed && i === activeIndex;
        const state = done ? "done" : active ? "active" : "idle";

        return (
          <div className={`step step--${state}`} role="listitem" key={step.key}>
            <span className="step__marker">
              <span className="step__dot">
                {done ? (
                  <CheckIcon size={12} />
                ) : active ? (
                  <span className="step__pulse" />
                ) : null}
              </span>
              <span className="step__line" />
            </span>
            <span className="step__label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
