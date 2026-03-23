import React from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

interface Shift {
    id: string;
    name: string;
    times: string[];
}

interface Step2ShiftsProps {
    shifts: Shift[];
    addShift: () => void;
    removeShift: (id: string) => void;
    addTime: (shiftId: string) => void;
    removeTime: (shiftId: string, timeIndex: number) => void;
}

const Step2Shifts: React.FC<Step2ShiftsProps> = ({ 
    shifts, 
    addShift, 
    removeShift, 
    addTime, 
    removeTime 
}) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-2">
                <h2 className="text-xl font-heading font-bold text-brand-secondary italic">Configuració de torns i hores de reserva</h2>
            </div>
            <div className="text-center max-w-lg mx-auto mb-8">
                <p className="text-[13px] text-brand-gray/50 leading-relaxed">Define los horarios disponibles para que tus clientes realicen reservas. Organiza tus servicios por turnos y especifica las horas exactas de entrada.</p>
            </div>
            <div className="flex justify-center mb-10">
                <button onClick={addShift} className="inline-flex items-center gap-2 bg-[#4A1A12] text-white px-6 py-2.5 rounded-xl font-semibold text-xs hover:bg-[#3d150f] transition-colors shadow-lg shadow-brand-primary/10">
                    <Plus className="h-4 w-4" />
                    <span>Afegir torn</span>
                </button>
            </div>
            <div className="space-y-6">
                {shifts.map((s) => (
                    <div key={s.id} className="bg-[#F5F7F8]/60 border border-gray-100 rounded-2xl p-6 relative">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-gray/30 mb-1">Nombre del turno</p>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-2xl font-heading font-bold text-brand-primary">{s.name}</h3>
                                    <Edit2 className="h-4 w-4 text-brand-accent2 cursor-pointer" />
                                </div>
                            </div>
                            <button onClick={() => removeShift(s.id)} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                                Eliminar Turno
                            </button>
                        </div>
                        <div className="space-y-3">
                            <p className="text-[11px] font-bold text-brand-gray/60 italic ml-1">Franjas horarias de reserva</p>
                            <div className="flex flex-wrap gap-3">
                                {s.times.map((time, idx) => (
                                    <div key={idx} className="bg-white border border-gray-100 rounded-lg px-3 py-2.5 shadow-sm flex items-center gap-3">
                                        <span className="text-sm font-semibold text-brand-primary">{time}</span>
                                        <button onClick={() => removeTime(s.id, idx)} className="text-gray-300 hover:text-red-400 transition-colors">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => addTime(s.id)} className="border-2 border-dashed border-brand-gray/10 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-gray/30 hover:border-brand-secondary/40 hover:text-brand-secondary transition-all">+ Añadir Hora</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Step2Shifts;
