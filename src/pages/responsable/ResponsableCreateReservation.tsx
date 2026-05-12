import { useState } from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hook';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import FormField from '../../components/common/FormField';
import FormSelect from '../../components/common/FormSelect';
import { restaurantApi, type ReservationTableAvailabilityDTO } from '../../api/restaurant.api';

type CreateReservationLocationState = {
  // Mesa seleccionada desde el panel para la nueva reserva.
  table?: ReservationTableAvailabilityDTO;
  // Contexto de filtros (restaurante, fecha, turno, zona) en el momento de crear.
  context?: {
    restaurantId: number;
    restaurantName: string;
    selectedDate: string;
    selectedHour: string;
    selectedShiftId: number;
    selectedShiftName: string;
    selectedZoneId: number;
    selectedZoneName: string;
  };
};

export default function ResponsableCreateReservation() {
  // Usuario autenticado para decidir navegación/rol del sidebar.
  const { user, logout } = useAuth();
  // Navegación programática tras crear reserva.
  const navigate = useNavigate();
  // Estado del sidebar en móvil.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Mensajes de feedback al usuario.
  const [error, setError] = useState('');
  // Estado de envío del formulario.
  const [isSaving, setIsSaving] = useState(false);
  
  // Recupera el estado de navegación (mesa y contexto de filtros).
  const state = (window.history.state?.usr as CreateReservationLocationState | null) ?? null;
  const selectedTable = state?.table;
  const selectedContext = state?.context;
  // Límites de personas permitidas según la configuración de la mesa.
  const minAllowedPeople = selectedTable?.min_persones_reserva ?? 1;
  const maxAllowedPeople = selectedTable?.num_persones_taula ?? 1;

  // Estado local del formulario para la creación de la nueva reserva.
  const [form, setForm] = useState({
    mesa: String(selectedTable?.id ?? ''),
    zona: selectedContext?.selectedZoneName ?? '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    fecha: selectedContext?.selectedDate ?? '',
    turno: selectedContext?.selectedShiftName ?? '',
    hora: selectedContext?.selectedHour ?? '',
    numPersones: String(maxAllowedPeople),
    estado: 'OCUPADA',
    observaciones: '',
  });

  // Vuelve al mapa principal respetando el rol actual.
  const goBack = () => {
    const basePath = user?.rol === 'CAMBRER' ? '/camarero' : '/responsable';
    navigate(basePath);
  };

  const handleSave = async () => {
    setError('');
    // Validaciones básicas de contacto.
    const normalizedName = form.nombre.trim();
    const normalizedSurname = form.apellido.trim();
    if (!normalizedName) {
      setError('El nom és obligatori.');
      return;
    }
    if (!normalizedSurname) {
      setError('El cognom és obligatori.');
      return;
    }
    const normalizedPhone = form.telefono.trim();
    if (!normalizedPhone) {
      setError('El telèfon és obligatori.');
      return;
    }
    if (normalizedPhone.length < 9) {
      setError('El telèfon ha de tenir com a mínim 9 dígits.');
      return;
    }
    // Validación de negocio: aforo permitido por la mesa.
    const parsedPeople = Number(form.numPersones);
    if (
      Number.isNaN(parsedPeople) ||
      parsedPeople < minAllowedPeople ||
      parsedPeople > maxAllowedPeople
    ) {
      setError(`El nombre de persones ha d'estar entre ${minAllowedPeople} i ${maxAllowedPeople}.`);
      return;
    }

    if (!selectedContext || !selectedTable) return;

    try {
      setIsSaving(true);
      // Llamada al API para registrar la nueva reserva desde el panel de staff.
      await restaurantApi.createReservationByStaff({
        restaurantId: selectedContext.restaurantId,
        nom: normalizedName,
        cognoms: normalizedSurname,
        email: form.email.trim() || undefined,
        telefon: normalizedPhone,
        id_taula_restaurant: selectedTable.id,
        id_torn: selectedContext.selectedShiftId,
        data: selectedContext.selectedDate,
        hora: selectedContext.selectedHour,
        num_persones: parsedPeople,
        estat: form.estado as 'RESERVADA' | 'OCUPADA',
        observacions: form.observaciones.trim() || undefined,
      });
      // Regresa al panel tras el éxito.
      goBack();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'No s’ha pogut crear la reserva des de staff'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedTable || !selectedContext) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ds-bg-page p-6">
        <div className="rounded-ds-lg border border-ds-card-border bg-white p-6 text-center">
          <p className="text-sm text-ds-brand-wine">
            No hi ha context de taula seleccionada per crear la reserva.
          </p>
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

        <section className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-9 lg:pt-9">
          <nav className="mb-12 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-ds-fg-secondary/40">
            <button type="button" onClick={goBack} className="transition-colors hover:text-ds-brand-wine">MAPA</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ds-brand-wine/60">NOVA RESERVA</span>
          </nav>

          <h1 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Nova reserva
          </h1>
          <p className="mx-auto mb-12 mt-3 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
            Completa els detalls per crear una nova reserva.
          </p>
          
          <div className="w-full max-w-4xl bg-ds-bg-elevated rounded-ds-table shadow-2xl shadow-ds-brand-wine/10 p-10 md:p-14">
            <div className="space-y-4">
              {/* Campos bloqueados según la mesa seleccionada en el mapa */}
              <FormSelect
                label="taula"
                value={form.mesa}
                onChange={() => undefined}
                options={[{ value: form.mesa, label: `Taula ${form.mesa}` }]}
                variant="default"
                selectClassName="cursor-not-allowed opacity-70"
                disabled
              />

              <FormSelect
                label="Zona"
                value={form.zona}
                onChange={() => undefined}
                options={[{ value: form.zona, label: form.zona || '-' }]}
                variant="default"
                selectClassName="cursor-not-allowed opacity-70"
                disabled
              />

              <FormField
                label="Nom"
                value={form.nombre}
                onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
                placeholder="Nom"
                variant="default"
              />

              <FormField
                label="Cognom"
                value={form.apellido}
                onChange={(event) => setForm((prev) => ({ ...prev, apellido: event.target.value }))}
                placeholder="Cognom"
                variant="default"
              />

              <FormField
                label="Telèfon"
                value={form.telefono}
                onChange={(event) => setForm((prev) => ({ ...prev, telefono: event.target.value }))}
                placeholder="Telèfon"
                variant="default"
              />

              <FormField
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email"
                variant="default"
              />

              <FormField
                label="Data"
                type="date"
                value={form.fecha}
                onChange={() => undefined}
                variant="default"
                inputClassName="cursor-not-allowed opacity-70"
                disabled
              />

              <FormSelect
                label="Torn"
                value={form.turno}
                onChange={() => undefined}
                options={[{ value: form.turno, label: form.turno || '-' }]}
                variant="default"
                selectClassName="cursor-not-allowed opacity-70"
                disabled
              />

              <FormSelect
                label="Hora"
                value={form.hora}
                onChange={() => undefined}
                options={[{ value: form.hora, label: form.hora || '-' }]}
                variant="default"
                selectClassName="cursor-not-allowed opacity-70"
                disabled
              />

              <FormField
                label="Nombre de persones"
                type="number"
                min={minAllowedPeople}
                max={maxAllowedPeople}
                value={form.numPersones}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, numPersones: event.target.value }))
                }
                variant="default"
              />

              <FormSelect
                label="Estat"
                value={form.estado}
                onChange={(event) => setForm((prev) => ({ ...prev, estado: event.target.value }))}
                options={[
                  { value: 'OCUPADA', label: 'Ocupada' },
                  { value: 'RESERVADA', label: 'Reservada' },
                ]}
                variant="default"
              />

              <FormField
                label="Observacions"
                value={form.observaciones}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, observaciones: event.target.value }))
                }
                placeholder="Afegir observacions..."
                variant="default"
              />
              {error ? <p className="ml-1 text-sm text-red-600">{error}</p> : null}
            </div>

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
