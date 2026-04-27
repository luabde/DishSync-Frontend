import React from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useCreateRestaurant } from '../../../hooks/createRestaurant.hook';
import FormField from '../../common/FormField';


/**
 * Paso 5: asignación de usuarios al restaurante.
 * - Izquierda: usuarios disponibles con botón añadir/quitar.
 * - Derecha: usuarios seleccionados.
 */
interface Step5UsersProps {
  onValidityChange: (isValid: boolean) => void;
  submitAttempted: boolean;
}

const Step5Users: React.FC<Step5UsersProps> = ({ onValidityChange, submitAttempted }) => {
  const { availableUsers, selectedUsers, toggleUserSelection } = useCreateRestaurant();
  const [query, setQuery] = React.useState('');
  // Reglas mínimas de asignación de personal para habilitar el avance.
  const hasWaiter = selectedUsers.some((user) => user.rol === 'CAMBRER');
  const hasManager = selectedUsers.some((user) => user.rol === 'RESPONSABLE');
  const isStepValid = hasWaiter && hasManager;

  const filteredUsers = availableUsers.filter((user) => {
    const fullName = `${user.nom} ${user.cognoms}`.toLowerCase();
    const role = user.rol.toLowerCase();
    const q = query.toLowerCase().trim();
    return fullName.includes(q) || role.includes(q) || user.email.toLowerCase().includes(q);
  });

  const selectedIds = new Set(selectedUsers.map((u) => u.id));

  // Propaga la validez al wizard para bloquear/desbloquear "Continuar".
  React.useEffect(() => {
    onValidityChange(isStepValid);
  }, [isStepValid, onValidityChange]);

  return (
    <div className="animate-in fade-in duration-500">


      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
        <section className="bg-[#F5F5F5]/50 rounded-2xl p-5 border border-gray-100">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray/40" />
            <FormField
              label=""
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar empleados..."
              className="space-y-0"
              labelClassName="hidden"
              inputClassName="bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 focus:ring-brand-accent2/20"
            />
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gray/40 mb-3">Empleados disponibles</p>

          <div className="space-y-2 max-h-[320px] overflow-auto custom-scrollbar pr-1">
            {filteredUsers.map((user) => {
              const isSelected = selectedIds.has(user.id);
              return (
                <div key={user.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-primary truncate">{user.nom} {user.cognoms}</p>
                    <p className="text-[10px] uppercase tracking-wide text-brand-gray/40">{user.rol}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleUserSelection(user)}
                    className={`px-3 py-1 border rounded text-[10px] font-black uppercase tracking-[0.15em] ${
                      isSelected
                        ? 'border-red-300 text-red-500 bg-red-50'
                        : 'border-[#4A1A12]/30 text-[#4A1A12] bg-white'
                    }`}
                  >
                    {isSelected ? 'Quitar' : 'Añadir'}
                  </button>
                </div>
              );
            })}
            {filteredUsers.length === 0 && (
              <p className="text-xs text-brand-gray/50 italic py-4 text-center">No hay usuarios para mostrar.</p>
            )}
          </div>
        </section>

        <aside className="bg-[#F5F5F5]/80 rounded-2xl p-5 border border-gray-100">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gray/40 mb-3">
            Personal seleccionado ({selectedUsers.length})
          </p>
          <div className="space-y-2 max-h-[320px] overflow-auto custom-scrollbar pr-1">
            {selectedUsers.map((user) => (
              <div key={user.id} className="bg-white border border-gray-100 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-primary truncate">{user.nom} {user.cognoms}</p>
                  <p className="text-[10px] uppercase tracking-wide text-brand-gray/40">{user.rol}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleUserSelection(user)}
                  className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label={`Quitar ${user.nom} ${user.cognoms}`}
                  title="Quitar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {selectedUsers.length === 0 && (
              <p className="text-xs text-brand-gray/50 italic py-4 text-center">Aún no has seleccionado usuarios.</p>
            )}
          </div>
        </aside>
      </div>
      {submitAttempted && !isStepValid && (
        <p className="text-xs text-red-500 mt-4">
          Has d'assignar com a mínim un cambrer i un responsable per continuar.
        </p>
      )}
    </div>
  );
};

export default Step5Users;
