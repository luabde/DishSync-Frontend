import { useClientReservation } from "../../../hooks/clientReservation.hook";

type StepShiftHoursProps = {
  submitAttempted: boolean;
  onConfirmShiftHour: () => void;
};

export default function StepShiftHours({ submitAttempted, onConfirmShiftHour }: StepShiftHoursProps) {
  const {
    horarisTorns,
    selectedShiftName,
    setSelectedShiftName,
    selectedShiftHour,
    setSelectedShiftHour,
  } = useClientReservation();

  const entries = Object.entries(horarisTorns);
  const hasData = entries.length > 0;
  const hasError = submitAttempted && (!selectedShiftName || !selectedShiftHour);

  return (
    <section className="mx-auto w-full max-w-2xl">
      <header className="mb-8 text-center">
        <h2 className="font-ds-display text-5xl font-bold text-ds-brand-wine">¿A qué hora vendrás?</h2>
        <p className="mt-2 text-sm text-ds-fg-secondary">Selecciona un turno y una hora disponible.</p>
      </header>

      {!hasData ? (
        <div className="rounded-ds-table border border-ds-border-default bg-ds-surface p-8 text-center">
          <p className="text-sm text-ds-fg-secondary">No hay turnos disponibles para este restaurante.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map(([turnName, hours]) => (
            <article key={turnName} className="rounded-ds-table border border-ds-border-default bg-ds-surface p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ds-brand-copper">{turnName}</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {hours.map((hour) => {
                  const isSelected = selectedShiftName === turnName && selectedShiftHour === hour;
                  return (
                    <button
                      key={`${turnName}-${hour}`}
                      type="button"
                      onClick={() => {
                        setSelectedShiftName(turnName);
                        setSelectedShiftHour(hour);
                      }}
                      className={`rounded-ds-md border px-4 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? "border-ds-brand-wine bg-ds-brand-wine text-ds-fg-on-brand"
                          : "border-ds-input-border text-ds-brand-wine hover:border-ds-brand-wine/60 hover:bg-ds-brand-wine/5"
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
        <p className="mt-8 text-center text-sm font-medium text-red-700">Debes seleccionar turno y hora para continuar.</p>
      ) : null}

      <div className="mt-10 flex justify-center pb-4">
        <button
          type="button"
          onClick={onConfirmShiftHour}
          disabled={!hasData || !selectedShiftName || !selectedShiftHour}
          className="w-full max-w-xs rounded-ds-md border-2 border-ds-brand-wine bg-transparent py-4 text-sm font-bold uppercase tracking-[0.16em] text-ds-brand-wine transition hover:bg-ds-brand-wine hover:text-ds-fg-on-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirmar horario
        </button>
      </div>
    </section>
  );
}
