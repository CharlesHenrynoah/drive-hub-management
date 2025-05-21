
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingStepsProps {
  currentStep: number;
  steps: string[];
}

export function BookingSteps({ currentStep, steps }: BookingStepsProps) {
  return (
    <div className="flex justify-center mb-8">
      <ol className="flex items-center w-full max-w-3xl">
        {steps.map((step, index) => (
          <li key={index} className={cn(
            "flex items-center",
            index < steps.length - 1 ? "w-full" : "",
          )}>
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border",
              index < currentStep
                ? "bg-hermes-green border-hermes-green text-white" 
                : index === currentStep
                  ? "border-hermes-green text-hermes-green"
                  : "border-gray-300 text-gray-400"
            )}>
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className={cn(
              "ml-2 text-sm",
              index === currentStep ? "font-medium" : "text-gray-500"
            )}>
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2", 
                index < currentStep ? "bg-hermes-green" : "bg-gray-300"
              )}></div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
