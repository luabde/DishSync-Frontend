import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ReservationStepper from "../../components/client/reservationForm/ReservationStepper";
import StepCalendar from "../../components/client/reservationForm/StepCalendar";
import StepShiftHours from "../../components/client/reservationForm/StepShiftHours";
import StepTableSelection from "../../components/client/reservationForm/StepTableSelection";
import StepReservationSummary from "../../components/client/reservationForm/StepReservationSummary";
import StepReservationPendingConfirmation from "../../components/client/reservationForm/StepReservationPendingConfirmation";
import { useClientReservation } from "../../hooks/clientReservation.hook";
import "./style.css";

const TOTAL_STEPS = 4;

function ClientReservationContent() {
  const {
    step,
    setStep,
    selectedDate,
    selectedRestaurantName,
    getHorarisTorns,
    selectedShiftId,
    selectedShiftHour,
    getReservationZones,
    setActiveZoneId,
    getTaulesDisponibles,
    selectedTableId,
  } = useClientReservation();

  const [step1SubmitAttempted, setStep1SubmitAttempted] = React.useState(false);
  const [step2SubmitAttempted, setStep2SubmitAttempted] = React.useState(false);
  const [step3SubmitAttempted, setStep3SubmitAttempted] = React.useState(false);
  const [showPendingConfirmation, setShowPendingConfirmation] = React.useState(false);

  const stepCopy = (() => {
    if (showPendingConfirmation) {
      return "T'hem enviat un enllaç de confirmació al teu correu. Revisa la teva bústia d'entrada (i correu brossa).";
    }

    switch (step) {
      case 1:
        return "Selecciona el dia de la teva reserva per veure els horaris disponibles.";
      case 2:
        return "Tria el teu torn i selecciona una hora disponible.";
      case 3:
        return "Escull una zona i selecciona una taula disponible.";
      case 4:
        return "Completa les teves dades i envia la sol·licitud de reserva.";
      default:
        return "";
    }
  })();

  const handleConfirmDate = async () => {
    setStep1SubmitAttempted(true);
    if (!selectedDate) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
    await getHorarisTorns();
  };

  const handleConfirmShiftHour = async () => {
    setStep2SubmitAttempted(true);
    if (!selectedShiftId || !selectedShiftHour) return;
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

  // Step 4: reserva creada correctamente -> mostramos aviso de confirmación por correo (step 5).
  const handleReservationCreated = () => {
    setShowPendingConfirmation(true);
  };

  return (
    <div className="client-home-wrapper font-body antialiased">
      <div className="mx-auto w-full max-w-4xl px-6 pb-10 pt-8 sm:pt-10">
        <nav className="mb-12 flex items-center justify-center gap-2 text-xs font-medium text-brand-gray/40 uppercase tracking-widest">
          <Link to="/" className="hover:text-brand-primary transition-colors">
            Inici
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-brand-primary/60">Reserva</span>
        </nav>

        <header className="mb-8 md:mb-12 text-center">
          <h1 className="text-center font-ds-display text-xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-2xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Reserva la teva taula
          </h1>
          {stepCopy ? (
            <p className="mx-auto mt-2 max-w-[699px] px-2 text-center font-ds-sans text-xs font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
              {stepCopy}
            </p>
          ) : null}
          <p className="mt-6 md:mt-10 font-ds-display text-lg font-bold uppercase tracking-[0.06em] text-ds-brand-copper sm:text-2xl lg:text-4xl">
            {selectedRestaurantName || "Restaurant seleccionat"}
          </p>
        </header>

        <section className="bg-white rounded-ds-table shadow-2xl shadow-brand-primary/10 p-5 sm:p-10 md:p-14 transition-all duration-700">
          {!showPendingConfirmation ? (
            <ReservationStepper
              step={step}
              totalSteps={TOTAL_STEPS}
              onBack={() => step > 1 && setStep(step - 1)}
              onGoToStep={(targetStep) => setStep(targetStep)}
            />
          ) : null}

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
          ) : step === 4 ? (
            showPendingConfirmation ? (
              <StepReservationPendingConfirmation />
            ) : (
              <StepReservationSummary onReservationCreated={handleReservationCreated} />
            )
          ) : (
            <section className="rounded-ds-table border border-ds-border-default bg-ds-surface p-8 text-center">
              <p className="text-sm text-ds-fg-secondary">Proper pas en construcció.</p>
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
