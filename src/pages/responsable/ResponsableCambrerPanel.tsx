import { useEffect, useState } from 'react';
import { Menu, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hook';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import { ToolbarSearchInput } from '../../components/filters/ToolbarSearchInput';
import { usuarisApi } from '../../api/usuaris.api';
import {
  restaurantApi,
  type ReservationShiftDTO,
  type ReservationTableAvailabilityDTO,
  type ReservationZoneDTO,
} from '../../api/restaurant.api';
import TableIllustration from '../../components/admin/CreateRestaurant/TableIllustration';

type TableType = 2 | 4 | 6 | 8 | 10 | 12;
// Capacidades visuales soportadas por TableIllustration.
const VALID_TABLE_TYPES: TableType[] = [2, 4, 6, 8, 10, 12];

// Convierte Date -> YYYY-MM-DD para consumir endpoints del backend.
const toYmd = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const snapToTableType = (value: number): TableType =>
  VALID_TABLE_TYPES.find((tableType) => tableType >= value) ?? 12;


// Formato corto de día para la cabecera lateral (ej: "JUE, 29 ABR").
const formatSidebarDay = (ymd: string) => {
  const date = new Date(`${ymd}T00:00:00`);
  return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: '2-digit', month: 'short' }).format(date).toUpperCase();
};

export default function ResponsableCambrerPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Control del sidebar móvil.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Restaurante asignado al usuario actual.
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurantName, setRestaurantName] = useState('');
  // Datos de filtros del mapa (turnos/zonas/mesas).
  const [shifts, setShifts] = useState<ReservationShiftDTO[]>([]);
  const [zones, setZones] = useState<ReservationZoneDTO[]>([]);
  const [tables, setTables] = useState<ReservationTableAvailabilityDTO[]>([]);
  // Filtros activos del mapa.
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  // Día activo del mapa; por defecto hoy.
  const [selectedDate, setSelectedDate] = useState(toYmd(new Date()));
  // Estados de UX.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [releasingReservationId, setReleasingReservationId] = useState<number | null>(null);
  // Solo para efecto visual hover de mesa disponible.
  const [hoveredTableId, setHoveredTableId] = useState<number | null>(null);
  const [isMobileMap, setIsMobileMap] = useState(false);

  // Turno elegido y horas disponibles de ese turno.
  const selectedShift = shifts.find((shift) => shift.id === selectedShiftId) ?? null;
  const availableHours = selectedShift?.hores ?? [];
  // Número de filas necesarias en el grid según posición/span de mesas.
  const tableRowCount = tables.length > 0 ? Math.max(...tables.map((table) => table.fila + table.span_fila)) : 4;
  const gridCols = 3;
  const cellSize = isMobileMap ? 80 : 130;
  const cellGap = isMobileMap ? 12 : 24;
  const tableScale = isMobileMap ? 0.62 : 1;
  const gridPaddingY = isMobileMap ? 10 : 24;
  const gridPaddingX = isMobileMap ? 10 : 24;
  const gridBleedX = 0;
  const gridWidth = gridCols * cellSize + (gridCols - 1) * cellGap + (gridPaddingX * 2) + (gridBleedX * 2);
  const hasTables = tables.length > 0;
  // En el lateral mostramos mesas por estado para distinguir ocupadas vs reservadas.
  // Normaliza texto para comparar sin depender de mayúsculas/minúsculas ni espacios laterales.
  const normalizeText = (value: string) => value.trim().toLowerCase();
  // Término efectivo de búsqueda escrito por el usuario en el input del lateral.
  const searchTerm = normalizeText(searchQuery);
  // Devuelve true cuando la mesa/reserva coincide con el filtro de búsqueda.
  // Se permite buscar por nombre del cliente o por número de mesa.
  const matchesReservationSearch = (table: ReservationTableAvailabilityDTO) => {
    if (!searchTerm) return true;
    // Nombre completo del cliente asociado a la reserva (si existe).
    const fullName = `${table.nom_client ?? ''} ${table.cognoms_client ?? ''}`.trim().toLowerCase();
    // Texto "taula X" para soportar búsquedas tipo "taula 12".
    const tableLabel = `taula ${table.id}`.toLowerCase();
    // Soporte de búsqueda directa por número ("12", "7", etc.).
    const tableIdText = String(table.id);
    return (
      fullName.includes(searchTerm) ||
      tableLabel.includes(searchTerm) ||
      tableIdText.includes(searchTerm)
    );
  };
  // Listas finales para el lateral derecho:
  // primero filtramos por estado de reserva y después aplicamos el texto de búsqueda.
  const occupiedTables = tables.filter(
    (table) => table.estat_reserva === 'OCUPADA' && matchesReservationSearch(table),
  );
  const reservedTables = tables.filter(
    (table) => table.estat_reserva === 'RESERVADA' && matchesReservationSearch(table),
  );
  const activeTables = [...occupiedTables, ...reservedTables];

  // Bloquea scroll del body cuando el sidebar móvil está abierto.
  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  // para el responsive del mapa
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateIsMobile = () => setIsMobileMap(mediaQuery.matches);
    updateIsMobile();
    mediaQuery.addEventListener('change', updateIsMobile);
    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

  // Carga inicial:
  // 1) restaurante asignado al usuario
  // 2) zonas de ese restaurante
  // 3) selecciona primera zona por defecto
  useEffect(() => {
    const loadPanelData = async () => {
      try {
        setError('');
        setLoading(true);

        const assigned = await usuarisApi.getMyAssignedRestaurant();
        if (!assigned.id_restaurant) {
          setRestaurantId(null);
          setRestaurantName('');
          setShifts([]);
          setZones([]);
          setTables([]);
          setError('Aquest usuari no té cap restaurant assignat.');
          return;
        }

        const nextRestaurantId = assigned.id_restaurant;
        setRestaurantId(nextRestaurantId);
        setRestaurantName(assigned.restaurant?.nom ?? '');

        const nextZones = await restaurantApi.getReservationZones(nextRestaurantId);
        setZones(nextZones);
        const firstZone = nextZones[0]?.id ?? null;
        setSelectedZoneId(firstZone);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No s’ha pogut carregar el mapa de sala');
      } finally {
        setLoading(false);
      }
    };

    void loadPanelData();
  }, []);

  // Cada vez que cambia restaurante o fecha:
  // carga turnos/horas y auto-selecciona el primer turno + primera hora.
  useEffect(() => {
    const loadShiftsByDay = async () => {
      if (!restaurantId) return;
      try {
        setError('');
        const nextShifts = await restaurantApi.getReservationsForm(restaurantId, selectedDate);
        setShifts(nextShifts);
        const firstShift = nextShifts[0];
        const nextShiftId = firstShift?.id ?? null;
        const nextHour = firstShift?.hores[0] ?? '';
        setSelectedShiftId(nextShiftId);
        setSelectedHour(nextHour);
      } catch (loadError) {
        console.log("Drentro del catch");
        setShifts([]);
        setSelectedShiftId(null);
        setSelectedHour('');
        setError(loadError instanceof Error ? loadError.message : 'No s’han pogut carregar els torns');
      }
    };

    void loadShiftsByDay();
  }, [restaurantId, selectedDate]);

  // Si cambia de turno y la hora actual ya no existe, ajusta a la primera disponible.
  useEffect(() => {
    if (!selectedShift) {
      setSelectedHour('');
      return;
    }

    if (!selectedShift.hores.includes(selectedHour)) {
      setSelectedHour(selectedShift.hores[0] ?? '');
    }
  }, [selectedShift, selectedHour]);

  // Carga mesas cuando los filtros clave están completos.
  // Filtros: restaurante + día + turno + hora + zona.
  useEffect(() => {
    const loadTables = async () => {
      if (!restaurantId || !selectedShiftId || !selectedHour || selectedZoneId === null) {
        setTables([]);
        return;
      }

      try {
        setError('');
        const nextTables = await restaurantApi.getReservationTables({
          restaurantId,
          data: selectedDate,
          id_torn: selectedShiftId,
          hora: selectedHour,
          zona: selectedZoneId,
        });
        setTables(nextTables);
      } catch (loadError) {
        setTables([]);
        setError(loadError instanceof Error ? loadError.message : 'No s’han pogut carregar les taules');
      }
    };

    void loadTables();
  }, [restaurantId, selectedDate, selectedShiftId, selectedHour, selectedZoneId]);

  /**
   * Libera una reserva desde el panel de sala.
   *
   * Qué hace exactamente:
   * 1) Llama al endpoint `releaseReservationByStaff` del backend.
   *    - En backend, esa reserva pasa a estado `LLIURE`.
   * 2) En frontend, actualizamos la mesa en memoria para reflejarla como "libre":
   *    - `id_reserva: null`
   *    - `estat_reserva: null`
   *    - `num_persones_reserva: null`
   *
   * Nota:
   * En este mapa, "mesa libre" se representa con `estat_reserva = null`.
   * Por eso desaparece del bloque de "ocupadas" y vuelve al estilo de disponibilidad.
   */
  const handleReleaseReservation = async (table: ReservationTableAvailabilityDTO) => {
    if (!restaurantId || !table.id_reserva) return;
    try {
      setError('');
      setReleasingReservationId(table.id_reserva);
      await restaurantApi.releaseReservationByStaff({
        restaurantId,
        reservationId: table.id_reserva,
      });
      // Reflejamos en local que la mesa queda LIBRE sin recargar toda la pantalla.
      setTables((prev) =>
        prev.map((current) =>
          current.id === table.id
            // `null` en estos campos = mesa libre para este día/turno/hora.
            ? { ...current, id_reserva: null, estat_reserva: null, num_persones_reserva: null }
            : current,
        ),
      );
    } catch (releaseError) {
      setError(
        releaseError instanceof Error ? releaseError.message : 'No s’ha pogut alliberar la reserva',
      );
    } finally {
      setReleasingReservationId(null);
    }
  };

  const handleEditReservation = (table: ReservationTableAvailabilityDTO) => {
    if (!table.id_reserva || !restaurantId || !selectedShiftId || selectedZoneId === null) return;
    navigate(`reservas/${table.id_reserva}/edit`, {
      state: {
        reservationId: table.id_reserva,
        reservation: table,
        reservationsJson: activeTables,
        context: {
          restaurantId,
          restaurantName,
          selectedDate,
          selectedHour,
          selectedShiftId,
          selectedShiftName: selectedShift?.nom ?? '',
          selectedZoneId,
        },
      },
    });
  };
  // FUnción para cuando se clica una mesa, que redirija a la pagina de neuva reserva pasandole todos los datos seleciconados para el autocompletado
  const handleCreateReservation = (table: ReservationTableAvailabilityDTO) => {
    if (table.estat_reserva || !restaurantId || !selectedShiftId || selectedZoneId === null) return;
    const selectedZoneName = zones.find((zone) => zone.id === selectedZoneId)?.nom ?? '';
    navigate('reservas/new', {
      state: {
        table,
        context: {
          restaurantId,
          restaurantName,
          selectedDate,
          selectedHour,
          selectedShiftId,
          selectedShiftName: selectedShift?.nom ?? '',
          selectedZoneId,
          selectedZoneName,
        },
      },
    });
  };

  return (
    // Layout principal: sidebar staff + contenido de mapa.
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
        {/* Botón hamburguesa solo en móvil */}
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

        <header className="mt-4 border-b-2 border-ds-brand-wine px-6 pb-4 lg:mt-0 lg:flex lg:h-20 lg:items-center lg:px-8 lg:pb-0">
          <h1 className="font-ds-display text-3xl font-semibold tracking-[2px] text-ds-brand-wine">
            Mapa de taules
          </h1>
        </header>

        {/* Dos columnas en desktop:
            izquierda (mapa) + derecha (filtros resumen/listado) */}
        <section className="grid min-h-[calc(100vh-80px)] grid-cols-1 lg:grid-cols-[1fr_326px]">
          <div className="p-4 sm:p-6 lg:p-12">
            {restaurantName ? (
              <p className="mb-4 text-sm text-ds-fg-secondary">Restaurant: {restaurantName}</p>
            ) : null}

            {/* Selector de zonas (tabs) */}
            <div className="mx-auto mb-8 flex w-fit rounded-[10px] border-2 border-ds-brand-wine p-1.5">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`rounded-md px-7 py-2 text-xs font-bold ${
                    selectedZoneId === zone.id ? 'bg-ds-brand-wine text-white' : 'text-ds-brand-wine'
                  }`}
                >
                  {zone.nom}
                </button>
              ))}
            </div>

            <div className="rounded-lg bg-white p-4 sm:p-6">
              {/* Mensajes de error/carga del mapa */}
              {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
              {loading ? <p className="mt-4 text-sm text-ds-ui-muted">Carregant mapa de sala...</p> : null}

              {/* Bloque visual del mapa, copiado del patrón de reservas */}
              <div className="mt-6 flex justify-center">
                <div className="w-full max-w-[520px] shrink-0">
                  <div className="relative min-h-[420px] overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-[0_20px_50px_rgba(74,26,18,0.05)] sm:min-h-[560px]">
                    <div className="relative z-10 h-full max-h-[520px] overflow-auto sm:max-h-[680px]">
                      {!hasTables ? (
                        <div className="flex min-h-[420px] items-center justify-center sm:min-h-[560px]">
                          <p className="text-sm text-[#4A1A12]/40">No hi ha taules per a la zona seleccionada.</p>
                        </div>
                      ) : (
                        // Grid 3 columnas con posiciones exactas del backend (fila/columna/span).
                        <div
                          className="grid mx-auto"
                          style={{
                            gridTemplateColumns: `repeat(${gridCols}, ${cellSize}px)`,
                            gridTemplateRows: `repeat(${tableRowCount}, ${cellSize}px)`,
                            gap: `${cellGap}px`,
                            padding: `${gridPaddingY}px ${gridPaddingX + gridBleedX}px`,
                            width: gridWidth,
                            maxWidth: '100%',
                          }}
                        >
                          {tables.map((table) => {
                            const isOccupied = Boolean(table.estat_reserva);
                            const tableType = snapToTableType(table.num_persones_taula);
                            const statusTone =
                              table.estat_reserva === 'OCUPADA'
                                ? 'OCCUPIED'
                                : table.estat_reserva === 'RESERVADA'
                                  ? 'RESERVED'
                                  : undefined;
                            return (
                              <div
                                key={table.id}
                                className={`relative z-20 flex h-full w-full min-h-0 items-center justify-center overflow-visible rounded-2xl ${
                                  isOccupied ? 'cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                style={{
                                  gridColumn: `${table.columna + 1} / span ${table.span_columna}`,
                                  gridRow: `${table.fila + 1} / span ${table.span_fila}`,
                                }}
                                onMouseEnter={() => setHoveredTableId(table.id)}
                                onMouseLeave={() => setHoveredTableId(null)}
                                onClick={() => {
                                  if (!isOccupied) {
                                    handleCreateReservation(table);
                                  }
                                }}
                              >
                                {/* Mesa reutilizable; ocupada bloqueada, disponible con hover */}
                                <TableIllustration
                                  type={tableType}
                                  id={`T${table.id}`}
                                  isDeleteState={false}
                                  statusTone={statusTone}
                                  isSelected={!isOccupied && hoveredTableId === table.id}
                                  scale={tableScale}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Leyenda de colores de estados */}
              <div className="mt-6 flex items-center justify-center gap-6 text-[11px] font-semibold uppercase tracking-wide text-ds-avatar-fg">
                <span className="inline-flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-[#ededed]" />
                  Disponible
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-[#8b4513]" />
                  Ocupada
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-[#4a0e0e]" />
                  Reservada
                </span>
              </div>
            </div>
          </div>

          {/* Columna lateral: filtros temporales + listado de mesas ocupadas */}
          <aside className="border-l border-black/5 bg-white p-5">
            {/* Navegación de día */}
            <div className="flex items-center gap-2 rounded-md border-2 border-ds-brand-wine px-2 py-1">
              <button
                type="button"
                onClick={() =>
                  setSelectedDate((prev) => {
                    const date = new Date(`${prev}T00:00:00`);
                    date.setDate(date.getDate() - 1);
                    return toYmd(date);
                  })
                }
                className="rounded px-2 py-1 text-xs font-bold text-ds-brand-wine"
                aria-label="Dia anterior"
              >
                {'<'}
              </button>
              <div className="flex-1 text-center text-xs font-bold text-ds-brand-wine">{formatSidebarDay(selectedDate)}</div>
              <button
                type="button"
                onClick={() =>
                  setSelectedDate((prev) => {
                    const date = new Date(`${prev}T00:00:00`);
                    date.setDate(date.getDate() + 1);
                    return toYmd(date);
                  })
                }
                className="rounded px-2 py-1 text-xs font-bold text-ds-brand-wine"
                aria-label="Dia següent"
              >
                {'>'}
              </button>
            </div>

            {/* Selector de turno */}
            <div className="mt-4 flex rounded-md border-2 border-ds-brand-wine p-1 text-xs font-bold uppercase">
              {shifts.length === 0 ? (
                <span className="w-full py-1.5 text-center text-ds-brand-wine/60">Sense torns</span>
              ) : (
                shifts.map((shift) => (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() => setSelectedShiftId(shift.id)}
                    className={`flex-1 rounded py-1.5 ${selectedShiftId === shift.id ? 'bg-ds-brand-wine text-white' : 'text-ds-brand-wine/60'}`}
                  >
                    {shift.nom}
                  </button>
                ))
              )}
            </div>
            {/* Selector de hora del turno activo */}
            <div className="mt-4 rounded-xl bg-ds-surface-muted px-3 py-2">
              <label className="block text-[10px] font-bold uppercase tracking-wide text-ds-ui-muted">Hora</label>
              <select
                value={selectedHour}
                onChange={(event) => setSelectedHour(event.target.value)}
                className="mt-1 h-8 w-full border-0 bg-transparent p-0 text-xs font-semibold text-ds-brand-wine outline-none"
              >
                {availableHours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <ToolbarSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cercar per nom o taula..."
              />
            </div>

            {/* Bloque de mesas ocupadas */}
            <div className="mt-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-ds-brand-wine/60">
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-[#8b4513]" />
                Ocupades
              </span>
              <span className="rounded bg-[#f3f4f6] px-1.5 py-0.5">{occupiedTables.length}</span>
            </div>
            <div className="mt-3 space-y-3">
              {occupiedTables.slice(0, 6).map((table) => (
                <div key={table.id} className="flex items-center justify-between rounded-md border border-[#f3f4f6] p-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ds-brand-wine">Taula {table.id}</p>
                    <p className="truncate text-[10px] text-ds-brand-wine/70">
                      {[table.nom_client, table.cognoms_client].filter(Boolean).join(' ') || 'Sense nom'}
                    </p>
                    <p className="text-[10px] text-ds-ui-muted">
                      {selectedHour || '--:--'} · {table.num_persones_reserva ?? table.num_persones_taula}p
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditReservation(table)}
                      disabled={!table.id_reserva}
                      className="rounded-md border border-ds-brand-gold p-1 text-ds-brand-gold transition-colors hover:bg-ds-brand-gold hover:text-white"
                      aria-label={`Editar reserva taula ${table.id}`}
                      title="Editar reserva"
                    >
                      <Pencil className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReleaseReservation(table)}
                      disabled={!table.id_reserva || releasingReservationId === table.id_reserva}
                      className={`rounded-md border border-ds-brand-gold p-1 text-ds-brand-gold transition-colors hover:bg-ds-brand-gold hover:text-white ${
                        !table.id_reserva || releasingReservationId === table.id_reserva
                          ? 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-ds-brand-gold'
                          : ''
                      }`}
                      aria-label={`Liberar reserva taula ${table.id}`}
                      title="Marcar com a lliure"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bloque de mesas reservadas */}
            <div className="mt-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-ds-brand-wine/60">
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-[#4a0e0e]" />
                Reservades
              </span>
              <span className="rounded bg-[#f3f4f6] px-1.5 py-0.5">{reservedTables.length}</span>
            </div>
            <div className="mt-3 space-y-3">
              {reservedTables.slice(0, 6).map((table) => (
                <div key={table.id} className="flex items-center justify-between rounded-md border border-[#f3f4f6] p-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ds-brand-wine">Taula {table.id}</p>
                    <p className="truncate text-[10px] text-ds-brand-wine/70">
                      {[table.nom_client, table.cognoms_client].filter(Boolean).join(' ') || 'Sense nom'}
                    </p>
                    <p className="text-[10px] text-ds-ui-muted">
                      {selectedHour || '--:--'} · {table.num_persones_reserva ?? table.num_persones_taula}p
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditReservation(table)}
                      disabled={!table.id_reserva}
                      className="rounded-md border border-ds-brand-gold p-1 text-ds-brand-gold transition-colors hover:bg-ds-brand-gold hover:text-white"
                      aria-label={`Editar reserva taula ${table.id}`}
                      title="Editar reserva"
                    >
                      <Pencil className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReleaseReservation(table)}
                      disabled={!table.id_reserva || releasingReservationId === table.id_reserva}
                      className={`rounded-md border border-ds-brand-gold p-1 text-ds-brand-gold transition-colors hover:bg-ds-brand-gold hover:text-white ${
                        !table.id_reserva || releasingReservationId === table.id_reserva
                          ? 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-ds-brand-gold'
                          : ''
                      }`}
                      aria-label={`Liberar reserva taula ${table.id}`}
                      title="Marcar com a lliure"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
              {activeTables.length === 0 ? (
                <p className="pt-2 text-center text-xs text-ds-ui-muted">No hi ha reserves actives en taules.</p>
              ) : null}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
