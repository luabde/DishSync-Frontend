type ReservationStepperProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onGoToStep: (targetStep: number) => void;
};

export default function ReservationStepper({ step, totalSteps, onBack, onGoToStep }: ReservationStepperProps) {
  return (
    <div className="mb-14 flex items-center justify-between gap-4 px-2">
      <button
        type="button"
        onClick={onBack}
        className="p-4 -ml-4 rounded-full text-ds-brand-wine transition-all active:scale-90 hover:bg-ds-brand-wine/5"
        aria-label="Volver al paso anterior"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex max-w-xl flex-1 gap-4 px-8">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === step;
          const isCompleted = stepNumber < step;

          return (
            <button
              key={stepNumber}
              type="button"
              onClick={() => isCompleted && onGoToStep(stepNumber)}
              aria-label={`Ir al paso ${stepNumber}`}
              className={`h-2.5 flex-1 rounded-full transition-all duration-700 ${
                isActive
                  ? "bg-ds-brand-wine shadow-lg shadow-ds-brand-wine/20"
                  : isCompleted
                  ? "cursor-pointer bg-ds-brand-wine/20 hover:bg-ds-brand-wine/35"
                  : "cursor-not-allowed bg-gray-100"
              }`}
              disabled={!isCompleted}
            />
          );
        })}
      </div>

      <span className="whitespace-nowrap text-xs font-bold text-ds-fg-secondary">
        Pas {step}/{totalSteps}
      </span>
    </div>
  );
}
