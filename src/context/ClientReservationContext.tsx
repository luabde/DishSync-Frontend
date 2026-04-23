import React, { createContext, useState, type ReactNode} from "react";
import { restaurantApi, type ReservationTableAvailabilityDTO } from "../api/restaurant.api";

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
  // Restaurante elegido desde la home para iniciar la reserva.
  selectedRestaurantId: number | null;
  setSelectedRestaurantId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedRestaurantName: string;
  setSelectedRestaurantName: React.Dispatch<React.SetStateAction<string>>;
  // Horarios agrupados por turno, p.ej. { "Comida": ["13:00","13:30"] }.
  horarisTorns: Record<string, string[]>;
  // Carga turnos/horas del restaurante seleccionado y los guarda en contexto.
  getHorarisTorns: () => Promise<Record<string, string[]>>;
  getTaulesDisponibles: () => Promise<ReservationTableAvailabilityDTO[]>;
  taulesDisponibles: ReservationTableAvailabilityDTO[];
}

export const ClientReservationContext = createContext<ClientReservationContextValue | null>(null);

/**
 * Contexto base del wizard de reserva para cliente.
 * Centraliza el estado compartido de todos los steps:
 * restaurante, fecha, turno/hora y catálogo de horarios.
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

  const [taulesDisponibles, setTaulesDisponibles] = useState<ReservationTableAvailabilityDTO[]>([]);

  const getHorarisTorns = async () => {
    // Sin restaurante no podemos pedir horarios: devolvemos objeto vacío.
    if (!selectedRestaurantId) return {};
    // Llamada al endpoint de reservas del restaurante seleccionado.
    const nextHorarisTorns = await restaurantApi.getReservationsForm(selectedRestaurantId);
    // Guardamos en contexto para reutilizar en Steps posteriores.
    setHorarisTorns(nextHorarisTorns);
    return nextHorarisTorns;
  };

  const getTaulesDisponibles = async () => {
    if (!selectedRestaurantId || !selectedDate || !selectedShiftName || !selectedShiftHour) return [];
    const nextTaulesDisponibles = await restaurantApi.getReservationTables({
      restaurantId: selectedRestaurantId,
      data: selectedDate,
      torn: selectedShiftName,
      hora: selectedShiftHour,
      zona: null,
    });
    setTaulesDisponibles(nextTaulesDisponibles);
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
        getTaulesDisponibles,
        taulesDisponibles
      }}
    >
      {children}
    </ClientReservationContext.Provider>
  );
};
