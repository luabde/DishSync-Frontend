import { useContext } from "react";
import { ClientReservationContext } from "../context/ClientReservationContext";

/**
 * Hook de acceso al contexto del wizard de reserva de cliente.
 * Sigue el mismo patrón que los hooks de contexto existentes.
 */
export const useClientReservation = () => {
  const context = useContext(ClientReservationContext);
  if (!context) throw new Error("useClientReservation debe usarse dentro de ClientReservationProvider");
  return context;
};
