import { cn } from "@/lib/utils";
import type { LatchState, ThinkingStep } from "@/latch/types";

export type ThinkingStepsProps = {
  steps: ThinkingStep[];
  state?: LatchState;
  className?: string;
};

export function ThinkingSteps({ steps, state = "idle", className }: ThinkingStepsProps) {
  return (
    <p
      data-slot="thinking-steps"
      data-state={state}
      aria-live="polite"
      className={cn("text-[13px] leading-5 text-muted", className)}
    >
      {steps.map((step, index) => {
        const current = step.status === "current" || (state === "loading" && index === steps.length - 1 && !step.status);
        const failed = step.status === "error" || (state === "error" && index === steps.length - 1);
        return (
          <span key={step.id}>
            {index > 0 ? (
              <span aria-hidden="true" className="text-faint">
                {" → "}
              </span>
            ) : null}
            <span
              className={cn(
                current && "latch-current text-ink",
                failed && "text-danger",
                step.status === "done" && "text-muted",
              )}
            >
              {step.label}
            </span>
          </span>
        );
      })}
    </p>
  );
}
