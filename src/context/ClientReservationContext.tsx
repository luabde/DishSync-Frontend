import React, { createContext, useState, type ReactNode } from "react";
import {
  restaurantApi,
  type ReservationTableAvailabilityDTO,
  type ReservationZoneDTO,
} from "../api/restaurant.api";

interface ClientReservationContextValue {
  // Paso actual del form de reserva (1..n).
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  // Fecha elegida en el Step 1 (formato YYYY-MM-DD).
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  // Turno y hora elegidos en el Step 2.
  selectedShiftName: string;
  setSelectedShiftName: React.Dispatch<React.SetStateAction<string>>;
  selectedShiftHour: string;
  setSelectedShiftHour: React.Dispatch<React.SetStateAction<string>>;
  // Restaurante elegido desde la home antes de entrar al wizard.
  selectedRestaurantId: number | null;
  setSelectedRestaurantId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedRestaurantName: string;
  setSelectedRestaurantName: React.Dispatch<React.SetStateAction<string>>;
  // Horarios agrupados por turno, p.ej. { "Comida": ["13:00","13:30"] }.
  horarisTorns: Record<string, string[]>;
  // Carga turnos/horas del restaurante seleccionado y los guarda en contexto.
  getHorarisTorns: () => Promise<Record<string, string[]>>;
  // Step 3: zonas del restaurante para mostrar las pestañas.
  zones: ReservationZoneDTO[];
  // Zona actualmente seleccionada en las pestañas.
  activeZoneId: number | null;
  setActiveZoneId: React.Dispatch<React.SetStateAction<number | null>>;
  // Carga las zonas del restaurante seleccionado y las guarda en contexto.
  getReservationZones: () => Promise<ReservationZoneDTO[]>;
  // Mesas con disponibilidad devueltas por el backend para la zona activa.
  taulesDisponibles: ReservationTableAvailabilityDTO[];
  // Carga mesas. Acepta un zoneIdOverride para evitar leer estado stale al cambiar zona.
  getTaulesDisponibles: (zoneIdOverride?: number | null) => Promise<ReservationTableAvailabilityDTO[]>;
  // Mesa seleccionada por el usuario en el Step 3.
  selectedTableId: number | null;
  setSelectedTableId: React.Dispatch<React.SetStateAction<number | null>>;
  // Número de personas elegido en el selector del Step 3 (por defecto = capacidad máxima de la mesa).
  selectedNumPeople: number | null;
  setSelectedNumPeople: React.Dispatch<React.SetStateAction<number | null>>;
}

export const ClientReservationContext = createContext<ClientReservationContextValue | null>(null);

/**
 * Contexto base del wizard de reserva para cliente.
 * Centraliza el estado compartido de todos los steps:
 * restaurante, fecha, turno/hora, zonas, mesas y número de personas.
 */
export const ClientReservationProvider = ({ children }: { children: ReactNode }) => {
  // Estado de navegación del formulario por pasos.
  const [step, setStep] = useState(1);
  // Step 1: fecha de reserva.
  const [selectedDate, setSelectedDate] = useState("");
  // Step 2: selección de turno y hora.
  const [selectedShiftName, setSelectedShiftName] = useState("");
  const [selectedShiftHour, setSelectedShiftHour] = useState("");
  // Restaurante seleccionado en la home antes de entrar al wizard.
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [selectedRestaurantName, setSelectedRestaurantName] = useState("");
  // Resultado de backend con los horarios disponibles por turno.
  const [horarisTorns, setHorarisTorns] = useState<Record<string, string[]>>({});
  // Step 3: zonas del restaurante.
  const [zones, setZones] = useState<ReservationZoneDTO[]>([]);
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);
  // Mesas de la zona activa con información de disponibilidad.
  const [taulesDisponibles, setTaulesDisponibles] = useState<ReservationTableAvailabilityDTO[]>([]);
  // Mesa y número de personas seleccionados por el usuario.
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedNumPeople, setSelectedNumPeople] = useState<number | null>(null);

  const getHorarisTorns = async () => {
    // Sin restaurante no podemos pedir horarios: devolvemos objeto vacío.
    if (!selectedRestaurantId) return {};
    // Llamada al endpoint de reservas del restaurante seleccionado.
    const nextHorarisTorns = await restaurantApi.getReservationsForm(selectedRestaurantId);
    // Guardamos en contexto para reutilizar en Steps posteriores.
    setHorarisTorns(nextHorarisTorns);
    return nextHorarisTorns;
  };

  const getReservationZones = async () => {
    if (!selectedRestaurantId) return [];
    const nextZones = await restaurantApi.getReservationZones(selectedRestaurantId);
    setZones(nextZones);
    return nextZones;
  };

  const getTaulesDisponibles = async (zoneIdOverride?: number | null) => {
    if (!selectedRestaurantId || !selectedDate || !selectedShiftName || !selectedShiftHour) return [];
    // Usamos el override si se pasa explícitamente (evita leer activeZoneId stale al cambiar zona).
    const zonaId = zoneIdOverride !== undefined ? zoneIdOverride : activeZoneId;
    const nextTaulesDisponibles = await restaurantApi.getReservationTables({
      restaurantId: selectedRestaurantId,
      data: selectedDate,
      torn: selectedShiftName,
      hora: selectedShiftHour,
      zona: zonaId,
    });
    setTaulesDisponibles(nextTaulesDisponibles);
    // Reseteamos la selección de mesa y personas al recargar las mesas.
    setSelectedTableId(null);
    setSelectedNumPeople(null);
    return nextTaulesDisponibles;
  };

  return (
    <ClientReservationContext.Provider
      value={{
        step,
        setStep,
        selectedDate,
        setSelectedDate,
        selectedShiftName,
        setSelectedShiftName,
        selectedShiftHour,
        setSelectedShiftHour,
        selectedRestaurantId,
        setSelectedRestaurantId,
        selectedRestaurantName,
        setSelectedRestaurantName,
        horarisTorns,
        getHorarisTorns,
        zones,
        activeZoneId,
        setActiveZoneId,
        getReservationZones,
        taulesDisponibles,
        getTaulesDisponibles,
        selectedTableId,
        setSelectedTableId,
        selectedNumPeople,
        setSelectedNumPeople,
      }}
    >
      {children}
    </ClientReservationContext.Provider>
  );
};
