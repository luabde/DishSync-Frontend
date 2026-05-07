import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useClientReservation } from "../../../hooks/clientReservation.hook";

type StepCalendarProps = {
  submitAttempted: boolean;
  onConfirmDate: () => void;
};

/**
 * usamos una cabecera propia (no la de FullCalendar) para controlar
 * exactamente el texto y el estilo del mes.
 */
const MONTHS = [
  "GENER",
  "FEBRER",
  "MARÇ",
  "ABRIL",
  "MAIG",
  "JUNY",
  "JULIOL",
  "AGOST",
  "SETEMBRE",
  "OCTUBRE",
  "NOVEMBRE",
  "DESEMBRE",
];

/**
 * Formatea una fecha a YYYY-MM-DD en hora local.
 * Evita desfases por zona horaria (e
 */
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
// Helper minimo para saber si una fecha es anterior a hoy (en formato YYYY-MM-DD local).
const isBeforeToday = (dateKey: string, todayDateKey: string) => dateKey < todayDateKey;

export default function StepCalendar({ submitAttempted, onConfirmDate }: StepCalendarProps) {
  const { selectedDate, setSelectedDate } = useClientReservation();
  // Referencia al calendario para usar prev()/next() desde nuestros botones.
  const calendarRef = React.useRef<FullCalendar | null>(null);
  // "Hoy" normalizado sin hora para comparaciones por dia.
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = formatLocalDate(today);
  // Estado del mes visible en la cabecera custom.
  const [visibleMonth, setVisibleMonth] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  /**
   * Selección por defecto de "hoy":
   * - Si todavía no hay fecha seleccionada en el contexto global de reserva,
   *   guardamos `todayKey` para que el calendario pinte ese día como seleccionado
   *   nada más entrar en este paso.
   * - No sobreescribimos una fecha previa (si el usuario ya eligió otra antes).
   */
  React.useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(todayKey);
    }
  }, [selectedDate, setSelectedDate, todayKey]);

  // Solo mostramos error despues de intentar confirmar, y unicamente si no hay fecha elegida.
  const hasError = submitAttempted && !selectedDate;

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl bg-transparent px-0 pb-2 pt-2">
        {/* Cabecera del calendario.
            - Flechas: mueven el calendario con la API de FullCalendar.
            - Texto central: usa nuestro estado visibleMonth. */}
        <div className="mb-8 flex items-center justify-between px-4 sm:px-10">
          <button
            type="button"
            onClick={() => calendarRef.current?.getApi().prev()}
            className="text-3xl font-light text-ds-brand-wine transition hover:opacity-75"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <p className="text-2xl font-bold tracking-[0.08em] text-ds-brand-wine sm:text-3xl">
            {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
          </p>
          <button
            type="button"
            onClick={() => calendarRef.current?.getApi().next()}
            className="text-3xl font-light text-ds-brand-wine transition hover:opacity-75"
            aria-label="Mes següent"
          >
            ›
          </button>
        </div>

        <div className="reservation-calendar">
          {/* FullCalendar renderiza automaticamente:
              - la rejilla de dias
              - el calculo de semanas/columnas
              - cabeceras de dias de la semana
             Nosotros solo controlamos configuracion, eventos y estilos. */}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            locale="ca"
            initialView="dayGridMonth"
            // Arranca en el mes que tenemos en estado (sincronizado con la cabecera custom).
            initialDate={visibleMonth}
            // Ocultamos toolbar nativa porque usamos nuestra cabecera propia.
            headerToolbar={false}
            showNonCurrentDates={false}
            fixedWeekCount={false}
            height="auto"
            dayMaxEventRows={0}
            // Se dispara cuando cambia el rango visible del calendario.
            // Aqui sincronizamos visibleMonth para actualizar el texto central.
            datesSet={(arg: { view: { currentStart: Date } }) => {
              // currentStart apunta al inicio del rango visible; en vista mensual coincide con el mes mostrado.
              const current = arg.view.currentStart;
              // Normalizamos al dia 1 para renderizar en cabecera "MES AÑO" de forma consistente.
              setVisibleMonth(new Date(current.getFullYear(), current.getMonth(), 1));
            }}
            // Click en un dia: ignoramos fechas pasadas y solo guardamos hoy/futuro.
            dateClick={(arg: { dateStr: string }) => {
              if (isBeforeToday(arg.dateStr, todayKey)) return;
              setSelectedDate(arg.dateStr);
            }}
            // Clases por celda para pintar estados visuales custom:
            // - seleccionado
            // - hoy (subrayado)
            dayCellClassNames={(arg: { date: Date }) => {
              const cellDate = formatLocalDate(arg.date);
              const classes: string[] = [];
              if (isBeforeToday(cellDate, todayKey)) classes.push("ds-disabled-day");
              if (cellDate === selectedDate) classes.push("ds-selected-day");
              if (cellDate === todayKey) classes.push("ds-today-day");
              return classes;
            }}
          />
        </div>

        {hasError ? (
          <p className="mt-8 text-center text-sm font-medium text-red-700">Heu de seleccionar una data per continuar.</p>
        ) : null}

        <div className="mt-10 flex justify-center pb-2">
          <button
            type="button"
            onClick={onConfirmDate}
            className="w-full rounded-ds-sm border-2 border-ds-brand-wine bg-transparent py-4 font-ds-sans text-sm font-bold uppercase tracking-[1.5px] text-ds-brand-wine transition-all duration-300 hover:bg-ds-brand-wine hover:text-white hover:shadow-ds-btn active:scale-[0.98]"
          >
            Continuar
          </button>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Este bloque CSS "engancha" con clases internas de FullCalendar (.fc...).
             Asi personalizamos el look sin modificar su logica interna. */
          .reservation-calendar .fc {
            --fc-border-color: transparent;
            --fc-page-bg-color: transparent;
            --fc-neutral-bg-color: transparent;
            --fc-neutral-text-color: var(--color-ds-ui-muted);
            --fc-today-bg-color: transparent;
            font-family: var(--font-ds-sans);
          }
          .reservation-calendar .fc .fc-header-toolbar,
          .reservation-calendar .fc .fc-toolbar {
            display: none;
          }
          .reservation-calendar .fc .fc-scrollgrid,
          .reservation-calendar .fc .fc-scrollgrid-section > * {
            border: 0;
          }
          .reservation-calendar .fc .fc-col-header-cell {
            padding-bottom: 14px;
          }
          .reservation-calendar .fc .fc-col-header-cell-cushion {
            pointer-events: none;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--color-ds-ui-muted);
          }
          .reservation-calendar .fc .fc-daygrid-day-frame {
            min-height: 52px;
          }
          .reservation-calendar .fc .fc-daygrid-day-top {
            justify-content: center;
          }
          .reservation-calendar .fc .fc-daygrid-day-number {
            /* El numero del dia se convierte en circular. */
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 999px;
            color: var(--color-ds-fg-secondary);
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.2s ease;
            outline: none;
          }
          .reservation-calendar .fc .fc-daygrid-day:hover:not(.ds-selected-day) .fc-daygrid-day-number:not(:focus-visible) {
            background: color-mix(in srgb, var(--color-ds-brand-wine) 10%, transparent);
            color: var(--color-ds-brand-wine);
          }
          .reservation-calendar .fc .ds-disabled-day .fc-daygrid-day-number {
            opacity: 0.35;
            cursor: not-allowed;
          }
          /* En dias pasados no aplicamos hover/focus ni permitimos interaccion. */
          .reservation-calendar .fc .ds-disabled-day .fc-daygrid-day-number,
          .reservation-calendar .fc .ds-disabled-day .fc-daygrid-day-frame {
            pointer-events: none;
          }
          .reservation-calendar .fc .ds-disabled-day:hover .fc-daygrid-day-number {
            background: transparent;
            color: var(--color-ds-fg-secondary);
          }
          .reservation-calendar .fc .fc-daygrid-day-number:focus,
          .reservation-calendar .fc .fc-daygrid-day-number:focus-visible {
            background: color-mix(in srgb, var(--color-ds-brand-wine) 10%, transparent);
            color: var(--color-ds-brand-wine);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-ds-brand-wine) 35%, transparent);
          }
          .reservation-calendar .fc .ds-selected-day .fc-daygrid-day-number {
            /* Dia seleccionado: circulo vino + texto claro. */
            background: var(--color-ds-brand-wine);
            color: var(--color-ds-fg-on-brand);
            box-shadow: var(--shadow-ds-card);
          }
          .reservation-calendar .fc .ds-today-day .fc-daygrid-day-number {
            /* Hoy: subrayado, incluso si no esta seleccionado. */
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 4px;
          }
          .reservation-calendar .fc .fc-daygrid-day-events {
            display: none;
          }
        `,
        }}
      />
    </section>
  );
}
