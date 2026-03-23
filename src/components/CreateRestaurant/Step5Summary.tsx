import React from 'react';
import { CheckCircle, MapPin, Phone, Clock, Layers, Users } from 'lucide-react';

interface Step5SummaryProps {
    formData: {
        name: string;
        address: string;
        phone: string;
        description: string;
    };
    shifts: { name: string, times: string[] }[];
    zones: { id: string, name: string }[];
    tables: Record<string, { type: 2 | 4 | 6 | 8 | 10 }[]>;
}

const Step5Summary: React.FC<Step5SummaryProps> = ({ formData, shifts, zones, tables }) => {
    const totalTables = Object.values(tables).flat().length;
    const totalCapacity = Object.values(tables).flat().reduce((acc, t) => acc + t.type, 0);

    return (
        <div className="animate-in fade-in duration-700 max-w-2xl mx-auto">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-heading font-black text-[#4A1A12] mb-2 uppercase tracking-tighter text-center">Revisa i Confirma</h2>
                <p className="text-brand-gray/40 font-medium">Tot a punt per donar d'alta el teu restaurant</p>
            </div>

            <div className="space-y-8">
                {/* Basic Info */}
                <div className="bg-[#F9F7F2]/50 rounded-[2.5rem] p-8 border border-gray-50">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray/20 mb-6 flex items-center gap-3">
                        <MapPin className="h-3 w-3" /> Informació General
                    </h3>
                    <div className="space-y-4">
                        <p className="text-2xl font-heading font-bold text-brand-primary">{formData.name || 'Sense nom'}</p>
                        <p className="text-sm text-brand-gray/60 leading-relaxed flex items-center gap-2 italic">
                            {formData.address || 'Sense adreça'}
                        </p>
                        <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-brand-gray/40 uppercase tracking-widest">
                                <Phone className="h-3 w-3" /> {formData.phone || 'Sense telèfon'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray/20 mb-6 flex items-center gap-3">
                            <Clock className="h-3 w-3" /> Serveis
                        </h3>
                        <div className="space-y-3">
                            {shifts.map((s, i) => (
                                <div key={i} className="flex justify-between items-center bg-[#F9F7F2]/40 rounded-xl px-4 py-3">
                                    <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">{s.name}</span>
                                    <span className="text-[10px] font-black text-brand-gray/30">{s.times.length} hores</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray/20 mb-6 flex items-center gap-3">
                            <Layers className="h-3 w-3" /> Espais
                        </h3>
                        <div className="space-y-2">
                            <div className="text-3xl font-heading font-black text-brand-primary italic">{zones.length} <span className="text-xs uppercase font-bold tracking-widest text-brand-gray/20 not-italic ml-1">Zones</span></div>
                            <div className="text-3xl font-heading font-black text-brand-primary italic">{totalTables} <span className="text-xs uppercase font-bold tracking-widest text-brand-gray/20 not-italic ml-1">Taules</span></div>
                        </div>
                    </div>
                </div>

                {/* Capacity Card */}
                <div className="bg-[#4A1A12] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-brand-primary/20 relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Capacitat Total</p>
                            <h4 className="text-5xl font-heading font-black tracking-tighter italic">{totalCapacity} <span className="text-xl not-italic font-medium opacity-60 ml-2">comensals</span></h4>
                        </div>
                        <Users className="h-16 w-16 opacity-10" />
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                </div>
            </div>
        </div>
    );
};

export default Step5Summary;
