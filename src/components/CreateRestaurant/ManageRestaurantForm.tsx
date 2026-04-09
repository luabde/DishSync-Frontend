import FormField from '../common/FormField';
import { Button } from '../Button';

// Imagen de respaldo para la cabecera visual del formulario.
// Se usa cuando el restaurante aún no tiene foto persistida.
const FORM_IMAGE_URL = 'https://www.figma.com/api/mcp/asset/c0c71527-8dfd-4b0c-b92a-dcdacc6e4215';

// Contrato de datos que recibe el formulario de edición.
// Mantiene solo campos necesarios para renderizar el estado inicial.
export type ManageRestaurantData = {
    id: number;
    nom: string;
    direccio: string;
    telefon: string;
    horaris: string;
    descripcio: string | null;
    url: string | null;
};

type ManageRestaurantFormProps = {
    // Restaurante precargado desde la pantalla de listado.
    restaurant: ManageRestaurantData;
};

// Convierte "08:30 - 23:30" en dos valores para inputs separados.
// Si el formato no llega completo, evita undefined con valores vacíos.
const splitSchedule = (schedule: string) => {
    const [start = '', end = ''] = schedule.split('-').map((value) => value.trim());
    return { start, end };
};

export default function ManageRestaurantForm({ restaurant }: ManageRestaurantFormProps) {
    // Horario dividido para mantener la composición visual del diseño.
    const { start, end } = splitSchedule(restaurant.horaris);
    const sharedInputClassName =
        'w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 transition-all outline-none focus:ring-brand-accent2/20';

    return (
        // El formulario va centrado en todo momento (desktop/tablet/mobile).
        <section className="mx-auto w-full max-w-[801px] rounded-ds-md bg-ds-bg-elevated p-5 shadow-ds-table sm:p-8 lg:p-10">
            <div className="mx-auto flex w-full max-w-[731px] flex-col items-center gap-6 sm:gap-[25px]">
                <h3 className="text-center font-ds-display text-xl font-bold text-ds-brand-copper sm:text-2xl">
                    Informació del local
                </h3>

                {/* Estructura visual del formulario (sin lógica de submit por ahora). */}
                <form className="w-full space-y-6">
                    {/* Banner superior del restaurante. */}
                    <div className="h-[180px] overflow-hidden rounded-ds-lg border-2 border-slate-200 sm:h-[260px] sm:rounded-xl lg:h-[300px]">
                        <img
                            // Si no hay imagen, mostramos fallback de diseño.
                            src={restaurant.url || FORM_IMAGE_URL}
                            alt={`Imatge del restaurant ${restaurant.nom}`}
                            className="size-full object-cover"
                        />
                    </div>

                    <div className="space-y-5">
                        {/* Campos reutilizando componente común FormField */}
                        <FormField
                            label="Nom de l'establiment"
                            defaultValue={restaurant.nom}
                            inputClassName={sharedInputClassName}
                        />

                        <FormField
                            label="Adreça completa"
                            defaultValue={restaurant.direccio}
                            inputClassName={sharedInputClassName}
                        />

                        <FormField
                            label="Telèfon de contacte"
                            defaultValue={restaurant.telefon}
                            inputClassName={sharedInputClassName}
                        />

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Horaris</label>
                            {/* Responsive: una columna en móvil, dos en >= sm */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                <input
                                    defaultValue={start}
                                    className={sharedInputClassName}
                                />
                                <input
                                    defaultValue={end}
                                    className={sharedInputClassName}
                                />
                            </div>
                        </div>

                        <FormField
                            as="textarea"
                            rows={5}
                            label="Descripció"
                            defaultValue={restaurant.descripcio ?? ''}
                            placeholder="Explica breument de què tracta l'establiment..."
                            inputClassName={`${sharedInputClassName} resize-none`}
                        />
                    </div>
                </form>

                <Button
                    type="button"
                    variant="outline"
                    fullWidth={false}
                    className="w-full max-w-[249px] rounded-ds-md border-2 border-ds-brand-wine! text-ds-brand-wine! bg-transparent! px-4 py-4 font-ds-sans! text-base! font-bold! uppercase tracking-[2px] hover:bg-ds-brand-wine! hover:text-white!"
                >
                    Confirmar
                </Button>
            </div>
        </section>
    );
}
