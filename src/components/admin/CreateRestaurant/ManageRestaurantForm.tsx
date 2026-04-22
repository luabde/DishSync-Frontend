import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormField from '../../common/FormField';
import { Button } from '../../Button';
import { restaurantApi } from '../../../api/restaurant.api';

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
    descripcio: string | null;
    url: string | null;
};

type ManageRestaurantFormProps = {
    // Restaurante precargado desde la pantalla de listado.
    restaurant: ManageRestaurantData;
};

export default function ManageRestaurantForm({ restaurant }: ManageRestaurantFormProps) {
    const navigate = useNavigate();
    const sharedInputClassName =
        'w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 transition-all outline-none focus:ring-brand-accent2/20';
    // Archivo seleccionado para la nueva imagen.
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [name, setName] = useState(restaurant.nom);
    const [address, setAddress] = useState(restaurant.direccio);
    const [phone, setPhone] = useState(restaurant.telefon);
    const [description, setDescription] = useState(restaurant.descripcio ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    // Data URL (base64) para mostrar preview de la imagen subida.
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    // Este efecto se ejecuta cada vez que cambia `selectedFile`.
    // Su objetivo es preparar una "preview" de la imagen sin subirla todavía al backend.
    useEffect(() => {
        // Si no hay fichero seleccionado, limpiamos la preview local.
        if (!selectedFile) {
            setPhotoPreviewUrl(null);
            return;
        }

        // FileReader permite leer el fichero local desde el navegador.
        const reader = new FileReader();
        // `onload` se dispara cuando termina la lectura asíncrona del archivo.
        reader.onload = () => {
            // `reader.result` puede tener distintos tipos; solo usamos string (base64).
            if (typeof reader.result === 'string') {
                // Guardamos la preview para pintarla en <img src={photoPreviewUrl} />.
                setPhotoPreviewUrl(reader.result);
                // Si el usuario había marcado la imagen como eliminada, se revierte ese estado
                // porque acaba de seleccionar una nueva.
                setImageRemoved(false);
            }
        };
        // Convierte el fichero a Data URL (base64), útil para previsualización local.
        reader.readAsDataURL(selectedFile);
    }, [selectedFile]);

    // Permite "quitar" la imagen actual del restaurante a nivel visual.
    const [imageRemoved, setImageRemoved] = useState(false);

    useEffect(() => {
        setName(restaurant.nom);
        setAddress(restaurant.direccio);
        setPhone(restaurant.telefon);
        setDescription(restaurant.descripcio ?? '');
        setSelectedFile(null);
        setPhotoPreviewUrl(null);
        setImageRemoved(false);
        setSubmitError(null);
    }, [restaurant]);

    // Prioridad de imagen:
    // 1) preview local recién subida
    // 2) imagen guardada del restaurante (si no se ha marcado como eliminada)
    // Si no hay ninguna, mostramos estado vacío de subida.
    const displayedImage = photoPreviewUrl || (!imageRemoved ? restaurant.url : null);
    const hasVisibleImage = Boolean(displayedImage);

    // Elimina la imagen visible: si había preview se quita; si no, se oculta la imagen actual.
    const removePhoto = () => {
        setSelectedFile(null);
        setPhotoPreviewUrl(null);
        setImageRemoved(true);
    };

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSaving) return;

        setSubmitError(null);

        try {
            setIsSaving(true);
            await restaurantApi.updateRestaurant({
                id: restaurant.id,
                nom: name.trim(),
                direccio: address.trim(),
                telefon: phone.trim(),
                descripcio: description.trim(),
                // Si se marca eliminación, enviamos url vacía para que backend la quite.
                url: imageRemoved ? '' : (restaurant.url ?? ''),
                imageFile: selectedFile ?? undefined,
            });
            navigate('/restaurants');
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'No s\'ha pogut actualitzar el restaurant.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        // El formulario va centrado en todo momento (desktop/tablet/mobile).
        <section className="mx-auto w-full max-w-[801px] rounded-ds-md bg-ds-bg-elevated p-5 shadow-ds-table sm:p-8 lg:p-10">
            <div className="mx-auto flex w-full max-w-[731px] flex-col items-center gap-6 sm:gap-[25px]">
                <h3 className="text-center font-ds-display text-xl font-bold text-ds-brand-copper sm:text-2xl">
                    Informació del local
                </h3>

                {/* Estructura visual del formulario (sin lógica de submit por ahora). */}
                <form id="manage-restaurant-form" className="w-full space-y-6" onSubmit={(event) => void handleSubmit(event)}>
                    <div className="space-y-5">
                        {/* Bloque de foto con preview, cambio y eliminación igual que en crear. */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Foto</label>
                            <label className="relative block border-2 border-dashed border-gray-200 rounded-2xl p-10 bg-[#F5F5F5]/50 group hover:bg-[#F5F5F5] hover:border-brand-accent2/30 transition-all cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={(event) => {
                                        // Tomamos solo el primer fichero seleccionado.
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        // Dispara el useEffect de arriba para generar preview base64.
                                        setSelectedFile(file);
                                        // Asegura que la nueva imagen sea visible aunque antes se hubiese "eliminado".
                                        setImageRemoved(false);
                                        // Limpia el input para poder volver a seleccionar el mismo archivo.
                                        event.target.value = '';
                                    }}
                                    className="hidden"
                                />
                                {hasVisibleImage ? (
                                    <div className="relative h-56 w-full rounded-xl overflow-hidden">
                                        <img
                                            src={displayedImage ?? FORM_IMAGE_URL}
                                            alt={`Imatge del restaurant ${restaurant.nom}`}
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                // Evita que al clicar la "x" se abra el selector de archivos
                                                // (el botón está dentro de un <label> clicable).
                                                event.preventDefault();
                                                event.stopPropagation();
                                                // Limpia preview local y oculta la imagen actual.
                                                removePhoto();
                                            }}
                                            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white text-xs font-bold hover:bg-black/80 transition-colors"
                                            aria-label="Eliminar imatge"
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
                                            <p className="text-[11px] text-brand-gray/60 leading-relaxed">
                                                Fes clic o arrossega una imatge aquí <br />
                                                <span className="opacity-60 text-[10px] uppercase font-bold">Format: JPG, PNG (Max. 5MB)</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Campos reutilizando componente común FormField */}
                        <FormField
                            label="Nom de l'establiment"
                            name="nom"
                            value={name}
                            onChange={(event) => setName(event.currentTarget.value)}
                            inputClassName={sharedInputClassName}
                        />

                        <FormField
                            label="Adreça completa"
                            name="direccio"
                            value={address}
                            onChange={(event) => setAddress(event.currentTarget.value)}
                            inputClassName={sharedInputClassName}
                        />

                        <FormField
                            label="Telèfon de contacte"
                            name="telefon"
                            value={phone}
                            onChange={(event) => setPhone(event.currentTarget.value)}
                            inputClassName={sharedInputClassName}
                        />

                        <FormField
                            as="textarea"
                            rows={5}
                            label="Descripció"
                            name="descripcio"
                            value={description}
                            onChange={(event) => setDescription(event.currentTarget.value)}
                            placeholder="Explica breument de què tracta l'establiment..."
                            inputClassName={`${sharedInputClassName} resize-none`}
                        />
                        {submitError ? <p className="text-sm text-red-500">{submitError}</p> : null}
                    </div>
                    <button type="submit" className="hidden" aria-hidden="true" />
                </form>

                <Button
                    type="submit"
                    form="manage-restaurant-form"
                    variant="outline"
                    fullWidth={false}
                    disabled={isSaving}
                    className="w-full max-w-[249px] rounded-ds-md border-2 border-ds-brand-wine! text-ds-brand-wine! bg-transparent! px-4 py-4 font-ds-sans! text-base! font-bold! uppercase tracking-[2px] hover:bg-ds-brand-wine! hover:text-white!"
                >
                    {isSaving ? 'Guardant...' : 'Confirmar'}
                </Button>
            </div>
        </section>
    );
}
