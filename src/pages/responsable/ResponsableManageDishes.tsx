import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth.hook';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';
import { platsApi, resolvePlatImageUrl, type RestaurantMenuDTO } from '../../api/plats.api';
import { usuarisApi } from '../../api/usuaris.api';
import { AvailabilityFiltersBar } from '../../components/responsable/dishes/AvailabilityFiltersBar';
import {
  DishAvailabilityCard,
  type DishAvailabilityItem,
} from '../../components/responsable/dishes/DishAvailabilityCard';
import { DishesPagination } from '../../components/admin/Dishes/DishesPagination';

const PAGE_SIZE = 6;

export default function ResponsableManageDishes() {
  // Datos del usuario autenticado y acción para cerrar sesión.
  const { user, logout } = useAuth();
  // Controla la apertura/cierre del sidebar en móvil.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Lista de restaurantes con sus platos recibida desde API.
  const [restaurants, setRestaurants] = useState<RestaurantMenuDTO[]>([]);
  // Texto libre para filtrar platos por nombre, categoría o descripción.
  const [searchTerm, setSearchTerm] = useState('');
  // Categoría seleccionada en el filtro (TOTES = mostrar todas).
  const [categoryFilter, setCategoryFilter] = useState('TOTES');
  // Estado de disponibilidad seleccionado (todos/disponible/no disponible).
  const [stateFilter, setStateFilter] = useState('TOTS');
  // Página actual del listado paginado de platos.
  const [currentPage, setCurrentPage] = useState(1);
  // Mensaje de error para mostrar feedback si falla una petición.
  const [error, setError] = useState('');
  // Identificador único del plato que se está actualizando en este momento.
  const [updatingDishKey, setUpdatingDishKey] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError('');
        // Primero obtenemos el id del restaurante que el usuario (responsable) tiene asignado.
        // Y tambien hacemos una llamada a la API para obtener la lista de todos los restaurantes con sus platos
        const [assignedRestaurant, restaurantsMenu] = await Promise.all([
          usuarisApi.getMyAssignedRestaurant(),
          platsApi.getRestaurantsMenu(),
        ]);
        // Cuando no tenemos el id, mostramos mensaje de error
        if (!assignedRestaurant.id_restaurant) {
          setRestaurants([]);
          setError('Aquest usuari no té cap restaurant assignat.');
          return;
        }
        // De los restaurantes + platos obtenidos, filtramos para mostrar unicamente el restaurante que tiene asignado el usuario (responsable)
        const visibleRestaurant = restaurantsMenu.filter(
          (restaurant) => restaurant.id === assignedRestaurant.id_restaurant,
        );

        // Guardamos el estado del restaurante ya filtrado
        setRestaurants(visibleRestaurant);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No s’ha pogut carregar les dades');
      }
    };

    void loadData();
  }, []);

  // Nos guardamos el restaurante seleccionado y los platos que tiene asignados con sus datos
  const selectedRestaurant = restaurants[0];
  const dishItems: DishAvailabilityItem[] = selectedRestaurant
    ? selectedRestaurant.plats.map((plat) => ({
        id: plat.id,
        idRestaurant: selectedRestaurant.id,
        nom: plat.nom,
        descripcio: plat.descripcio ?? '',
        categoria: plat.categoria?.nom ?? 'Sense categoria',
        preu: typeof plat.preu === 'number' ? plat.preu : Number.parseFloat(plat.preu),
        imageUrl: resolvePlatImageUrl(plat.url),
        disponibilitat: plat.disponibilitat,
      }))
    : [];

  const categoryOptions = [
    { value: 'TOTES', label: 'Totes les categories' },
    ...Array.from(new Set(dishItems.map((dish) => dish.categoria))).map((category) => ({
      value: category,
      label: category,
    })),
  ];

  const query = searchTerm.trim().toLowerCase();
  const filteredDishItems = dishItems.filter((dish) => {
    const matchesSearch =
      query.length === 0 ||
      dish.nom.toLowerCase().includes(query) ||
      dish.descripcio.toLowerCase().includes(query) ||
      dish.categoria.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === 'TOTES' || dish.categoria === categoryFilter;
    const matchesState =
      stateFilter === 'TOTS' ||
      (stateFilter === 'DISPONIBLE' && dish.disponibilitat) ||
      (stateFilter === 'NO_DISPONIBLE' && !dish.disponibilitat);

    return matchesSearch && matchesCategory && matchesState;
  });

  const totalPages = Math.ceil(filteredDishItems.length / PAGE_SIZE);
  const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const paginatedDishItems = filteredDishItems.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const handleAvailabilityChange = async (dish: DishAvailabilityItem, nextValue: boolean) => {
    const key = `${dish.idRestaurant}:${dish.id}`;
    try {
      setError('');
      setUpdatingDishKey(key);
      await platsApi.updatePlatAvailability({
        idRestaurant: dish.idRestaurant,
        idPlat: dish.id,
        disponibilitat: nextValue,
      });

      setRestaurants((prev) =>
        prev.map((restaurant) =>
          restaurant.id === dish.idRestaurant
            ? {
                ...restaurant,
                plats: restaurant.plats.map((plat) =>
                  plat.id === dish.id ? { ...plat, disponibilitat: nextValue } : plat,
                ),
              }
            : restaurant,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'No s’ha pogut actualitzar la disponibilitat del plat',
      );
    } finally {
      setUpdatingDishKey(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-ds-bg-page font-ds-sans antialiased">
      <StaffSidebar
        navItems={getSidebarNavItems(user?.rol)}
        userDisplayName={user?.nom ?? ''}
        userRoleLabel={getRoleDisplayLabel(user?.rol)}
        onLogout={() => void logout()}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* HEADER */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col border-l border-black/5">
        <header className="sticky top-0 z-20 shrink-0 border-b-2 border-ds-brand-wine bg-ds-canvas">
          <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:h-[105px] lg:px-10 lg:py-0">
            <h1 className="min-w-0 font-ds-display text-lg font-semibold leading-none tracking-wide text-ds-brand-wine sm:text-2xl lg:text-[40px] lg:tracking-[2px]">
              Carta
            </h1>
          </div>
        </header>

        {/* MAIN Titulo gestionar plats */}
        <main className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-9 lg:pt-9">
          <h2 className="text-center font-ds-display text-xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
            Gestionar plats
          </h2>
          <p className="mt-3 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
            Control de menús i gestió de plats.
          </p>

          {/* Barra de filtros */}
          <AvailabilityFiltersBar
            searchTerm={searchTerm}
            selectedCategory={categoryFilter}
            categoryOptions={categoryOptions}
            selectedState={stateFilter}
            stateOptions={[
              { value: 'TOTS', label: 'Estat: Tots' },
              { value: 'DISPONIBLE', label: 'Estat: Disponible' },
              { value: 'NO_DISPONIBLE', label: 'Estat: No disponible' },
            ]}
            onSearchTermChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            onCategoryChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1);
            }}
            onStateChange={(value) => {
              setStateFilter(value);
              setCurrentPage(1);
            }}
          />

          {/* Mensaje de error se muesrta, en caso de que haya */}
          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

          {/* Section de los platos */}
          <section className="mt-8 w-full max-w-[960px]">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedDishItems.map((dish) => (
                <DishAvailabilityCard
                  key={`${dish.idRestaurant}-${dish.id}`}
                  dish={dish}
                  isUpdating={updatingDishKey === `${dish.idRestaurant}:${dish.id}`}
                  onAvailabilityChange={handleAvailabilityChange}
                />
              ))}
            </div>
          </section>

          <DishesPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            visibleItems={paginatedDishItems.length}
            totalItems={filteredDishItems.length}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </div>
  );
}
