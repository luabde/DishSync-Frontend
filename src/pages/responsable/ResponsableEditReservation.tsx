import { useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
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
  const minAllowedPeople = reservation.min_persones_reserva;
  const maxAllowedPeople = reservation.num_persones_taula;

  // Estado del formulario. Solo "número de personas" y "estado" son editables en esta versión.
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
      setError(`El número de personas debe estar entre ${minAllowedPeople} y ${maxAllowedPeople}.`);
      return;
    }
    const normalizedName = form.nomClient.trim();
    const normalizedSurname = form.cognomClient.trim();
    if (!normalizedName) {
      setError('El nombre del cliente es obligatorio.');
      return;
    }
    const normalizedContactName = [normalizedName, normalizedSurname].filter(Boolean).join(' ');
    setIsSaving(true);
    try {
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
      goBack();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No s’ha pogut guardar la reserva');
    } finally {
      setIsSaving(false);
    }
  };

  if (!reservation || !context) {
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

        <header className="mt-4 border-b border-ds-row-divider px-6 pb-4 lg:mt-0 lg:px-8 lg:py-6">
          <h1 className="font-ds-display text-[48px] font-bold leading-none text-[#3d1311]">Editar Reserva</h1>
          <p className="mt-3 text-base text-[#78716c]">Complete los detalles para registrar una nueva mesa.</p>
        </header>

        <section className="px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mx-auto max-w-[672px] rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
            <div className="space-y-4 p-6 sm:p-8">
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
                label="Nombre"
                value={form.nomClient}
                onChange={(event) => setForm((prev) => ({ ...prev, nomClient: event.target.value }))}
                placeholder="Nombre"
                variant="default"
              />

              <FormField
                label="Apellido"
                value={form.cognomClient}
                onChange={(event) => setForm((prev) => ({ ...prev, cognomClient: event.target.value }))}
                placeholder="Apellido"
                variant="default"
              />

              <FormField
                label="Fecha"
                value={form.data}
                onChange={(event) => setForm((prev) => ({ ...prev, data: event.target.value }))}
                variant="default"
                inputClassName="cursor-not-allowed opacity-70"
                disabled
              />

              <FormSelect
                label="Turno"
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
                label="Número de personas"
                type="number"
                min={minAllowedPeople}
                max={maxAllowedPeople}
                value={form.numPersones}
                onChange={(event) => setForm((prev) => ({ ...prev, numPersones: event.target.value }))}
                variant="default"
              />
              <p className="text-xs text-ds-ui-muted">
                Permitido para esta mesa: entre {minAllowedPeople} y {maxAllowedPeople} personas.
              </p>

              {/* Estado editable: permite liberar la reserva */}
              <FormSelect
                label="Estado"
                value={form.estat}
                onChange={(event) => setForm((prev) => ({ ...prev, estat: event.target.value }))}
                options={statusOptions}
                variant="default"
              />

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? <p className="text-sm text-ds-brand-olive">{success}</p> : null}
            </div>

            {/* Acciones del formulario */}
            <div className="flex flex-wrap gap-4 px-6 pb-8 sm:px-8">
              <button
                type="button"
                onClick={goBack}
                className="h-12 min-w-[150px] rounded-ds-sm border-2 border-ds-brand-wine px-8 font-ds-display text-base font-bold text-ds-brand-wine"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className={`h-12 min-w-[181px] rounded-ds-sm bg-[#3d1311] px-8 font-ds-display text-base font-bold text-ds-canvas shadow-[0_10px_15px_-3px_rgba(61,19,17,0.2),0_4px_6px_-4px_rgba(61,19,17,0.2)] ${
                  isSaving ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                {isSaving ? 'Guardando...' : 'Guardar Reserva'}
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
  const state = (window.history.state?.usr as EditReservationLocationState | null) ?? null;
  const reservation = state?.reservation;
  const context = state?.context;
  const reservationId = state?.reservationId ?? reservation?.id_reserva ?? null;
  const reservationsJson = state?.reservationsJson ?? [];

  if (!reservation || !context || !reservationId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ds-bg-page p-6">
        <div className="rounded-ds-lg border border-ds-card-border bg-white p-6 text-center">
          <p className="text-sm text-ds-brand-wine">No hi ha dades de reserva per editar.</p>
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
