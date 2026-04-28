import React from 'react';
import { Trash2, Edit2, X } from 'lucide-react';
import { useCreateRestaurant } from '../../../hooks/createRestaurant.hook';
import FormField from '../../common/FormField';


interface Step2ShiftsProps {
    onValidityChange: (isValid: boolean) => void;
    submitAttempted: boolean;
}

const Step2Shifts: React.FC<Step2ShiftsProps> = ({ onValidityChange, submitAttempted }) => {
    const { shifts, addShift, removeShift, addTime, removeTime, updateShiftName, updateTime, formData, newShiftName, setNewShiftName } = useCreateRestaurant();
    const [editingShiftId, setEditingShiftId] = React.useState<string | null>(null);
    const [draftShiftName, setDraftShiftName] = React.useState('');
    // Convierte HH:mm a minutos para poder comparar rangos entre turnos.
    const toMinutes = (time: string): number | null => {
        const [hh, mm] = time.split(':');
        if (!hh || !mm) return null;
        const hours = Number(hh);
        const minutes = Number(mm);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
        return (hours * 60) + minutes;
    };

    const normalizedShiftNames = shifts.map((shift) => shift.name.trim().toLowerCase()).filter(Boolean);
    const duplicateShiftNames = new Set(
        normalizedShiftNames.filter((name, index) => normalizedShiftNames.indexOf(name) !== index)
    );
    const shiftsWithDuplicateName = new Set(
        shifts
            .filter((shift) => duplicateShiftNames.has(shift.name.trim().toLowerCase()))
            .map((shift) => shift.id)
    );

    const allTimes = shifts.flatMap((shift) => shift.times.map((time) => time.trim()).filter(Boolean));
    const duplicateTimes = new Set(
        allTimes.filter((time, index) => allTimes.indexOf(time) !== index)
    );
    const shiftTimeKeysWithDuplicate = new Set(
        shifts.flatMap((shift) =>
            shift.times
                .map((time, index) => ({ time: time.trim(), index }))
                .filter(({ time }) => duplicateTimes.has(time))
                .map(({ index }) => `${shift.id}-${index}`)
        )
    );

    const hasDuplicateShiftNames = shiftsWithDuplicateName.size > 0;
    const hasDuplicateTimes = shiftTimeKeysWithDuplicate.size > 0;
    // Obliga a que cada turno tenga al menos una franja horaria.
    const shiftsWithoutTimes = new Set(
        shifts.filter((shift) => shift.times.length === 0).map((shift) => shift.id)
    );
    // Detecta inputs de hora vacíos para bloquear el avance hasta completarlos.
    const shiftTimeKeysEmpty = new Set(
        shifts.flatMap((shift) =>
            shift.times
                .map((time, index) => ({ time: time.trim(), index }))
                .filter(({ time }) => !time)
                .map(({ index }) => `${shift.id}-${index}`)
        )
    );

    // Convierte el horario global del paso 1 para validar límites de cada hora.
    const startMinutes = toMinutes(formData.startTime.trim());
    const endMinutes = toMinutes(formData.endTime.trim());

    const shiftTimeKeysOutsideRestaurantRange = new Set(
        shifts.flatMap((shift) =>
            shift.times
                .map((time, index) => ({ minutes: toMinutes(time.trim()), index }))
                .map(({ minutes, index }) => {
                    // Si falta rango global válido, no marcamos conflicto de límites aquí.
                    if (minutes === null || startMinutes === null || endMinutes === null) return null;
                    return (minutes < startMinutes || minutes > endMinutes) ? `${shift.id}-${index}` : null;
                })
                .filter((key): key is string => key !== null)
        )
    );
    // Rango por turno (mínimo y máximo) calculado a partir de sus horas válidas.
    const shiftRanges = shifts
        .map((shift) => {
            const minutes = shift.times
                .map((time) => toMinutes(time.trim()))
                .filter((value): value is number => value !== null);

            if (minutes.length === 0) return null;
            return {
                id: shift.id,
                min: Math.min(...minutes),
                max: Math.max(...minutes),
            };
        })
        .filter((range): range is { id: string; min: number; max: number } => range !== null);

    const shiftTimeKeysInsideOtherShiftRange = new Set(
        shifts.flatMap((shift) =>
            shift.times
                .map((time, index) => {
                    const minutes = toMinutes(time.trim());
                    if (minutes === null) return null;

                    // Marca conflicto si una hora cae dentro del rango de otro turno.
                    const isInsideOtherShiftRange = shiftRanges.some(
                        (range) => range.id !== shift.id && minutes >= range.min && minutes <= range.max
                    );

                    return isInsideOtherShiftRange ? `${shift.id}-${index}` : null;
                })
                .filter((key): key is string => key !== null)
        )
    );

    // El paso solo es válido cuando no hay duplicados ni solapamientos.
    const hasTimesInsideOtherShiftRange = shiftTimeKeysInsideOtherShiftRange.size > 0;
    const hasEmptyTimes = shiftTimeKeysEmpty.size > 0;
    const hasTimesOutsideRestaurantRange = shiftTimeKeysOutsideRestaurantRange.size > 0;
    const hasShiftWithoutTimes = shiftsWithoutTimes.size > 0;
    const isStepValid = !hasDuplicateShiftNames
        && !hasDuplicateTimes
        && !hasTimesInsideOtherShiftRange
        && !hasEmptyTimes
        && !hasTimesOutsideRestaurantRange
        && !hasShiftWithoutTimes;

    React.useEffect(() => {
        onValidityChange(isStepValid);
    }, [isStepValid, onValidityChange]);

    const startEditShift = (shiftId: string, currentName: string) => {
        setEditingShiftId(shiftId);
        setDraftShiftName(currentName);
    };

    const saveShiftName = () => {
        if (!editingShiftId) return;
        const cleanName = draftShiftName.trim();
        if (cleanName) {
            updateShiftName(editingShiftId, cleanName);
        }
        setEditingShiftId(null);
        setDraftShiftName('');
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="flex gap-4 mb-10">
                <div className="flex-1">
                    <FormField
                        label=""
                        type="text"
                        value={newShiftName}
                        onChange={(e) => setNewShiftName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addShift();
                            }
                        }}
                        placeholder="Ex: Dinar, Sopar, Esmorzar..."
                        className="space-y-0"
                        labelClassName="hidden"
                        inputClassName="focus:ring-brand-accent2/20"
                    />
                </div>
                <button 
                    onClick={addShift} 
                    className="bg-[#4A1A12] text-white px-8 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#3d150f] transition-colors shadow-lg shadow-brand-primary/10 whitespace-nowrap"
                >
                    + Afegir Torn
                </button>
            </div>
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-[#F5F5F5] px-6 py-4 flex justify-between items-center border-b border-gray-100">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gray/40">Nom del torn</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gray/40">Accions</span>
                </div>
                <div className="divide-y divide-gray-50 bg-white">
                    {shifts.map((s) => (
                        <div key={s.id} className="p-6 transition-colors group hover:bg-brand-primary/2">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    {editingShiftId === s.id ? (
                                        <FormField
                                            label=""
                                            value={draftShiftName}
                                            onChange={(e) => setDraftShiftName(e.target.value)}
                                            onBlur={saveShiftName}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveShiftName();
                                                if (e.key === 'Escape') setEditingShiftId(null);
                                            }}
                                            autoFocus
                                            className="space-y-0"
                                            labelClassName="hidden"
                                            inputClassName={`text-lg font-bold text-brand-primary bg-transparent border-b border-brand-accent2/40 rounded-none px-0 py-0 focus:outline-none ${submitAttempted && shiftsWithDuplicateName.has(s.id) ? 'text-red-500 border-red-300' : ''}`}
                                        />
                                    ) : (
                                        <h3 className={`text-lg font-bold tracking-tight ${submitAttempted && shiftsWithDuplicateName.has(s.id) ? 'text-red-500' : 'text-brand-primary'}`}>{s.name}</h3>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditShift(s.id, s.name)} className="p-1.5 text-brand-gray hover:text-brand-accent2 transition-colors" title="Editar nom">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => removeShift(s.id)} className="p-1.5 text-brand-gray hover:text-red-400 transition-colors" title="Eliminar torn">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-gray/30">Franges horàries de reserva</p>
                                <div className="flex flex-wrap gap-3">
                                    {s.times.map((time, idx) => (
                                        <div key={idx} className={`bg-brand-light-gray/40 border rounded-lg px-3 py-1.5 flex items-center gap-2 transition-all hover:border-brand-accent2/30 ${submitAttempted && shiftTimeKeysWithDuplicate.has(`${s.id}-${idx}`) ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                                            <input
                                                type="time"
                                                value={time}
                                                onChange={(e) => updateTime(s.id, idx, e.target.value)}
                                                className={`text-xs font-bold bg-transparent outline-none ${submitAttempted && (
                                                    shiftTimeKeysWithDuplicate.has(`${s.id}-${idx}`)
                                                    || shiftTimeKeysInsideOtherShiftRange.has(`${s.id}-${idx}`)
                                                    || shiftTimeKeysEmpty.has(`${s.id}-${idx}`)
                                                    || shiftTimeKeysOutsideRestaurantRange.has(`${s.id}-${idx}`)
                                                ) ? 'text-red-500' : 'text-brand-primary'}`}
                                            />
                                            <button onClick={() => removeTime(s.id, idx)} className="text-brand-gray/30 hover:text-red-400 transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => addTime(s.id)} className="border-2 border-dashed border-brand-gray/10 rounded-lg px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-brand-gray/40 hover:border-brand-accent1/30 hover:text-brand-accent1 transition-all">+ Afegir Hora</button>
                                </div>
                                
                                {submitAttempted && (
                                    <div className="space-y-1 mt-2">
                                        {shiftsWithDuplicateName.has(s.id) && (
                                            <p className="text-[10px] text-red-500 font-medium italic">El nom del torn està duplicat.</p>
                                        )}
                                        {s.times.some((_, idx) => shiftTimeKeysWithDuplicate.has(`${s.id}-${idx}`)) && (
                                            <p className="text-[10px] text-red-500 font-medium italic">Hi ha hores duplicades.</p>
                                        )}
                                        {s.times.some((_, idx) => shiftTimeKeysInsideOtherShiftRange.has(`${s.id}-${idx}`)) && (
                                            <p className="text-[10px] text-red-500 font-medium italic">Aquest torn es solapa amb un altre.</p>
                                        )}
                                        {s.times.some((_, idx) => shiftTimeKeysEmpty.has(`${s.id}-${idx}`)) && (
                                            <p className="text-[10px] text-red-500 font-medium italic">Hi ha franges sense hora.</p>
                                        )}
                                        {s.times.some((_, idx) => shiftTimeKeysOutsideRestaurantRange.has(`${s.id}-${idx}`)) && (
                                            <p className="text-[10px] text-red-500 font-medium italic">Hores fora del rang del restaurant.</p>
                                        )}
                                        {shiftsWithoutTimes.has(s.id) && (
                                            <p className="text-[10px] text-red-500 font-medium italic">Aquest torn no té cap franja horària.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {shifts.length === 0 && (
                        <div className="px-6 py-12 text-center text-brand-gray/30 italic text-sm">No s'ha definit cap torn encara.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step2Shifts;
