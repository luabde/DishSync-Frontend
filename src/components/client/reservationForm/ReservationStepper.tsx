type ReservationStepperProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onGoToStep: (targetStep: number) => void;
};

export default function ReservationStepper({ step, totalSteps, onBack, onGoToStep }: ReservationStepperProps) {
  return (
    <div className="mb-16 flex items-center justify-between px-4">
      <button
        type="button"
        onClick={onBack}
        className={`p-4 -ml-4 rounded-full transition-all active:scale-90 ${
          step === 1 ? "opacity-0 pointer-events-none" : "text-ds-brand-wine hover:bg-ds-brand-wine/5"
        }`}
        aria-label="Volver al paso anterior"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex gap-4 flex-1 max-w-xl px-12">
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
              aria-label={`Ir al paso ${stepNumber}`}
              className={`h-2.5 flex-1 rounded-full transition-all duration-700 ${
                isActive
                  ? "bg-[#4A1A12] w-full shadow-lg shadow-ds-brand-wine/20"
                  : isCompleted
                  ? "bg-[#4A1A12] opacity-20 hover:opacity-40 cursor-pointer"
                  : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          );
        })}
      </div>

      <span className="text-[10px] font-black tracking-[0.2em] text-ds-fg-secondary/50 whitespace-nowrap">
        STEP 0{step}
      </span>
    </div>
  );
}
