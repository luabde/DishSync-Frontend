import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../hooks/auth.hook';
import { StaffSidebar } from '../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../navigation/staffSidebarNav';
import { usuarisApi, type DashboardUserDTO } from '../api/usuaris.api';
import { UsersFiltersBar, type UserRoleFilter, type UserStatusFilter } from '../components/Users/UsersFiltersBar';
import { UsersTable, type DashboardUser } from '../components/Users/UsersTable';

const PAGE_SIZE = 5;

export default function UsersManagement() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('TOTS');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('TOTS');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<DashboardUser | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const sidebarNavItems = getSidebarNavItems(user?.rol);

  useEffect(() => {
    // Carga inicial de usuarios para el dashboard de gestión.
    // Se transforma la respuesta a un shape estable para la UI.
    const loadUsers = async () => {
      try {
        const data: DashboardUserDTO[] = await usuarisApi.getAllUsers();
        setUsers(data.map((item) => ({
          id: item.id,
          nom: item.nom,
          cognoms: item.cognoms,
          email: item.email,
          rol: item.rol,
          estat: item.estat,
          restaurant: item.restaurant ? { nom: item.restaurant.nom } : null,
        })));
      } catch (error) {
        console.error('No se pudieron obtener los usuarios', error);
      }
    };

    void loadUsers();
  }, []);

  useEffect(() => {
    // Bloquea scroll del body cuando el sidebar móvil está abierto.
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  // Filtros en cliente: búsqueda por nombre/email/rol + filtros por rol y estado.
  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filteredUsers = users.filter((item) => {
    const fullName = `${item.nom} ${item.cognoms}`.toLowerCase();
    const matchesSearch =
      normalizedQuery.length === 0 ||
      fullName.includes(normalizedQuery) ||
      item.email.toLowerCase().includes(normalizedQuery) ||
      item.rol.toLowerCase().includes(normalizedQuery);
    const matchesRole = roleFilter === 'TOTS' || item.rol === roleFilter;
    const matchesStatus = statusFilter === 'TOTS' || item.estat === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Paginación del resultado ya filtrado.
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  const visibleCount = paginatedUsers.length;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  useEffect(() => {
    // Corrige la página actual si cambia el total (ej: al filtrar).
    if (totalPages === 0 && currentPage !== 1) setCurrentPage(1);
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    // Al cambiar filtros, empezamos desde la primera página.
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const handleDeleteUser = (selectedUser: DashboardUser) => {
    setDeleteError('');
    setUserToDelete(selectedUser);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setDeletingUserId(userToDelete.id);
      await usuarisApi.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((userItem) => userItem.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (error) {
      console.error('No se pudo eliminar el usuario', error);
      setDeleteError('No se pudo eliminar el usuario. Inténtalo de nuevo.');
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-ds-bg-page font-ds-sans text-ds-fg-default antialiased">
      <StaffSidebar
        navItems={sidebarNavItems}
        userDisplayName={user?.nom ?? ''}
        userRoleLabel={getRoleDisplayLabel(user?.rol)}
        onLogout={() => void logout()}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col border-l border-black/5">
        <header className="relative shrink-0 border-b-2 border-ds-brand-wine bg-ds-canvas">
          <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:h-[105px] lg:flex-row lg:items-center lg:gap-0 lg:px-10 lg:py-0 lg:pl-[80px]">
            <div className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 lg:h-full lg:min-h-0">
              <button
                type="button"
                className="flex size-11 shrink-0 items-center justify-center rounded-ds-sm border border-ds-brand-wine/30 text-ds-brand-wine lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-expanded={sidebarOpen}
                aria-controls="staff-sidebar-mobile"
                aria-label="Obrir menú"
              >
                <Menu className="size-6" />
              </button>
              <h1 className="min-w-0 font-ds-display text-xl font-semibold leading-none tracking-wide text-ds-brand-wine sm:text-2xl lg:text-[28.8px] lg:tracking-[2px]">
                Carta
              </h1>
            </div>
            <button
              type="button"
              // Pendiente: abrir modal/página de alta de usuario.
              className="w-full shrink-0 rounded-ds-sm border-2 border-ds-brand-wine px-3 py-2.5 font-ds-sans text-[11px] font-bold leading-none tracking-[1.5px] text-ds-brand-wine uppercase sm:px-3.5 sm:py-3.5 sm:text-[12.8px] lg:absolute lg:right-10 lg:top-1/2 lg:w-auto lg:-translate-y-1/2"
            >
              Nuevo Usuario
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-9 lg:pt-9">
          <h2 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Gestionar usuarios
          </h2>
          <p className="mt-3 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
            Control de menús i gestió de plats.
          </p>

          <UsersFiltersBar
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            onSearchTermChange={setSearchTerm}
            onRoleFilterChange={setRoleFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <div className="mt-6 w-full max-w-[915px] overflow-hidden rounded-ds-table border border-ds-card-border bg-ds-bg-elevated shadow-ds-table sm:mt-8">
            <div className="-mx-px overflow-x-auto sm:mx-0">
              {/* Tabla desacoplada: solo renderiza filas recibidas. */}
              <UsersTable users={paginatedUsers} onDeleteUser={handleDeleteUser} deletingUserId={deletingUserId} />
            </div>
            <div className="flex flex-col items-center justify-center gap-4 border-t border-ds-row-divider bg-ds-table-header-bg px-4 py-5 sm:flex-row sm:justify-between sm:px-6 sm:py-6">
              <p className="text-center font-ds-sans text-xs font-medium text-ds-wine-40 sm:text-left">
                Mostrant {filteredUsers.length ? `${visibleCount} de ${filteredUsers.length}` : '0'} empleats
              </p>
              <div className="hidden items-center gap-1 sm:flex">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={totalPages === 0 || safeCurrentPage === 1}
                  className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  aria-label="Pàgina anterior"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex size-8 items-center justify-center rounded font-ds-sans text-xs font-bold ${page === safeCurrentPage
                      ? 'bg-ds-brand-wine text-white'
                      : 'border border-ds-pagination-border bg-ds-bg-elevated text-ds-brand-wine'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      totalPages === 0 ? prev : Math.min(totalPages, prev + 1))
                  }
                  disabled={totalPages === 0 || safeCurrentPage === totalPages}
                  className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}`}
                  aria-label="Pàgina següent"
                >
                  <ChevronRight className="size-3.5 text-ds-brand-wine" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-ds-lg bg-ds-bg-elevated p-6 shadow-ds-table">
            <h3 className="font-ds-display text-2xl font-bold text-ds-brand-wine">Eliminar usuario</h3>
            <p className="mt-3 font-ds-sans text-sm text-ds-wine-70">
              ¿Seguro que quieres eliminar a <span className="font-semibold">{userToDelete.nom} {userToDelete.cognoms}</span>?
            </p>
            {deleteError ? (
              <p className="mt-3 font-ds-sans text-xs text-red-500">{deleteError}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (deletingUserId) return;
                  setDeleteError('');
                  setUserToDelete(null);
                }}
                className="rounded-ds-sm border border-ds-pagination-border px-4 py-2 font-ds-sans text-xs font-semibold text-ds-brand-wine"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={deletingUserId === userToDelete.id}
                className={`rounded-ds-sm px-4 py-2 font-ds-sans text-xs font-semibold text-white ${deletingUserId === userToDelete.id ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {deletingUserId === userToDelete.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
