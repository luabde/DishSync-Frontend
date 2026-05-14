type ReservationStepperProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onGoToStep: (targetStep: number) => void;
};

export default function ReservationStepper({ step, totalSteps, onBack, onGoToStep }: ReservationStepperProps) {
  return (
    <div className="mb-8 sm:mb-16 flex items-center justify-between px-0 sm:px-4">
      <button
        type="button"
        onClick={onBack}
        className={`p-2 sm:p-4 -ml-2 sm:-ml-4 rounded-full transition-all active:scale-90 ${
          step === 1 ? "opacity-0 pointer-events-none" : "text-ds-brand-wine hover:bg-ds-brand-wine/5"
        }`}
        aria-label="Tornar al pas anterior"
      >
        <svg className="h-5 w-5 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex gap-2 sm:gap-4 flex-1 max-w-xl px-4 sm:px-12">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === step;
          const isCompleted = stepNumber < step;

          return (
            <button
              key={stepNumber}
              type="button"
              onClick={() => (isCompleted ? onGoToStep(stepNumber) : undefined)}
              disabled={!isCompleted}
              aria-label={`Anar al pas ${stepNumber}`}
              className={`h-1.5 sm:h-2.5 flex-1 rounded-full transition-all duration-700 ${
                isActive
                  ? "bg-[#4A1A12] w-full"
                  : isCompleted
                  ? "bg-[#4A1A12] opacity-20 hover:opacity-40 cursor-pointer"
                  : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          );
        })}
      </div>

      <span className="text-[9px] sm:text-[10px] font-black tracking-[0.1em] sm:tracking-[0.2em] text-ds-fg-secondary/50 whitespace-nowrap ml-2">
        PAS 0{step}
      </span>
    </div>
  );
}
