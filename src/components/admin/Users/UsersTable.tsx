import { Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';

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
  onDeleteUser: (user: DashboardUser) => void;
  deletingUserId?: number | null;
};

// Genera inicials per a un avatar textual simple quan no hi ha imatge de perfil.
function getAvatarLetters(nom: string, cognoms: string) {
  const first = nom.trim().charAt(0) || '';
  const second = cognoms.trim().charAt(0) || '';
  return `${first}${second}`.toUpperCase() || 'U';
}

export function UsersTable({ users, onDeleteUser, deletingUserId }: UsersTableProps) {
  const navigate = useNavigate();

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
          <th className="px-6 py-4 text-right font-ds-ui text-xs font-semibold uppercase tracking-[0.6px] text-ds-ui-muted">Accions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => (
          <tr key={user.id} className={index > 0 ? 'border-t border-ds-row-divider' : ''}>
            {/* Columna: nom + email amb avatar */}
            <td className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-ds-brand-wine font-ds-ui text-[11px] font-bold text-white">
                  {getAvatarLetters(user.nom, user.cognoms)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-ds-ui text-sm font-semibold text-[#1f2937]">
                    {user.nom} {user.cognoms}
                  </p>
                  <p className="truncate font-ds-ui text-xs text-ds-ui-muted">{user.email}</p>
                </div>
              </div>
            </td>

            {/* Columna: rol */}
            <td className="px-6 py-5">
              <UserRoleBadge role={user.rol} />
            </td>

            {/* Columna: restaurant assignat */}
            <td className="px-6 py-5 font-ds-ui text-sm text-ds-wine-70">
              {user.restaurant?.nom ?? 'Sense assignar'}
            </td>

            {/* Columna: estat */}
            <td className="px-6 py-5">
              <UserStatusBadge status={user.estat} />
            </td>

            {/* Columna: accions */}
            <td className="px-6 py-5">
              <div className="flex justify-end gap-3 text-ds-ui-muted">
                {/* Botó editar: navega a la pàgina de formulari dedicat */}
                <button
                  type="button"
                  onClick={() => navigate(`/users/${user.id}/edit`)}
                  className="p-1.5 hover:text-ds-brand-copper transition-colors"
                  title="Editar usuari"
                >
                  <Pencil className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteUser(user)}
                  disabled={deletingUserId === user.id}
                  className={`p-1.5 transition-colors ${
                    deletingUserId === user.id
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:text-red-500'
                  }`}
                  title="Eliminar usuari"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export type { DashboardUser };
