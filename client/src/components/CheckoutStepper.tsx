import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckoutStep = "checkout" | "payment" | "confirmation";

interface Step {
  id: CheckoutStep;
  label: string;
  number: number;
}

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
  labels?: { checkout: string; payment: string; confirmation: string };
}

const DEFAULT_LABELS = {
  checkout: "Checkout",
  payment: "Payment",
  confirmation: "Confirmation",
};

export default function CheckoutStepper({ currentStep, labels }: CheckoutStepperProps) {
  const l = { ...DEFAULT_LABELS, ...labels };

  const steps: Step[] = [
    { id: "checkout", label: l.checkout, number: 1 },
    { id: "payment", label: l.payment, number: 2 },
    { id: "confirmation", label: l.confirmation, number: 3 },
  ];

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200",
                  isDone && "bg-primary text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  isUpcoming && "bg-muted text-muted-foreground border-2 border-border"
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isActive && "text-primary",
                  isDone && "text-primary",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-16 sm:w-24 mx-2 mb-5 transition-colors duration-200",
                  index < currentIndex ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
