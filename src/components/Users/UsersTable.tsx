import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';
import type { RestaurantListItemDTO } from '../../api/restaurant.api';

type DashboardUser = {
  id: number;
  nom: string;
  cognoms: string;
  email: string;
  rol: 'ADMIN' | 'CAMBRER' | 'RESPONSABLE';
  estat: 'ACTIU' | 'INACTIU';
  id_restaurant: number | null;
  restaurant: { nom: string } | null;
};

type UsersTableProps = {
  users: DashboardUser[];
  restaurants: RestaurantListItemDTO[];
  onSaveUser: (
    userId: number,
    payload: {
      nom: string;
      cognoms: string;
      email: string;
      rol: 'ADMIN' | 'CAMBRER' | 'RESPONSABLE';
      estat: 'ACTIU' | 'INACTIU';
      restaurant: number | null;
    },
  ) => Promise<void>;
  onDeleteUser: (user: DashboardUser) => void;
  savingUserId?: number | null;
  deletingUserId?: number | null;
};

// Genera iniciales para un avatar textual simple cuando no hay imagen de perfil.
function getAvatarLetters(nom: string, cognoms: string) {
  const first = nom.trim().charAt(0) || '';
  const second = cognoms.trim().charAt(0) || '';
  return `${first}${second}`.toUpperCase() || 'U';
}

export function UsersTable({ users, restaurants, onSaveUser, onDeleteUser, savingUserId, deletingUserId }: UsersTableProps) {
  // Fila actualmente en modo edición inline.
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  // Estado local de inputs/selects que se renderizan dentro de los <td>.
  const [editForm, setEditForm] = useState({
    nom: '',
    cognoms: '',
    email: '',
    rol: 'CAMBRER' as 'ADMIN' | 'CAMBRER' | 'RESPONSABLE',
    estat: 'ACTIU' as 'ACTIU' | 'INACTIU',
    restaurant: '',
  });
  const [editError, setEditError] = useState('');

  // Activa edición y precarga valores actuales del usuario en los controles de la fila.
  const beginEdit = (user: DashboardUser) => {
    setEditError('');
    setEditingUserId(user.id);
    setEditForm({
      nom: user.nom,
      cognoms: user.cognoms,
      email: user.email,
      rol: user.rol,
      estat: user.estat,
      restaurant: user.id_restaurant ? String(user.id_restaurant) : '',
    });
  };

  const cancelEdit = () => {
    setEditError('');
    setEditingUserId(null);
  };

  // Validación mínima antes de llamar al backend.
  const validateEdit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editForm.nom.trim() || !editForm.cognoms.trim() || !editForm.email.trim()) {
      return 'Nombre, apellidos y email son obligatorios.';
    }
    if (!emailRegex.test(editForm.email.trim())) {
      return 'Formato de email inválido.';
    }
    return '';
  };

  // Guarda cambios de la fila editada usando callback del contenedor (UsersManagement).
  const submitEdit = async () => {
    if (!editingUserId) return;
    const validationError = validateEdit();
    if (validationError) {
      setEditError(validationError);
      return;
    }
    try {
      setEditError('');
      await onSaveUser(editingUserId, {
        nom: editForm.nom.trim(),
        cognoms: editForm.cognoms.trim(),
        email: editForm.email.trim(),
        rol: editForm.rol,
        estat: editForm.estat,
        restaurant: editForm.restaurant ? Number(editForm.restaurant) : null,
      });
      setEditingUserId(null);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'No se pudo guardar el usuario');
    }
  };

  return (
    <table className="w-full min-w-[760px] border-collapse text-left">
      <thead>
        <tr className="bg-ds-table-header-bg">
          <th className="px-6 py-4 font-ds-ui text-xs font-semibold uppercase tracking-[0.6px] text-ds-ui-muted">Empleado</th>
          <th className="px-6 py-4 font-ds-ui text-xs font-semibold uppercase tracking-[0.6px] text-ds-ui-muted">Cargo</th>
          <th className="px-6 py-4 font-ds-ui text-xs font-semibold uppercase tracking-[0.6px] text-ds-ui-muted">
            <span className="block">Restaurante</span>
            <span className="block">asignado</span>
          </th>
          <th className="px-6 py-4 font-ds-ui text-xs font-semibold uppercase tracking-[0.6px] text-ds-ui-muted">Estado</th>
          <th className="px-6 py-4 text-right font-ds-ui text-xs font-semibold uppercase tracking-[0.6px] text-ds-ui-muted">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {/* La tabla solo pinta filas; la paginación y filtros viven en la página. */}
        {users.map((user, index) => (
          <tr key={user.id} className={index > 0 ? 'border-t border-ds-row-divider' : ''}>
            <td className="px-6 py-5">
              {/* Este <td> cambia entre vista y edición inline según editingUserId. */}
              {editingUserId === user.id ? (
                <div className="space-y-2">
                  <input
                    value={editForm.nom}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, nom: e.target.value }))}
                    className="w-full rounded border border-ds-input-border px-2 py-1.5 font-ds-ui text-xs"
                    placeholder="Nombre"
                  />
                  <input
                    value={editForm.cognoms}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, cognoms: e.target.value }))}
                    className="w-full rounded border border-ds-input-border px-2 py-1.5 font-ds-ui text-xs"
                    placeholder="Apellidos"
                  />
                  <input
                    value={editForm.email}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded border border-ds-input-border px-2 py-1.5 font-ds-ui text-xs"
                    placeholder="Email"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-ds-brand-wine font-ds-ui text-[11px] font-bold text-white">
                    {getAvatarLetters(user.nom, user.cognoms)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-ds-ui text-sm font-semibold text-[#1f2937]">{user.nom} {user.cognoms}</p>
                    <p className="truncate font-ds-ui text-xs text-ds-ui-muted">{user.email}</p>
                  </div>
                </div>
              )}
            </td>
            <td className="px-6 py-5">
              {/* Cargo: badge en modo lectura, select en modo edición. */}
              {editingUserId === user.id ? (
                <select
                  value={editForm.rol}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, rol: e.target.value as 'ADMIN' | 'CAMBRER' | 'RESPONSABLE' }))}
                  className="w-full rounded border border-ds-input-border bg-white px-2 py-1.5 font-ds-ui text-xs"
                >
                  <option value="CAMBRER">CAMBRER</option>
                  <option value="RESPONSABLE">RESPONSABLE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              ) : (
                <UserRoleBadge role={user.rol} />
              )}
            </td>
            <td className="px-6 py-5 font-ds-ui text-sm text-ds-wine-70">
              {/* Restaurante: texto en lectura, selector (incluyendo "Sin asignar") en edición. */}
              {editingUserId === user.id ? (
                <select
                  value={editForm.restaurant}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, restaurant: e.target.value }))}
                  className="w-full rounded border border-ds-input-border bg-white px-2 py-1.5 font-ds-ui text-xs"
                >
                  <option value="">Sin asignar</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.nom}
                    </option>
                  ))}
                </select>
              ) : (
                user.restaurant?.nom ?? 'Sense assignar'
              )}
            </td>
            <td className="px-6 py-5">
              {/* Estado: badge en lectura, select en edición. */}
              {editingUserId === user.id ? (
                <select
                  value={editForm.estat}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, estat: e.target.value as 'ACTIU' | 'INACTIU' }))}
                  className="w-full rounded border border-ds-input-border bg-white px-2 py-1.5 font-ds-ui text-xs"
                >
                  <option value="ACTIU">ACTIU</option>
                  <option value="INACTIU">INACTIU</option>
                </select>
              ) : (
                <UserStatusBadge status={user.estat} />
              )}
            </td>
            <td className="px-6 py-5">
              <div className="flex justify-end gap-3 text-ds-ui-muted">
                {editingUserId === user.id ? (
                  <>
                    {/* Guardar cambios de la fila editada. */}
                    <button
                      type="button"
                      onClick={() => void submitEdit()}
                      disabled={savingUserId === user.id}
                      className="p-1.5 transition-colors hover:text-green-600 disabled:opacity-40"
                      title="Guardar"
                    >
                      <Check className="size-3.5" />
                    </button>
                    {/* Cancelar edición y restaurar vista de solo lectura. */}
                    <button type="button" onClick={cancelEdit} className="p-1.5 hover:text-red-500 transition-colors" title="Cancelar">
                      <X className="size-3.5" />
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => beginEdit(user)} className="p-1.5 hover:text-ds-brand-copper transition-colors" title="Editar">
                    <Pencil className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteUser(user)}
                  // No se permite eliminar la fila mientras está en edición.
                  disabled={deletingUserId === user.id || editingUserId === user.id}
                  className={`p-1.5 transition-colors ${(deletingUserId === user.id || editingUserId === user.id) ? 'opacity-40 cursor-not-allowed' : 'hover:text-red-500'}`}
                  title="Eliminar"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              {editingUserId === user.id && editError && (
                <p className="mt-2 text-right font-ds-ui text-xs text-red-600">{editError}</p>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export type { DashboardUser };
