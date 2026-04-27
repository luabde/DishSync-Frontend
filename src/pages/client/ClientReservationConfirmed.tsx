import { Link } from "react-router-dom";
import { CircleCheckBig } from "lucide-react";

export default function ClientReservationConfirmed() {
  return (
    <main className="min-h-screen bg-ds-bg-page px-6 py-10 text-ds-fg-default">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[760px] items-center justify-center">
        <article className="mx-auto w-full max-w-[640px] rounded-ds-table bg-ds-surface p-10 text-center shadow-ds-table">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-ds-brand-olive/10 text-ds-brand-olive">
            <CircleCheckBig className="size-8" />
          </div>

          <h1 className="font-ds-display text-[34px] font-bold text-ds-brand-wine">
            Reserva confirmada
          </h1>
          <p className="mt-4 text-sm text-ds-fg-secondary">
            Tu reserva ha sido confirmada correctamente. Te esperamos en el restaurante.
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
    </main>
  );
}
