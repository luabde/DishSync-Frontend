import React, { createContext, useState, type ReactNode} from "react";

interface ClientReservationContextValue {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  selectedRestaurantId: number | null;
  setSelectedRestaurantId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedRestaurantName: string;
  setSelectedRestaurantName: React.Dispatch<React.SetStateAction<string>>;
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
      }}
    >
      {children}
    </ClientReservationContext.Provider>
  );
};
