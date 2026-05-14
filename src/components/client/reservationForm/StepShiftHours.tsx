import { useClientReservation } from "../../../hooks/clientReservation.hook";

type StepShiftHoursProps = {
  submitAttempted: boolean;
  onConfirmShiftHour: () => void;
};

export default function StepShiftHours({ submitAttempted, onConfirmShiftHour }: StepShiftHoursProps) {
  const {
    horarisTorns,
    setSelectedShiftName,
    selectedShiftId,
    setSelectedShiftId,
    selectedShiftHour,
    setSelectedShiftHour,
  } = useClientReservation();

  const hasData = horarisTorns.length > 0;
  const hasError = submitAttempted && (!selectedShiftId || !selectedShiftHour);

  return (
    <section className="mx-auto w-full max-w-2xl">
      {!hasData ? (
        <div className="rounded-ds-table border border-ds-border-default bg-ds-surface p-8 text-center">
          <p className="text-sm text-ds-fg-secondary">No hi ha torns disponibles per a aquest restaurant.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {horarisTorns.map((turn) => (
            <article key={turn.id} className="rounded-2xl border border-black/5 bg-[#F5F5F5]/60 p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-ds-brand-copper/70">
                {turn.nom}
              </h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {turn.hores.map((hour) => {
                  const isSelected = selectedShiftId === turn.id && selectedShiftHour === hour;
                  return (
                    <button
                      key={`${turn.id}-${hour}`}
                      type="button"
                      onClick={() => {
                        setSelectedShiftName(turn.nom);
                        setSelectedShiftId(turn.id);
                        setSelectedShiftHour(hour);
                      }}
                      className={`rounded-xl border px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold transition ${
                        isSelected
                          ? "border-ds-brand-wine bg-ds-brand-wine text-ds-fg-on-brand"
                          : "border-black/10 bg-white text-ds-brand-wine hover:border-ds-brand-wine/40 hover:bg-white"
                      }`}
                    >
                      {hour}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}

      {hasError ? (
        <p className="mt-8 text-center text-sm font-medium text-red-700">Heu de seleccionar torn i hora per continuar.</p>
      ) : null}

      <div className="mt-10 flex justify-center pb-4">
        <button
          type="button"
          onClick={onConfirmShiftHour}
          disabled={!hasData || !selectedShiftId || !selectedShiftHour}
          className="w-full rounded-ds-sm border-2 border-ds-brand-wine bg-transparent py-3 sm:py-4 font-ds-sans text-sm font-bold uppercase tracking-[1.5px] text-ds-brand-wine transition-all duration-300 hover:bg-ds-brand-wine hover:text-white hover:shadow-ds-btn active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </section>
  );
}
