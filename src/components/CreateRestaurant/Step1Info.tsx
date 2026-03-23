import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface Step1InfoProps {
    formData: {
        name: string;
        address: string;
        phone: string;
        startTime: string;
        endTime: string;
        description: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const Step1Info: React.FC<Step1InfoProps> = ({ formData, handleChange }) => {
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
                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 bg-[#F5F5F5]/50 group hover:bg-[#F5F5F5] hover:border-brand-accent2/30 transition-all cursor-pointer">
                        <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                            <ImageIcon className="h-6 w-6 text-brand-gray/40 group-hover:text-brand-accent2 transition-colors" />
                        </div>
                        <div className="text-center">
                            <p className="text-[11px] text-brand-gray/60 leading-relaxed">Fes clic o arrossega una imatge aquí <br/><span className="opacity-60 text-[10px] uppercase font-bold">Format: JPG, PNG (Max. 5MB)</span></p>
                        </div>
                    </div>
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
