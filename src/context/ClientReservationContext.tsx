import React, { createContext, useState, type ReactNode} from "react";
import { restaurantApi } from "../api/restaurant.api";

interface ClientReservationContextValue {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  selectedRestaurantId: number | null;
  setSelectedRestaurantId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedRestaurantName: string;
  setSelectedRestaurantName: React.Dispatch<React.SetStateAction<string>>;
  horarisTorns: Record<string, string[]>;
  getHorarisTorns: () => Promise<Record<string, string[]>>;
}

export const ClientReservationContext = createContext<ClientReservationContextValue | null>(null);

/**
 * Contexto base del wizard de reserva para cliente.
 * De momento solo persiste fecha para compartirla entre pasos.
 */
export const ClientReservationProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [selectedRestaurantName, setSelectedRestaurantName] = useState("");
  const [horarisTorns, setHorarisTorns] = useState<Record<string, string[]>>({});

  const getHorarisTorns = async () => {
    if (!selectedRestaurantId) return {};
    const nextHorarisTorns = await restaurantApi.getReservationsForm(selectedRestaurantId);
    setHorarisTorns(nextHorarisTorns);
    return nextHorarisTorns;
  };

  return (
    <ClientReservationContext.Provider
      value={{
        step,
        setStep,
        selectedDate,
        setSelectedDate,
        selectedRestaurantId,
        setSelectedRestaurantId,
        selectedRestaurantName,
        setSelectedRestaurantName,
        horarisTorns,
        getHorarisTorns,
      }}
    >
      {children}
    </ClientReservationContext.Provider>
  );
};
