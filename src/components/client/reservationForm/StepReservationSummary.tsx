import React from "react";
import { useClientReservation } from "../../../hooks/clientReservation.hook";
import { restaurantApi } from "../../../api/restaurant.api";

const SUMMARY_HERO_IMAGE =
  "https://www.figma.com/api/mcp/asset/419cd01d-04f4-4664-ada5-0631afa0fdd1";

/** Correu de contacte (Restaurant El Castell) per a reserves de més de 4 persones. */
const CASTELL_CONTACT_EMAIL = "reserves@elcastell.com";
const CASTELL_CONTACT_SUBJECT = "Consulta reserva (més de 4 persones)";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-black/5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/40 sm:text-[11px] sm:tracking-[0.16em]">
        {label}
      </span>
      <span className="break-words text-sm font-bold tracking-[0.02em] text-ds-brand-wine sm:text-right sm:text-[17px]">
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
    selectedRestaurantImageUrl,
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
    ? new Intl.DateTimeFormat("ca-ES", {
        day: "2-digit",
        month: "short",
      }).format(new Date(`${selectedDate}T00:00:00`))
    : "-";

  const tableLabel = selectedTableId ? `Taula ${selectedTableId}` : "-";
  const peopleLabel = selectedNumPeople ? `${selectedNumPeople} PERSONES` : "-";

  const contactBody = `Hola,\n\nM'agradaria fer una consulta sobre una reserva de més de 4 persones.\n\nRestaurant: ${selectedRestaurantName || "-"}\nData: ${formattedDate}\nHora: ${selectedShiftHour || "-"}\nPersones: ${selectedNumPeople ?? "-"}\n\nGràcies.`;
  const contactGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CASTELL_CONTACT_EMAIL)}&su=${encodeURIComponent(CASTELL_CONTACT_SUBJECT)}&body=${encodeURIComponent(contactBody)}`;

  const handleContactUs = () => {
    window.open(contactGmailUrl, "_blank", "noopener,noreferrer");
  };

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
      setRequestError("Falten dades de la reserva. Torneu als passos anteriors i reviseu-les.");
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
      setRequestError(error instanceof Error ? error.message : "No s'ha pogut crear la reserva.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl">
      <article className="mx-auto w-full rounded-ds-table bg-ds-surface p-5 sm:p-8 md:p-10">
        <h3 className="mb-4 text-center font-ds-display text-xl font-bold text-ds-brand-wine sm:mb-6 sm:text-2xl md:text-[30px]">
          Resum de la teva reserva
        </h3>

        <img
          src={selectedRestaurantImageUrl || SUMMARY_HERO_IMAGE}
          alt="Menjador del restaurant"
          className="h-[140px] w-full rounded-t-[28px] rounded-b-[6px] object-cover sm:h-[180px] sm:rounded-t-[40px] md:h-[200px] md:rounded-t-[50px]"
        />

        <div className="mt-3 sm:mt-4">
          <SummaryRow label="Restaurant" value={selectedRestaurantName || "-"} />
          <SummaryRow label="Data" value={formattedDate} />
          <SummaryRow label="Hora" value={selectedShiftHour || "-"} />
          <SummaryRow label="Persones" value={peopleLabel} />
          <SummaryRow label="Taula" value={tableLabel} />
        </div>

        <div className="mt-6 sm:mt-8">
          <p className="mb-4 text-center text-xs italic text-black/60 sm:mb-5 sm:text-sm">
            Introduïu les vostres dades per confirmar la sol·licitud
          </p>

          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Introduïu el vostre nom"
            className={`h-11 w-full border-b bg-transparent text-sm text-black placeholder:text-black/60 focus:outline-none sm:h-[50px] sm:text-base ${
              showNameError ? "border-red-500" : "border-black/10"
            }`}
          />
          {showNameError ? (
            <p className="mt-2 text-xs font-medium text-red-700">El nom és obligatori.</p>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:grid-cols-2 sm:gap-6">
            <div>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Telèfon"
                className={`h-11 w-full border-b bg-transparent text-sm text-black placeholder:text-black/60 focus:outline-none sm:h-[50px] sm:text-base ${
                  showPhoneError ? "border-red-500" : "border-black/10"
                }`}
              />
              {showPhoneError ? (
                <p className="mt-2 text-xs font-medium text-red-700">
                  Introduïu un telèfon vàlid (mínim 9 dígits).
                </p>
              ) : null}
            </div>
            <div>
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Correu electrònic"
                className={`h-11 w-full border-b bg-transparent text-sm text-black placeholder:text-black/60 focus:outline-none sm:h-[50px] sm:text-base ${
                  showEmailError ? "border-red-500" : "border-black/10"
                }`}
              />
              {showEmailError ? (
                <p className="mt-2 text-xs font-medium text-red-700">
                  Introduïu un correu electrònic vàlid.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirmReservation}
          disabled={isSubmitting}
          className="mt-6 w-full rounded-ds-sm border-2 border-ds-brand-wine bg-transparent py-3 font-ds-sans text-xs font-bold uppercase tracking-[0.16em] text-ds-brand-wine transition-all duration-300 hover:bg-ds-brand-wine hover:text-ds-fg-on-brand hover:shadow-ds-btn active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-8 sm:py-4 sm:text-sm sm:tracking-[0.2em]"
        >
          {isSubmitting ? "Creant reserva..." : "Confirmar reserva"}
        </button>
        {requestError ? <p className="mt-3 text-center text-sm text-red-700">{requestError}</p> : null}

        <div className="mt-4 text-center text-[11px] leading-relaxed text-black/55 sm:mt-5 sm:text-xs">
          <p>
            Política de cancel·lació: Cancel·lació gratuïta fins a 24h abans. Per a
            reserves de més de 4 persones, si us plau{" "}
            <button
              type="button"
              onClick={handleContactUs}
              className="border-none bg-transparent p-0 font-extrabold italic text-ds-brand-wine underline-offset-2 transition-colors hover:text-ds-brand-wine/90 cursor-pointer"
              title="Obrir correu per contactar amb el restaurant"
              aria-label={`Enviar correu a ${CASTELL_CONTACT_EMAIL}`}
            >
              contacteu amb nosaltres
            </button>
            .
          </p>
          <p className="mt-4 text-[11px] text-black/40">
            S'enviarà una confirmació automàtica al vostre correu electrònic.
          </p>
        </div>
      </article>
    </section>
  );
}
