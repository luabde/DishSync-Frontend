import { Link } from "react-router-dom";
import { Clock3 } from "lucide-react";

export default function ClientReservationExpired() {
  return (
    <main className="min-h-screen bg-ds-bg-page px-6 py-10 text-ds-fg-default">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[760px] items-center justify-center">
        <article className="mx-auto w-full max-w-[640px] rounded-ds-table bg-ds-surface p-10 text-center shadow-ds-table">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-ds-brand-copper/15 text-ds-brand-copper">
            <Clock3 className="size-8" />
          </div>

          <h1 className="font-ds-display text-[34px] font-bold text-ds-brand-wine">
            Reserva expirada
          </h1>
          <p className="mt-4 text-sm text-ds-fg-secondary">
            El enlace de confirmacion ha caducado. Si quieres reservar, vuelve a crear una nueva solicitud.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="inline-flex h-[56px] items-center rounded-[4px] border-2 border-ds-brand-wine px-8 text-sm font-bold uppercase tracking-[0.16em] text-ds-brand-wine transition hover:bg-ds-brand-wine hover:text-ds-fg-on-brand"
            >
              Hacer nueva reserva
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
