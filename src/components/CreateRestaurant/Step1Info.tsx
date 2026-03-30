import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useCreateRestaurant } from '../../hooks/createRestaurant.hook';

const Step1Info: React.FC = () => {
    const { formData, handleChange, photos, setPhotos } = useCreateRestaurant();
    const photoPreview = React.useMemo(() => {
        if (!photos[0]) return null;
        return { file: photos[0], url: URL.createObjectURL(photos[0]) };
    }, [photos]);

    React.useEffect(() => {
        return () => {
            if (photoPreview) URL.revokeObjectURL(photoPreview.url);
        };
    }, [photoPreview]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setPhotos([e.target.files[0]]);
        e.target.value = '';
    };

    const removePhoto = () => {
        setPhotos([]);
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
                        placeholder="Ex: El Castell Gastrobar" 
                        className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-brand-accent2/20 transition-all outline-none" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Adreça completa</label>
                    <input 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        placeholder="Carrer de l'Exemple, 123, 08001 Barcelona" 
                        className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-brand-accent2/20 transition-all outline-none" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Telèfon de contacte</label>
                    <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="+34 900 000 000" 
                        className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-brand-accent2/20 transition-all outline-none" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">Horaris</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            name="startTime" 
                            value={formData.startTime} 
                            onChange={handleChange} 
                            placeholder="Hora d'inici" 
                            className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-brand-accent2/20 transition-all outline-none" 
                        />
                        <input 
                            type="text" 
                            name="endTime" 
                            value={formData.endTime} 
                            onChange={handleChange} 
                            placeholder="Hora final" 
                            className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-brand-accent2/20 transition-all outline-none" 
                        />
                    </div>
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
                        {photoPreview ? (
                            <div className="relative h-56 w-full rounded-xl overflow-hidden">
                                <img src={photoPreview.url} alt={photoPreview.file.name} className="h-full w-full object-cover" />
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
                        placeholder="Explica breument de què tracta l'establiment..." 
                        rows={4} 
                        className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-brand-accent2/20 transition-all outline-none resize-none" 
                    />
                </div>
            </form>
        </div>
    );
};

export default Step1Info;
