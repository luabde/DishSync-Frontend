import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ReservationStepper from "../../components/client/reservationForm/ReservationStepper";
import StepCalendar from "../../components/client/reservationForm/StepCalendar";
import StepShiftHours from "../../components/client/reservationForm/StepShiftHours";
import StepTableSelection from "../../components/client/reservationForm/StepTableSelection";
import { useClientReservation } from "../../hooks/clientReservation.hook";

const TOTAL_STEPS = 4;

function ClientReservationContent() {
  const {
    step,
    setStep,
    selectedDate,
    selectedRestaurantName,
    getHorarisTorns,
    selectedShiftName,
    selectedShiftHour,
    getReservationZones,
    setActiveZoneId,
    getTaulesDisponibles,
    selectedTableId,
  } = useClientReservation();

  const [step1SubmitAttempted, setStep1SubmitAttempted] = React.useState(false);
  const [step2SubmitAttempted, setStep2SubmitAttempted] = React.useState(false);
  const [step3SubmitAttempted, setStep3SubmitAttempted] = React.useState(false);

  const handleConfirmDate = async () => {
    setStep1SubmitAttempted(true);
    if (!selectedDate) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
    await getHorarisTorns();
  };

  const handleConfirmShiftHour = async () => {
    setStep2SubmitAttempted(true);
    if (!selectedShiftName || !selectedShiftHour) return;
    // Cargamos zonas y mesas antes de mostrar el Step 3 para que no haya parpadeo.
    const loadedZones = await getReservationZones();
    const firstZoneId = loadedZones[0]?.id ?? null;
    setActiveZoneId(firstZoneId);
    await getTaulesDisponibles(firstZoneId);
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  // Step 3: Cambio de zona
  const handleZoneChange = async (zoneId: number) => {
    setActiveZoneId(zoneId);
    // Pasamos el zoneId directamente para evitar leer el estado stale de activeZoneId.
    await getTaulesDisponibles(zoneId);
  };

  // Step 3: Confirmación de la elección de mesa para pasar al step 4
  const handleConfirmTable = () => {
    setStep3SubmitAttempted(true);
    if (!selectedTableId) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-ds-bg-page text-ds-fg-default">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <nav className="mb-8 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-ds-fg-secondary">
          <Link to="/" className="transition hover:text-ds-brand-wine">
            Inicio
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-ds-brand-wine">Reserva</span>
        </nav>

        <header className="mb-10 text-center">
          <h1 className="font-ds-display text-5xl font-black uppercase tracking-[-0.02em] text-ds-brand-wine">
            Reserva tu mesa
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ds-fg-secondary">
            Asegure su mesa en El Castell.
          </p>
          <p className="mt-8 font-ds-display text-2xl font-bold uppercase tracking-[0.04em] text-ds-brand-copper">
            {selectedRestaurantName || "Restaurante seleccionado"}
          </p>
        </header>

        <section className="rounded-ds-table bg-ds-bg-elevated p-6 shadow-ds-table md:p-10">
          <ReservationStepper
            step={step}
            totalSteps={TOTAL_STEPS}
            onBack={() => step > 1 && setStep(step - 1)}
            onGoToStep={(targetStep) => setStep(targetStep)}
          />

          {step === 1 ? (
            <StepCalendar submitAttempted={step1SubmitAttempted} onConfirmDate={handleConfirmDate} />
          ) : step === 2 ? (
            <StepShiftHours
              submitAttempted={step2SubmitAttempted}
              onConfirmShiftHour={handleConfirmShiftHour}
            />
          ) : step === 3 ? (
            <StepTableSelection
              submitAttempted={step3SubmitAttempted}
              onConfirmTable={handleConfirmTable}
              onZoneChange={handleZoneChange}
            />
          ) : (
            <section className="rounded-ds-table border border-ds-border-default bg-ds-surface p-8 text-center">
              <p className="text-sm text-ds-fg-secondary">Próximo paso en construcción.</p>
            </section>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ClientReservation() {
  return <ClientReservationContent />;
}
