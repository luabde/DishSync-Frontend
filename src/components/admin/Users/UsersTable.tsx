import { Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserStatusBadge } from './UserStatusBadge';
import { ManagementTable } from '../../common/ManagementTable';

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
  footer?: React.ReactNode;
};

function getAvatarLetters(nom: string, cognoms: string) {
  const first = nom.trim().charAt(0) || '';
  const second = cognoms.trim().charAt(0) || '';
  return `${first}${second}`.toUpperCase() || 'U';
}

export function UsersTable({ users, onDeleteUser, deletingUserId, footer }: UsersTableProps) {
  const navigate = useNavigate();

  const headers = [
    'Empleat',
    'Càrrec',
    (
      <span key="restaurant">
        <span className="block">Restaurant</span>
        <span className="block">assignat</span>
      </span>
    ),
    'Estat',
    'Accions'
  ];

  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return 'Admin';
      case 'CAMBRER': return 'Cambrer';
      case 'RESPONSABLE': return 'Responsable';
      default: return rol;
    }
  };

  return (
    <ManagementTable
      headers={headers}
      tableClassName="min-w-[760px]"
      footer={footer}
    >
      {users.map((user) => (
        <tr key={user.id}>
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

          <td className="px-6 py-5">
            <span className="font-ds-sans text-xs font-medium text-ds-wine-70">
              {getRoleLabel(user.rol)}
            </span>
          </td>

          <td className="px-6 py-5 font-ds-ui text-sm text-ds-wine-70">
            {user.restaurant?.nom ?? 'Sense assignar'}
          </td>

          <td className="px-6 py-5">
            <UserStatusBadge status={user.estat} />
          </td>

          <td className="px-6 py-5">
            <div className="flex justify-end gap-3 text-ds-ui-muted">
              <button
                type="button"
                onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                className="p-1.5 hover:text-ds-brand-copper transition-colors"
                title="Editar usuari"
              >
                <Pencil className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDeleteUser(user)}
                disabled={deletingUserId === user.id}
                className={`p-1.5 transition-colors ${deletingUserId === user.id
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
    </ManagementTable>
  );
}

export type { DashboardUser };
