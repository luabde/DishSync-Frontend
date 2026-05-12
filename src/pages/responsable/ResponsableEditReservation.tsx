import { useMemo, useState } from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hook';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import FormField from '../../components/common/FormField';
import FormSelect from '../../components/common/FormSelect';
import {
  restaurantApi,
  type ReservationTableAvailabilityDTO,
  type StaffReservationStatus,
} from '../../api/restaurant.api';

type EditReservationLocationState = {
  // Id de la reserva que llega desde el panel de mapa.
  reservationId?: number;
  // Mesa/reserva seleccionada para editar.
  reservation?: ReservationTableAvailabilityDTO;
  // Snapshot del listado lateral para recuperar datos sin relanzar peticiones.
  reservationsJson?: ReservationTableAvailabilityDTO[];
  // Contexto del filtro activo en el momento de abrir el formulario.
  context?: {
    restaurantId: number;
    restaurantName: string;
    selectedDate: string;
    selectedHour: string;
    selectedShiftId: number;
    selectedShiftName: string;
    selectedZoneId: number;
  };
};

type ResponsableEditReservationFormProps = {
  // Identificador de reserva real en BD.
  reservationId: number;
  // Mesa seleccionada (incluye datos de ocupación y aforo).
  reservation: ReservationTableAvailabilityDTO;
  // JSON auxiliar con el estado del listado de reservas del panel.
  reservationsJson: ReservationTableAvailabilityDTO[];
  // Contexto de navegación (restaurante, fecha, turno, etc.).
  context: NonNullable<EditReservationLocationState['context']>;
};

function ResponsableEditReservationForm({
  reservationId,
  reservation,
  reservationsJson,
  context,
}: ResponsableEditReservationFormProps) {
  // Usuario autenticado para decidir navegación/rol del sidebar.
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Estado del sidebar en móvil.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Estado de envío del formulario.
  const [isSaving, setIsSaving] = useState(false);
  // Mensajes de feedback al usuario.
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Priorizamos la reserva del JSON lateral; si no existe, usamos la reserva base.
  const reservationFromContext = useMemo(
    () => reservationsJson.find((item) => item.id_reserva === reservationId) ?? reservation,
    [reservationsJson, reservationId, reservation],
  );

  // Límites de personas permitidas según la configuración de la mesa.
  const minAllowedPeople = reservation.min_persones_reserva;
  const maxAllowedPeople = reservation.num_persones_taula;

  // Estado del formulario. Solo "nombre", "apellido", "número de personas" y "estado" son editables en esta versión.
  const [form, setForm] = useState(() => ({
    idTaula: String(reservation?.id ?? ''),
    nomClient: reservationFromContext?.nom_client ?? '',
    cognomClient: reservationFromContext?.cognoms_client ?? '',
    data: context.selectedDate,
    torn: context.selectedShiftName || String(context.selectedShiftId),
    hora: context.selectedHour,
    numPersones: String(reservation?.num_persones_reserva ?? reservation?.num_persones_taula ?? 1),
    estat: reservationFromContext?.estat_reserva ?? 'OCUPADA',
  }));

  // Opciones disponibles para el estado final de la reserva.
  const statusOptions = [
    { value: 'OCUPADA', label: 'Ocupada' },
    { value: 'RESERVADA', label: 'Reservada' },
    { value: 'LLIURE', label: 'Lliure' },
  ];

  // Vuelve al mapa principal respetando el rol actual.
  const goBack = () => {
    const basePath = user?.rol === 'CAMBRER' ? '/camarero' : '/responsable';
    navigate(basePath);
  };

  const handleSave = async () => {
    // Seguridad: sin restaurante o reserva válida no intentamos guardar.
    if (!context.restaurantId || !reservation.id_reserva) return;
    setError('');
    setSuccess('');

    // Validación de negocio: el número de personas debe respetar el rango de la mesa.
    const parsedPeople = Number(form.numPersones);
    if (
      Number.isNaN(parsedPeople) ||
      parsedPeople < minAllowedPeople ||
      parsedPeople > maxAllowedPeople
    ) {
      setError(`El nombre de persones ha d'estar entre ${minAllowedPeople} i ${maxAllowedPeople}.`);
      return;
    }

    const normalizedName = form.nomClient.trim();
    const normalizedSurname = form.cognomClient.trim();
    if (!normalizedName) {
      setError('El nom del client és obligatori.');
      return;
    }

    const normalizedContactName = [normalizedName, normalizedSurname].filter(Boolean).join(' ');
    setIsSaving(true);
    try {
      // Llamada al API para persistir los cambios de la reserva.
      await restaurantApi.updateReservationByStaff({
        restaurantId: context.restaurantId,
        reservationId,
        nom_contacte: normalizedContactName,
        id_taula_restaurant: reservation.id,
        id_torn: context.selectedShiftId,
        data: context.selectedDate,
        hora: context.selectedHour,
        num_persones: parsedPeople,
        estat: form.estat as StaffReservationStatus,
      });
      setSuccess('Reserva actualitzada correctament.');
      // Regresa al panel principal tras el éxito.
      goBack();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No s’ha pogut guardar la reserva');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ds-bg-page font-ds-sans antialiased">
      <StaffSidebar
        navItems={getSidebarNavItems(user?.rol)}
        userDisplayName={user?.nom ?? ''}
        userRoleLabel={getRoleDisplayLabel(user?.rol)}
        onLogout={() => void logout()}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1 border-l border-black/5 bg-ds-bg-page">
        <div className="px-4 pt-4 lg:hidden">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-ds-sm border border-ds-brand-wine/30 text-ds-brand-wine"
            onClick={() => setSidebarOpen(true)}
            aria-label="Obrir menú"
          >
            <Menu className="size-6" />
          </button>
        </div>

        <section className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-9 lg:pt-9">
          <nav className="mb-12 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-ds-fg-secondary/40">
            <button type="button" onClick={goBack} className="transition-colors hover:text-ds-brand-wine">MAPA</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ds-brand-wine/60">EDITAR RESERVA</span>
          </nav>

          <h1 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Actualitzar dades
          </h1>
          <p className="mx-auto mb-12 mt-3 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
            Completa els detalls per actualitzar la reserva.
          </p>

          <div className="w-full max-w-4xl bg-ds-bg-elevated rounded-ds-table shadow-2xl shadow-ds-brand-wine/10 p-10 md:p-14 transition-all duration-700">
            <div className="space-y-4">
              {/* Campos bloqueados: se muestran como contexto de la reserva actual */}
              <FormSelect
                label="Mesa"
                value={form.idTaula}
                onChange={() => undefined}
                options={[{ value: form.idTaula, label: `Taula ${form.idTaula}` }]}
                variant="default"
                selectClassName="cursor-not-allowed opacity-70"
                disabled
              />

              <FormField
                label="Nom"
                value={form.nomClient}
                onChange={(event) => setForm((prev) => ({ ...prev, nomClient: event.target.value }))}
                placeholder="Nom"
                variant="default"
              />

              <FormField
                label="Cognom"
                value={form.cognomClient}
                onChange={(event) => setForm((prev) => ({ ...prev, cognomClient: event.target.value }))}
                placeholder="Cognom"
                variant="default"
              />

              <FormField
                label="Data"
                value={form.data}
                onChange={(event) => setForm((prev) => ({ ...prev, data: event.target.value }))}
                variant="default"
                inputClassName="cursor-not-allowed opacity-70"
                disabled
              />

              <FormSelect
                label="Torn"
                value={form.torn}
                onChange={() => undefined}
                options={[{ value: form.torn, label: form.torn }]}
                variant="default"
                selectClassName="cursor-not-allowed opacity-70"
                disabled
              />

              <FormSelect
                label="Hora"
                value={form.hora}
                onChange={() => undefined}
                options={[{ value: form.hora, label: form.hora }]}
                variant="default"
                selectClassName="cursor-not-allowed opacity-70"
                disabled
              />

              {/* Campo editable con validación de aforo según mesa */}
              <FormField
                label="Nombre de persones"
                type="number"
                min={minAllowedPeople}
                max={maxAllowedPeople}
                value={form.numPersones}
                onChange={(event) => setForm((prev) => ({ ...prev, numPersones: event.target.value }))}
                variant="default"
              />
              <p className="ml-1 text-xs text-ds-ui-muted">
                Permès per a aquesta taula: entre {minAllowedPeople} i {maxAllowedPeople} persones.
              </p>

              {/* Estado editable: permite liberar la reserva */}
              <FormSelect
                label="Estat"
                value={form.estat}
                onChange={(event) => setForm((prev) => ({ ...prev, estat: event.target.value }))}
                options={statusOptions}
                variant="default"
              />

              {error ? <p className="ml-1 text-sm text-red-600">{error}</p> : null}
              {success ? <p className="ml-1 text-sm text-ds-brand-olive">{success}</p> : null}
            </div>

            {/* Acciones del formulario */}
            <div className="mt-12 flex flex-col gap-4 border-t border-ds-footer-rule pt-10">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="w-full rounded-ds-sm bg-ds-brand-wine py-4 text-sm font-bold uppercase tracking-[1.5px] text-white shadow-sm transition-all duration-300 hover:bg-ds-brand-wine/90 hover:shadow-ds-btn active:scale-[0.98]"
              >
                {isSaving ? 'PROCESSANT...' : 'CONFIRMAR'}
              </button>
              <button
                type="button"
                onClick={goBack}
                className="text-center font-ds-sans text-xs font-bold uppercase tracking-[1px] text-ds-fg-secondary/40 transition-colors hover:text-ds-brand-wine"
              >
                CANCEL·LAR I TORNAR
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ResponsableEditReservation() {
  // El formulario recibe datos por navigation state desde el botón "editar" del panel.
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = (window.history.state?.usr as EditReservationLocationState | null) ?? null;
  const reservation = state?.reservation;
  const context = state?.context;
  const reservationId = state?.reservationId ?? reservation?.id_reserva ?? null;
  const reservationsJson = state?.reservationsJson ?? [];

  // Función para volver al panel principal según el rol.
  const goBack = () => {
    const basePath = user?.rol === 'CAMBRER' ? '/camarero' : '/responsable';
    navigate(basePath);
  };

  if (!reservation || !context || !reservationId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ds-bg-page p-6">
        <div className="rounded-ds-lg border border-ds-card-border bg-white p-6 text-center">
          <p className="text-sm text-ds-brand-wine">No hi ha dades de reserva per editar.</p>
          <button
            type="button"
            onClick={goBack}
            className="mt-4 rounded-ds-sm border border-ds-brand-wine px-4 py-2 text-sm font-semibold text-ds-brand-wine"
          >
            Tornar al mapa
          </button>
        </div>
      </div>
    );
  }

  return (
    // Wrapper ligero: delega la lógica real al componente de formulario tipado por props.
    <ResponsableEditReservationForm
      reservationId={reservationId}
      reservation={reservation}
      reservationsJson={reservationsJson}
      context={context}
    />
  );
}
