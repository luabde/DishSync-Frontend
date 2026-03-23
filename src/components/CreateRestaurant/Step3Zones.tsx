import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';

interface Zone {
    id: string;
    name: string;
}

interface Step3ZonesProps {
    zones: Zone[];
    newZoneName: string;
    setNewZoneName: (name: string) => void;
    addZone: () => void;
    removeZone: (id: string) => void;
}

const Step3Zones: React.FC<Step3ZonesProps> = ({ 
    zones, 
    newZoneName, 
    setNewZoneName, 
    addZone, 
    removeZone 
}) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="text-center mb-10">
                <h2 className="text-xl font-heading font-bold text-brand-secondary italic">Defineix les Zones</h2>
            </div>
            <div className="flex gap-4 mb-10">
                <input 
                    type="text" 
                    value={newZoneName} 
                    onChange={(e) => setNewZoneName(e.target.value)} 
                    placeholder="Ex: Terrassa, Planta Baixa..." 
                    className="flex-1 bg-[#F5F5F5] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-brand-accent2/20 transition-all outline-none" 
                />
                <button 
                    onClick={addZone} 
                    className="bg-[#4A1A12] text-white px-8 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#3d150f] transition-colors shadow-lg shadow-brand-primary/10 whitespace-nowrap"
                >
                    + Afegir Zona
                </button>
            </div>
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-[#F5F5F5] px-6 py-4 flex justify-between items-center border-b border-gray-100">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gray/40">Nom de la zona</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gray/40">Accions</span>
                </div>
                <div className="divide-y divide-gray-50">
                    {zones.map((zone) => (
                        <div key={zone.id} className="bg-white px-6 py-5 flex justify-between items-center group hover:bg-brand-primary/[0.02] transition-colors">
                            <span className="text-sm font-bold text-brand-primary tracking-wide">{zone.name}</span>
                            <div className="flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 text-brand-gray hover:text-brand-accent2 transition-colors">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => removeZone(zone.id)} className="p-1.5 text-brand-gray hover:text-red-400 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {zones.length === 0 && (
                        <div className="px-6 py-12 text-center text-brand-gray/30 italic text-sm">No s'ha definit cap zona encara.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step3Zones;
