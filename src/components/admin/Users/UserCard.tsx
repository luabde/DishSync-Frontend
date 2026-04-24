import { Pencil, Trash2, Mail, Building2 } from 'lucide-react';
import { StatusBadge } from '../../common/StatusBadge';

type UserCardProps = {
  user: {
    id: number;
    nom: string;
    cognoms: string;
    email: string;
    rol: 'ADMIN' | 'CAMBRER' | 'RESPONSABLE';
    estat: 'ACTIU' | 'INACTIU';
    restaurant: { nom: string } | null;
  };
  onEdit: (id: number) => void;
  onDelete: (user: any) => void;
};

function getAvatarLetters(nom: string, cognoms: string) {
  const first = nom.trim().charAt(0) || '';
  const second = cognoms.trim().charAt(0) || '';
  return `${first}${second}`.toUpperCase() || 'U';
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return 'Admin';
      case 'CAMBRER': return 'Cambrer';
      case 'RESPONSABLE': return 'Responsable';
      default: return rol;
    }
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-ds-card-border bg-ds-bg-elevated shadow-ds-card transition-all hover:shadow-ds-card-hover">
      <div className="relative flex h-24 shrink-0 items-center justify-center bg-ds-table-header-bg">
        <div className="flex size-14 items-center justify-center rounded-full bg-ds-brand-wine shadow-lg ring-4 ring-white">
          <span className="font-ds-ui text-lg font-bold text-white">
            {getAvatarLetters(user.nom, user.cognoms)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-6">
        <div className="text-left">
          <div className="mb-1">
            <span className="font-ds-sans text-[10px] font-bold uppercase tracking-wider text-ds-wine-40">
              {getRoleLabel(user.rol)}
            </span>
          </div>
          <h3 className="font-ds-sans text-base font-bold uppercase tracking-tight text-ds-brand-wine">
            {user.nom} {user.cognoms}
          </h3>
          <div className="mt-2 flex flex-col items-start gap-1.5">
            <StatusBadge status={user.estat} className="shrink-0" />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2.5 font-ds-sans text-xs text-ds-wine-70">
            <Mail className="size-3.5 shrink-0 text-ds-brand-copper" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2.5 font-ds-sans text-xs text-ds-wine-70">
            <Building2 className="size-3.5 shrink-0 text-ds-brand-copper" />
            <span className="truncate">{user.restaurant?.nom ?? 'Sense assignar'}</span>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2 border-t border-ds-row-divider pt-4">
            <button
              onClick={() => onEdit(user.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ds-brand-copper px-2 py-2 font-ds-sans text-[10px] font-bold uppercase tracking-[1px] text-ds-brand-copper transition-colors hover:bg-ds-brand-copper hover:text-white"
            >
              <Pencil className="size-3" />
              Editar
            </button>
            <button
              onClick={() => onDelete(user)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500 px-2 py-2 font-ds-sans text-[10px] font-bold uppercase tracking-[1px] text-red-500 transition-colors hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="size-3" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
