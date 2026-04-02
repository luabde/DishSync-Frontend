import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useCreateRestaurant } from '../../hooks/createRestaurant.hook';
import { restaurantApi } from '@/api/restaurant.api';

interface Step1InfoProps {
    onValidityChange: (isValid: boolean) => void;
    submitAttempted: boolean;
}

const Step1Info: React.FC<Step1InfoProps> = ({ onValidityChange, submitAttempted }) => {
    const { formData, handleChange, photos, setPhotos } = useCreateRestaurant();
    // Guarda qué campos han perdido foco (blur) para decidir cuándo mostrar errores.
    const [touched, setTouched] = React.useState<Record<string, boolean>>({});
    // Error para nombre duplicado (validación backend por nombre).
    const [nameExistsError, setNameExistsError] = React.useState<string>('');
    // Error para dirección duplicada (validación backend por dirección).
    const [addressExistsError, setAddressExistsError] = React.useState<string>('');
    // URL temporal para previsualizar la imagen seleccionada.
    const [photoPreviewUrl, setPhotoPreviewUrl] = React.useState<string | null>(null);
    // Crea y limpia la URL temporal al cambiar la imagen.
    React.useEffect(() => {
        if (!photos[0]) {
            setPhotoPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(photos[0]);
        setPhotoPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [photos]);

    // Guarda la primera imagen seleccionada en el contexto global del wizard.
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setPhotos([e.target.files[0]]);
        e.target.value = '';
    };

    // Elimina la imagen actual del formulario.
    const removePhoto = () => {
        setPhotos([]);
    };

    // Validación de formato horario HH:mm.
    const isValidHour = (value: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
    // Validación básica de teléfono.
    const isValidPhone = (value: string) => /^\+?[0-9\s\-().]{9,20}$/.test(value.trim());

    // Calcula todos los errores visibles del paso 1.
    const fieldErrors = (() => {
        const errors: Record<string, string> = {};
        const name = formData.name.trim();
        const address = formData.address.trim();
        const phone = formData.phone.trim();
        const startTime = formData.startTime.trim();
        const endTime = formData.endTime.trim();
        const description = formData.description.trim();

        if (!name) errors.name = "El nom de l'establiment és obligatori.";
        if (!address) errors.address = "L'adreça és obligatòria.";
        if (!phone) errors.phone = "El telèfon és obligatori.";
        else if (!isValidPhone(phone)) errors.phone = "Introdueix un telèfon vàlid.";

        if (!startTime) errors.startTime = "L'hora d'inici és obligatòria.";
        else if (!isValidHour(startTime)) errors.startTime = "Format d'hora invàlid (HH:mm).";

        if (!endTime) errors.endTime = "L'hora final és obligatòria.";
        else if (!isValidHour(endTime)) errors.endTime = "Format d'hora invàlid (HH:mm).";

        if (isValidHour(startTime) && isValidHour(endTime) && startTime > endTime) {
            errors.startTime = "L'hora d'inici no pot ser posterior a la final.";
            errors.endTime = "L'hora final ha de ser igual o posterior a la d'inici.";
        }

        if (!description) errors.description = "La descripció és obligatòria.";
        if (nameExistsError) errors.name = nameExistsError;
        if (addressExistsError) errors.address = addressExistsError;

        return errors;
    })();
    const isStepValid = Object.keys(fieldErrors).length === 0;

    // Informa al padre si este paso es válido para permitir avanzar.
    React.useEffect(() => {
        onValidityChange(isStepValid);
    }, [isStepValid, onValidityChange]);

    // Muestra error si el usuario ya tocó el campo o si ya intentó enviar.
    const showError = (field: string) => submitAttempted || touched[field];
    const getInputClassName = (field: string) =>
        `w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 transition-all outline-none ${showError(field) && fieldErrors[field] ? 'ring-2 ring-red-200 focus:ring-red-200' : 'focus:ring-brand-accent2/20'}`;

    // Comprueba en backend si el nombre ya existe.
    const validateRestaurantName = React.useCallback(async (rawName: string) => {
        const name = rawName.trim();
        if (!name) {
            setNameExistsError('');
            return;
        }

        try {
            const exists = await restaurantApi.validateRestaurantNameExists(name);
            setNameExistsError(exists ? "Ja existeix un restaurant amb aquest nom." : '');
        } catch (error) {
            console.error('No se pudo validar el nombre del restaurante', error);
            setNameExistsError('No s\'ha pogut validar el nom. Torna-ho a provar.');
        }
    }, []);

    // Comprueba en backend si la dirección ya existe.
    const validateRestaurantAddress = React.useCallback(async (rawAddress: string) => {
        const address = rawAddress.trim();

        if (!address) {
            setAddressExistsError('');
            return;
        }

        try {
            const exists = await restaurantApi.validateRestaurantAddressExists(address);
            setAddressExistsError(exists ? "Ja existeix un restaurant amb aquesta adreça." : '');
        } catch (error) {
            console.error('No se pudo validar la existencia del restaurante', error);
            setAddressExistsError('No s\'ha pogut validar l\'adreça. Torna-ho a provar.');
        }
    }, []);

    // Al salir del input de nombre: marca touched y valida duplicado por nombre.
    const handleNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        setTouched(prev => ({ ...prev, name: true }));
        await validateRestaurantName(e.currentTarget.value);
    };

    // Al salir del input de dirección: marca touched y valida duplicado por dirección.
    const handleAddressBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        setTouched(prev => ({ ...prev, address: true }));
        await validateRestaurantAddress(e.currentTarget.value);
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-10">
                <h2 className="text-xl font-heading font-bold text-brand-secondary italic">Defineix la informació del local</h2>
            </div>
            <form className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Nom de l'establiment</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        onBlur={handleNameBlur}
                        placeholder="Ex: El Castell Gastrobar" 
                        className={getInputClassName('name')} 
                    />
                    {showError('name') && fieldErrors.name && <p className="text-xs text-red-500 ml-1">{fieldErrors.name}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Adreça completa</label>
                    <input 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        onBlur={handleAddressBlur}
                        placeholder="Carrer de l'Exemple, 123, 08001 Barcelona" 
                        className={getInputClassName('address')} 
                    />
                    {showError('address') && fieldErrors.address && <p className="text-xs text-red-500 ml-1">{fieldErrors.address}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Telèfon de contacte</label>
                    <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                        placeholder="+34 900 000 000" 
                        className={getInputClassName('phone')} 
                    />
                    {showError('phone') && fieldErrors.phone && <p className="text-xs text-red-500 ml-1">{fieldErrors.phone}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Horaris</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            name="startTime" 
                            value={formData.startTime} 
                            onChange={handleChange} 
                            onBlur={() => setTouched(prev => ({ ...prev, startTime: true }))}
                            placeholder="Hora d'inici" 
                            className={getInputClassName('startTime')} 
                        />
                        <input 
                            type="text" 
                            name="endTime" 
                            value={formData.endTime} 
                            onChange={handleChange} 
                            onBlur={() => setTouched(prev => ({ ...prev, endTime: true }))}
                            placeholder="Hora final" 
                            className={getInputClassName('endTime')} 
                        />
                    </div>
                    {showError('startTime') && fieldErrors.startTime && <p className="text-xs text-red-500 ml-1">{fieldErrors.startTime}</p>}
                    {showError('endTime') && fieldErrors.endTime && <p className="text-xs text-red-500 ml-1">{fieldErrors.endTime}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Foto</label>
                    <label className="relative block border-2 border-dashed border-gray-200 rounded-2xl p-10 bg-[#F5F5F5]/50 group hover:bg-[#F5F5F5] hover:border-brand-accent2/30 transition-all cursor-pointer">
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                        {photoPreviewUrl && photos[0] ? (
                            <div className="relative h-56 w-full rounded-xl overflow-hidden">
                                <img src={photoPreviewUrl} alt={photos[0].name} className="h-full w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removePhoto();
                                    }}
                                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white text-xs font-bold hover:bg-black/80 transition-colors"
                                >
                                    x
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 h-40">
                                <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                    <ImageIcon className="h-6 w-6 text-brand-gray/40 group-hover:text-brand-accent2 transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[11px] text-brand-gray/60 leading-relaxed">Fes clic o arrossega una imatge aquí <br/><span className="opacity-60 text-[10px] uppercase font-bold">Format: JPG, PNG (Max. 5MB)</span></p>
                                </div>
                            </div>
                        )}
                    </label>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Descripció</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
                        placeholder="Explica breument de què tracta l'establiment..." 
                        rows={4} 
                        className={`${getInputClassName('description')} resize-none`} 
                    />
                    {showError('description') && fieldErrors.description && <p className="text-xs text-red-500 ml-1">{fieldErrors.description}</p>}
                </div>
            </form>
        </div>
    );
};

export default Step1Info;
