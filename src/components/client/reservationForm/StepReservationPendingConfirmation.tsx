import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useClientReservation } from "../../../hooks/clientReservation.hook";

export default function StepReservationPendingConfirmation() {
  const { customerEmail } = useClientReservation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      navigate("/");
    }, 2 * 60 * 1000);

    return () => window.clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <section className="mx-auto w-full max-w-[801px]">
      <article className="mx-auto w-full rounded-ds-md bg-ds-bg-elevated p-5 text-center shadow-ds-table sm:p-8 lg:p-10">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-ds-brand-olive/10 text-ds-brand-olive">
          <MailCheck className="size-8" />
        </div>

        <h3 className="font-ds-display text-2xl font-black uppercase tracking-tight text-ds-brand-wine sm:text-3xl">
          Revisa el teu correu
        </h3>

        <p className="mx-auto mt-4 max-w-[520px] text-sm text-ds-fg-secondary">
          Hem rebut la teva sol·licitud. T'hem enviat un enllaç de confirmació a{" "}
          <span className="font-semibold text-ds-brand-wine">{customerEmail || "el teu correu"}</span>.
        </p>

        <p className="mx-auto mt-3 max-w-[520px] text-sm text-ds-fg-secondary">
          La reserva quedarà confirmada quan cliquis l'enllaç de l'email.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center rounded-ds-sm border-2 border-ds-brand-wine bg-transparent px-8 py-4 font-ds-sans text-sm font-bold uppercase tracking-[1.5px] text-ds-brand-wine transition-all duration-300 hover:bg-ds-brand-wine hover:text-white hover:shadow-ds-btn active:scale-[0.98]"
          >
            Tornar a l'inici
          </Link>
        </div>
      </article>
    </section>
  );
}
