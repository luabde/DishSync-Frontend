import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Plus, MapPin, Star, Settings, ExternalLink, UtensilsCrossed } from 'lucide-react';

// Mock data for restaurants
const MOCK_RESTAURANTS = [
    {
        id: 1,
        name: "El Castell de l'Empordà",
        type: "Mediterránea / Gourmet",
        location: "La Bisbal d'Empordà",
        rating: 4.8,
        status: "Activo",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 2,
        name: "La Brasa del Port",
        type: "Asador / Marisquería",
        location: "Palamós",
        rating: 4.5,
        status: "Activo",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 3,
        name: "Sushy Sync",
        type: "Japonesa / Fusión",
        location: "Girona Centro",
        rating: 4.9,
        status: "Mantenimiento",
        image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&q=80&w=800",
    }
];

export default function Dashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-brand-body font-body text-brand-gray">
            {/* Navigation Bar */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="bg-brand-primary p-2 rounded-xl">
                                <UtensilsCrossed className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-heading font-bold text-brand-primary leading-tight">DishSync</h1>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-secondary">Admin Console</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-semibold text-brand-primary italic">
                                    {user?.name}
                                </span>
                                <span className="text-[11px] text-brand-gray/70 uppercase tracking-wider">
                                    {user?.role} de la Cadena
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="group flex items-center justify-center p-2 rounded-full hover:bg-red-50 transition-all duration-300"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="h-5 w-5 text-brand-gray group-hover:text-red-500 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-heading font-bold text-brand-primary">Gestión de Restaurantes</h2>
                        <p className="text-brand-gray/60 max-w-xl">
                            Administra los establecimientos de tu cadena, supervisa su estado y configura nuevos puntos de venta.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/restaurants/new')}
                        className="inline-flex items-center gap-2 bg-brand-secondary text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-brand-secondary/20 hover:bg-brand-secondary/90 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Nuevo Restaurante</span>
                    </button>
                </div>

                {/* Restaurants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_RESTAURANTS.map((restaurant) => (
                        <div 
                            key={restaurant.id} 
                            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-accent2/30 transition-all duration-500"
                        >
                            {/* Image Placeholder/Background */}
                            <div className="relative h-48 overflow-hidden">
                                <img 
                                    src={restaurant.image} 
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md backdrop-blur-md ${
                                        restaurant.status === 'Activo' 
                                        ? 'bg-green-500/80 text-white' 
                                        : 'bg-amber-500/80 text-white'
                                    }`}>
                                        {restaurant.status}
                                    </span>
                                    <div className="flex items-center gap-1 text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold">
                                        <Star className="h-3 w-3 fill-brand-accent2 text-brand-accent2" />
                                        {restaurant.rating}
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                <div className="mb-4">
                                    <h3 className="text-xl font-heading font-bold text-brand-primary mb-1 group-hover:text-brand-accent2 transition-colors">
                                        {restaurant.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-brand-gray/60 text-sm">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {restaurant.location}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-6 text-xs font-medium text-brand-secondary/80 bg-brand-secondary/5 px-3 py-1.5 rounded-lg w-fit">
                                    <LayoutDashboard className="h-3.5 w-3.5" />
                                    {restaurant.type}
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-primary/5 text-brand-primary px-4 py-2.5 rounded-lg font-medium hover:bg-brand-primary hover:text-white transition-all duration-300">
                                        <ExternalLink className="h-4 w-4" />
                                        Gestionar
                                    </button>
                                    <button className="p-2.5 rounded-lg text-brand-gray/40 hover:text-brand-primary hover:bg-gray-100 transition-all duration-300">
                                        <Settings className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State / Add New Placeholder */}
                    <button 
                        onClick={() => navigate('/restaurants/new')}
                        className="group border-2 border-dashed border-brand-gray/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-brand-gray/40 hover:border-brand-secondary/50 hover:bg-brand-secondary/5 transition-all duration-500 min-h-[400px]"
                    >
                        <div className="bg-gray-50 p-4 rounded-full group-hover:scale-110 transition-transform duration-500">
                            <Plus className="h-8 w-8 text-brand-gray/30 group-hover:text-brand-secondary transition-colors" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg group-hover:text-brand-secondary transition-colors">Añadir Restaurante</p>
                            <p className="text-sm opacity-60">Expandir la cadena DishSync</p>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
}

