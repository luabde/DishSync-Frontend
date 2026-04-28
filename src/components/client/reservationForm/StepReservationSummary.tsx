import React from "react";
import { useClientReservation } from "../../../hooks/clientReservation.hook";
import { restaurantApi } from "../../../api/restaurant.api";
import FormField from "../../common/FormField";
import { FormTitle } from "../../common/FormTitle";

const SUMMARY_HERO_IMAGE =
  "https://www.figma.com/api/mcp/asset/419cd01d-04f4-4664-ada5-0631afa0fdd1";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 py-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
        {label}
      </span>
      <span className="text-[17px] font-bold tracking-[0.02em] text-ds-brand-wine">
        {value}
      </span>
    </div>
  );
}

type StepReservationSummaryProps = {
  onReservationCreated: () => void;
};

export default function StepReservationSummary({ onReservationCreated }: StepReservationSummaryProps) {
  const {
    selectedRestaurantName,
    selectedRestaurantId,
    selectedDate,
    selectedShiftId,
    selectedShiftHour,
    selectedTableId,
    selectedNumPeople,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerEmail,
    setCustomerEmail,
  } = useClientReservation();

  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [requestError, setRequestError] = React.useState("");

  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
      }).format(new Date(`${selectedDate}T00:00:00`))
    : "-";

  const tableLabel = selectedTableId ? `Mesa ${selectedTableId}` : "-";
  const peopleLabel = selectedNumPeople ? `${selectedNumPeople} PERSONAS` : "-";

  const isNameValid = customerName.trim().length > 0;
  // Acepta + prefijo opcional y entre 9 y 15 digitos (ignorando espacios/guiones).
  const isPhoneValid = /^\+?[0-9\s-]{9,20}$/.test(customerPhone.trim()) && customerPhone.replace(/\D/g, "").length >= 9;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());

  const showNameError = submitAttempted && !isNameValid;
  const showPhoneError = submitAttempted && !isPhoneValid;
  const showEmailError = submitAttempted && !isEmailValid;

  const handleConfirmReservation = async () => {
    setSubmitAttempted(true);
    setRequestError("");
    if (!isNameValid || !isPhoneValid || !isEmailValid) return;
    if (
      !selectedRestaurantId ||
      !selectedDate ||
      !selectedShiftId ||
      !selectedShiftHour ||
      !selectedTableId ||
      !selectedNumPeople
    ) {
      setRequestError("Faltan datos de la reserva. Vuelve a los pasos anteriores y revisa.");
      return;
    }

    const trimmedName = customerName.trim();
    const [nom, ...cognomsParts] = trimmedName.split(/\s+/);
    const cognoms = cognomsParts.join(" ");

    try {
      setIsSubmitting(true);
      await restaurantApi.createReservation({
        restaurantId: selectedRestaurantId,
        nom: nom || trimmedName,
        cognoms,
        email: customerEmail.trim().toLowerCase(),
        telefon: customerPhone.trim(),
        id_taula_restaurant: selectedTableId,
        id_torn: selectedShiftId,
        data: selectedDate,
        hora: selectedShiftHour,
        num_persones: selectedNumPeople,
      });
      onReservationCreated();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "No se pudo crear la reserva.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[801px]">
      <article className="mx-auto w-full rounded-ds-md bg-ds-bg-elevated p-5 shadow-ds-table sm:p-8 lg:p-10">
        <div className="mx-auto w-full max-w-[731px]">
          <FormTitle description="Revisa los datos y completa tu información para confirmar la solicitud.">
            Resumen de tu reserva
          </FormTitle>

          <div className="rounded-2xl bg-[#F5F5F5]/60 p-6">
          <SummaryRow label="Restaurante" value={selectedRestaurantName || "-"} />
          <SummaryRow label="Fecha" value={formattedDate} />
          <SummaryRow label="Hora" value={selectedShiftHour || "-"} />
          <SummaryRow label="Personas" value={peopleLabel} />
          <SummaryRow label="Mesa" value={tableLabel} />
          </div>

          <div className="mt-10 space-y-6">
            <FormField
              label="Nombre y apellidos"
              name="reservationName"
              value={customerName}
              onChange={(e) => setCustomerName(e.currentTarget.value)}
              placeholder="Introduce tu nombre"
              inputClassName="focus:ring-brand-accent2/20"
              error={showNameError ? "El nombre es obligatorio." : undefined}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                label="Teléfono"
                name="reservationPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.currentTarget.value)}
                placeholder="+34 600 000 000"
                inputClassName="focus:ring-brand-accent2/20"
                error={showPhoneError ? "Introduce un teléfono válido (mínimo 9 dígitos)." : undefined}
              />
              <FormField
                label="Correo electrónico"
                name="reservationEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.currentTarget.value)}
                placeholder="tu@email.com"
                inputClassName="focus:ring-brand-accent2/20"
                error={showEmailError ? "Introduce un correo electrónico válido." : undefined}
              />
            </div>
          </div>

        <button
          type="button"
          onClick={handleConfirmReservation}
          disabled={isSubmitting}
          className="mt-10 w-full rounded-ds-sm border-2 border-ds-brand-wine bg-transparent py-4 font-ds-sans text-sm font-bold uppercase tracking-[1.5px] text-ds-brand-wine transition-all duration-300 hover:bg-ds-brand-wine hover:text-white hover:shadow-ds-btn active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Creando reserva..." : "Confirmar reserva"}
        </button>
        {requestError ? <p className="mt-3 text-center text-sm text-red-700">{requestError}</p> : null}

        <div className="mt-5 text-center text-xs text-black/55">
          <p>
            Politica de cancelacion: Cancelacion gratuita hasta 24h antes. Para
            reservas de mas de 4 personas, por favor{" "}
            <button
              type="button"
              className="border-b border-ds-brand-wine/40 font-extrabold italic text-ds-brand-wine"
            >
              contacte con nosotros
            </button>
            .
          </p>
          <p className="mt-4 text-[11px] text-black/40">
            Se enviara una confirmacion automatica a tu correo electronico.
          </p>
        </div>
        </div>
      </article>
    </section>
  );
}
