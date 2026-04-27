import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { useCreateRestaurant } from '../../../hooks/createRestaurant.hook';
import FormField from '../../common/FormField';


const Step3Zones: React.FC = () => {
    const { zones, newZoneName, setNewZoneName, addZone, removeZone, updateZoneName } = useCreateRestaurant();
    const [editingZoneId, setEditingZoneId] = React.useState<string | null>(null);
    const [draftZoneName, setDraftZoneName] = React.useState('');
    // Error visible para validaciones de nombre duplicado.
    const [zoneError, setZoneError] = React.useState('');

    // Normaliza para comparar ignorando mayúsculas/minúsculas y espacios extremos.
    const normalizeZoneName = (name: string) => name.trim().toUpperCase();

    // Reutilizable para alta y edición; excluye la zona actual cuando se renombra.
    const isDuplicateZoneName = (name: string, currentZoneId?: string) => {
        const normalizedName = normalizeZoneName(name);
        return zones.some((zone) => {
            if (currentZoneId && zone.id === currentZoneId) return false;
            return normalizeZoneName(zone.name) === normalizedName;
        });
    };

    const startEditZone = (zoneId: string, currentName: string) => {
        setZoneError('');
        setEditingZoneId(zoneId);
        setDraftZoneName(currentName);
    };

    // Guarda el nuevo nombre solo si no colisiona con otra zona existente.
    const saveZoneName = () => {
        if (!editingZoneId) return;
        const cleanName = draftZoneName.trim();
        if (cleanName) {
            if (isDuplicateZoneName(cleanName, editingZoneId)) {
                setZoneError('Ja existeix una zona amb aquest nom.');
                return;
            }
            updateZoneName(editingZoneId, cleanName.toUpperCase());
            setZoneError('');
        }
        setEditingZoneId(null);
        setDraftZoneName('');
    };

    // Alta de zona con validación previa de duplicados en frontend.
    const handleAddZone = () => {
        const cleanName = newZoneName.trim();
        if (!cleanName) return;

        if (isDuplicateZoneName(cleanName)) {
            setZoneError('Ja existeix una zona amb aquest nom.');
            return;
        }

        setZoneError('');
        addZone();
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="flex gap-4 mb-10">
                <div className="flex-1">
                    <FormField
                        label=""
                        type="text"
                        value={newZoneName}
                        onChange={(e) => {
                            setNewZoneName(e.target.value);
                            if (zoneError) setZoneError('');
                        }}
                        placeholder="Ex: Terrassa, Planta Baixa..."
                        className="space-y-0"
                        labelClassName="hidden"
                        inputClassName="focus:ring-brand-accent2/20"
                    />
                </div>
                <button 
                    onClick={handleAddZone} 
                    className="bg-[#4A1A12] text-white px-8 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#3d150f] transition-colors shadow-lg shadow-brand-primary/10 whitespace-nowrap"
                >
                    + Afegir Zona
                </button>
            </div>
            {zoneError && <p className="text-xs text-red-500 ml-1 mb-6">{zoneError}</p>}
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-[#F5F5F5] px-6 py-4 flex justify-between items-center border-b border-gray-100">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gray/40">Nom de la zona</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gray/40">Accions</span>
                </div>
                <div className="divide-y divide-gray-50">
                    {zones.map((zone) => (
                        <div key={zone.id} className="bg-white px-6 py-5 flex justify-between items-center group hover:bg-brand-primary/2 transition-colors">
                            {editingZoneId === zone.id ? (
                                <FormField
                                    label=""
                                    value={draftZoneName}
                                    onChange={(e) => {
                                        setDraftZoneName(e.target.value);
                                        if (zoneError) setZoneError('');
                                    }}
                                    onBlur={saveZoneName}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveZoneName();
                                        if (e.key === 'Escape') {
                                            setEditingZoneId(null);
                                            setDraftZoneName('');
                                            setZoneError('');
                                        }
                                    }}
                                    autoFocus
                                    className="space-y-0"
                                    labelClassName="hidden"
                                    inputClassName="text-sm font-bold text-brand-primary tracking-wide bg-transparent border-b border-brand-accent2/40 rounded-none px-0 py-0 focus:outline-none"
                                />
                            ) : (
                                <span className="text-sm font-bold text-brand-primary tracking-wide">{zone.name}</span>
                            )}
                            <div className="flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditZone(zone.id, zone.name)} className="p-1.5 text-brand-gray hover:text-brand-accent2 transition-colors">
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
