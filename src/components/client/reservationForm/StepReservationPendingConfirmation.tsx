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
    <section className="mx-auto w-full max-w-[760px]">
      <article className="mx-auto w-full max-w-[640px] rounded-ds-table bg-ds-surface p-10 text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-ds-brand-olive/10 text-ds-brand-olive">
          <MailCheck className="size-8" />
        </div>

        <h3 className="font-ds-display text-[30px] font-bold text-ds-brand-wine">
          Revisa tu correo
        </h3>

        <p className="mx-auto mt-4 max-w-[520px] text-sm text-ds-fg-secondary">
          Hemos recibido tu solicitud de reserva. Te enviamos un enlace de confirmacion a{" "}
          <span className="font-semibold text-ds-brand-wine">{customerEmail || "tu correo"}</span>.
        </p>

        <p className="mx-auto mt-3 max-w-[520px] text-sm text-ds-fg-secondary">
          La reserva quedara confirmada cuando pulses el enlace del email.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="inline-flex h-[56px] items-center rounded-[4px] border-2 border-ds-brand-wine px-8 text-sm font-bold uppercase tracking-[0.16em] text-ds-brand-wine transition hover:bg-ds-brand-wine hover:text-ds-fg-on-brand"
          >
            Volver al inicio
          </Link>
        </div>
      </article>
    </section>
  );
}
