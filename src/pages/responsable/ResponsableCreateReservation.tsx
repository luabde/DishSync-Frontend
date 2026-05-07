import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hook';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import FormField from '../../components/common/FormField';
import FormSelect from '../../components/common/FormSelect';
import { restaurantApi, type ReservationTableAvailabilityDTO } from '../../api/restaurant.api';

type CreateReservationLocationState = {
  table?: ReservationTableAvailabilityDTO;
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const state = (window.history.state?.usr as CreateReservationLocationState | null) ?? null;
  const selectedTable = state?.table;
  const selectedContext = state?.context;
  const minAllowedPeople = selectedTable?.min_persones_reserva ?? 1;
  const maxAllowedPeople = selectedTable?.num_persones_taula ?? 1;

  // Estado local solo para maqueta visual (sin integración backend por ahora).
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
    numPersones: '2',
    estado: 'OCUPADA',
    observaciones: '',
  });

  const goBack = () => {
    const basePath = user?.rol === 'CAMBRER' ? '/camarero' : '/responsable';
    navigate(basePath);
  };

  const handleSave = async () => {
    setError('');
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

        <header className="mt-4 border-b border-ds-row-divider px-6 pb-4 lg:mt-0 lg:px-8 lg:py-6">
          <h1 className="font-ds-display text-[48px] font-bold leading-none text-[#3d1311]">
            Nova reserva
          </h1>
          <p className="mt-3 text-base text-[#78716c]">
            Completa els detalls per registrar una nova taula.
          </p>
        </header>

        <section className="px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mx-auto max-w-[672px] rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
            <div className="space-y-4 p-6 sm:p-8">
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
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>

            <div className="flex flex-wrap gap-4 px-6 pb-8 sm:px-8">
              <button
                type="button"
                onClick={goBack}
                className="h-12 min-w-[150px] rounded-ds-sm border-2 border-ds-brand-wine px-8 font-ds-display text-base font-bold text-ds-brand-wine"
              >
                Cancel·lar
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className={`h-12 min-w-[181px] rounded-ds-sm bg-[#3d1311] px-8 font-ds-display text-base font-bold text-ds-canvas shadow-[0_10px_15px_-3px_rgba(61,19,17,0.2),0_4px_6px_-4px_rgba(61,19,17,0.2)] ${
                  isSaving ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                {isSaving ? 'Desant...' : 'Desar reserva'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
