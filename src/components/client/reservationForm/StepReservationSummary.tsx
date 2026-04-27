import React from "react";
import { useClientReservation } from "../../../hooks/clientReservation.hook";
import { restaurantApi } from "../../../api/restaurant.api";

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

export default function StepReservationSummary() {
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
  const [requestSuccess, setRequestSuccess] = React.useState("");

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
    setRequestSuccess("");
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
      setRequestSuccess("Reserva creada correctamente. Revisa tu correo para confirmarla.");
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "No se pudo crear la reserva.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[760px]">
      <article className="mx-auto w-full max-w-[640px] rounded-ds-table bg-ds-surface p-10">
        <h3 className="mb-6 text-center font-ds-display text-[30px] font-bold text-ds-brand-wine">
          Resumen de tu reserva
        </h3>

        <img
          src={SUMMARY_HERO_IMAGE}
          alt="Comedor del restaurante"
          className="h-[200px] w-full rounded-t-[50px] rounded-b-[6px] object-cover"
        />

        <div className="mt-4">
          <SummaryRow label="Restaurante" value={selectedRestaurantName || "-"} />
          <SummaryRow label="Fecha" value={formattedDate} />
          <SummaryRow label="Hora" value={selectedShiftHour || "-"} />
          <SummaryRow label="Personas" value={peopleLabel} />
          <SummaryRow label="Mesa" value={tableLabel} />
        </div>

        <div className="mt-8">
          <p className="mb-5 text-center text-sm italic text-black/60">
            Introduce tus datos para confirmar la solicitud
          </p>

          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Introduce tu nombre"
            className={`h-[50px] w-full border-b bg-transparent text-base text-black placeholder:text-black/60 focus:outline-none ${
              showNameError ? "border-red-500" : "border-black/10"
            }`}
          />
          {showNameError ? (
            <p className="mt-2 text-xs font-medium text-red-700">El nombre es obligatorio.</p>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-6">
            <div>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Telefono"
                className={`h-[50px] w-full border-b bg-transparent text-base text-black placeholder:text-black/60 focus:outline-none ${
                  showPhoneError ? "border-red-500" : "border-black/10"
                }`}
              />
              {showPhoneError ? (
                <p className="mt-2 text-xs font-medium text-red-700">
                  Introduce un telefono valido (minimo 9 digitos).
                </p>
              ) : null}
            </div>
            <div>
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Correo electronico"
                className={`h-[50px] w-full border-b bg-transparent text-base text-black placeholder:text-black/60 focus:outline-none ${
                  showEmailError ? "border-red-500" : "border-black/10"
                }`}
              />
              {showEmailError ? (
                <p className="mt-2 text-xs font-medium text-red-700">
                  Introduce un correo electronico valido.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirmReservation}
          disabled={isSubmitting}
          className="mt-8 h-[67px] w-full rounded-[4px] border-2 border-ds-brand-wine bg-transparent text-sm font-bold uppercase tracking-[0.2em] text-ds-brand-wine transition hover:bg-ds-brand-wine hover:text-ds-fg-on-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Creando reserva..." : "Confirmar reserva"}
        </button>
        {requestError ? <p className="mt-3 text-center text-sm text-red-700">{requestError}</p> : null}
        {requestSuccess ? <p className="mt-3 text-center text-sm text-green-700">{requestSuccess}</p> : null}

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
      </article>
    </section>
  );
}
