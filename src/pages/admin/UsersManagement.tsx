import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hook';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import { usuarisApi, type DashboardUserDTO } from '../../api/usuaris.api';
import { UsersFiltersBar, type UserRoleFilter, type UserStatusFilter } from '../../components/admin/Users/UsersFiltersBar';
import { UsersTable, type DashboardUser } from '../../components/admin/Users/UsersTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { UserCard } from '../../components/admin/Users/UserCard';

const PAGE_SIZE = 8;

export default function UsersManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('TOTS');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('TOTS');
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<'TABLE' | 'GRID'>('TABLE');
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<DashboardUser | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const sidebarNavItems = getSidebarNavItems(user?.rol);

  const loadUsers = async () => {
    const data: DashboardUserDTO[] = await usuarisApi.getAllUsers();
    setUsers(data.map((item) => ({
      id: item.id,
      nom: item.nom,
      cognoms: item.cognoms,
      email: item.email,
      rol: item.rol,
      estat: item.estat,
      restaurant: item.restaurant ? { nom: item.restaurant.nom } : null,
      id_restaurant: item.id_restaurant,
    })));
  };

  useEffect(() => {
    const boot = async () => {
      try {
        await loadUsers();
      } catch (error) {
        console.error("No s'han pogut obtenir els usuaris", error);
      }
    };
    void boot();
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

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

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  const visibleCount = paginatedUsers.length;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) setCurrentPage(1);
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
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
      console.error("No s'ha pogut eliminar l'usuari", error);
      setDeleteError("No s'ha pogut eliminar l'usuari. Torna-ho a intentar.");
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
        <header className="sticky top-0 z-20 shrink-0 border-b-2 border-ds-brand-wine bg-ds-canvas">
          <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:h-[88px] lg:flex-row lg:items-center lg:gap-0 lg:px-10 lg:py-0 lg:pl-[120px]">
            <div className="flex min-h-[36px] min-w-0 flex-1 items-center gap-2.5 lg:h-full lg:min-h-0">
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-ds-sm text-ds-brand-wine lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </button>
              <h1 className="min-w-0 font-ds-display text-lg font-semibold leading-none tracking-wide text-ds-brand-wine sm:text-2xl lg:text-[26px] lg:tracking-[2px]">
                Usuaris
              </h1>
            </div>
            <button
              onClick={() => navigate('/users/new')}
              className="flex size-9 shrink-0 items-center justify-center rounded-[5px] border-2 border-ds-brand-wine font-ds-sans text-ds-brand-wine uppercase transition-colors hover:bg-ds-brand-wine hover:text-white lg:static lg:right-auto lg:top-auto lg:h-auto lg:w-auto lg:translate-y-0 lg:px-[24px] lg:py-[11px] lg:text-[12px] lg:font-bold lg:leading-none lg:tracking-[1.2px] lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2"
            >
              <span className="hidden lg:inline">Nou Usuari</span>
              <Plus className="size-5 lg:hidden" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-9 lg:pt-9">
          <h2 className="text-center font-ds-display text-xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Gestionar usuaris
          </h2>
          <p className="mt-3 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
            Control d'empleats i gestió d'accessos.
          </p>

          <UsersFiltersBar
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            onSearchTermChange={setSearchTerm}
            onRoleFilterChange={setRoleFilter}
            onStatusFilterChange={setStatusFilter}
            view={view}
            onViewChange={setView}
          />

          {view === 'TABLE' ? (
            <div className="mt-10 w-full max-w-[1000px]">
              <UsersTable
                users={paginatedUsers}
                onDeleteUser={handleDeleteUser}
                deletingUserId={deletingUserId}
                footer={
                  <div className="flex flex-col items-center justify-center gap-4 px-4 py-5 sm:flex-row sm:justify-between sm:px-6 sm:py-6">
                    <p className="text-center font-ds-sans text-xs font-medium text-ds-wine-40 sm:text-left">
                      Mostrant {filteredUsers.length ? `${visibleCount} de ${filteredUsers.length}` : '0'} empleats
                    </p>
                    <div className="hidden items-center gap-1 sm:flex">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={totalPages === 0 || safeCurrentPage === 1}
                        className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
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
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={totalPages === 0 || safeCurrentPage === totalPages}
                        className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <ChevronRight className="size-3.5 text-ds-brand-wine" />
                      </button>
                    </div>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="mt-10 w-full max-w-[1000px]">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedUsers.map((u) => (
                  <UserCard
                    key={u.id}
                    user={u}
                    onEdit={(id) => navigate(`/users/${id}/edit`)}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-ds-table border border-ds-card-border bg-ds-bg-elevated px-4 py-5 shadow-ds-table sm:flex-row sm:justify-between sm:px-6 sm:py-6">
                <p className="text-center font-ds-sans text-xs font-medium text-ds-wine-40 sm:text-left">
                  Mostrant {filteredUsers.length ? `${visibleCount} de ${filteredUsers.length}` : '0'} usuaris
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={totalPages === 0 || safeCurrentPage === 1}
                    className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
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
                        : 'border border-ds-pagination-border bg-ds-bg-elevated text-ds-brand-wine'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={totalPages === 0 || safeCurrentPage === totalPages}
                    className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || safeCurrentPage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <ChevronRight className="size-3.5 text-ds-brand-wine" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <footer className="mt-10 w-full max-w-3xl border-t border-ds-footer-rule pt-6 text-center font-ds-ui text-xs text-ds-ui-muted sm:mt-16 sm:pt-8 sm:text-sm">
            <p>
                Necessites ajuda per configurar el teu establiment?{' '}
                <a href="#" className="font-semibold text-ds-brand-gold hover:underline">
                    Contacta amb suport tècnic
                </a>
            </p>
          </footer>
        </div>
      </div>
      <ConfirmDialog
        title="Eliminar usuari"
        description={userToDelete ? `Segur que vols eliminar a ${userToDelete.nom} ${userToDelete.cognoms}?` : ''}
        isOpen={Boolean(userToDelete)}
        isLoading={Boolean(userToDelete && deletingUserId === userToDelete.id)}
        errorMessage={deleteError}
        overlayClassName="lg:left-[300px]"
        confirmText="Eliminar"
        cancelText="Cancel·lar"
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          if (deletingUserId) return;
          setDeleteError('');
          setUserToDelete(null);
        }}
      />
    </div>
  );
}
