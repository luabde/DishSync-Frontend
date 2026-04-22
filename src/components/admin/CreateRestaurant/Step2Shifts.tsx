import React from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { useCreateRestaurant } from '../../../hooks/createRestaurant.hook';
import FormField from '../../common/FormField';

interface Step2ShiftsProps {
    onValidityChange: (isValid: boolean) => void;
    submitAttempted: boolean;
}

const Step2Shifts: React.FC<Step2ShiftsProps> = ({ onValidityChange, submitAttempted }) => {
    const { shifts, addShift, removeShift, addTime, removeTime, updateShiftName, updateTime, formData } = useCreateRestaurant();
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
                                            inputClassName={`text-2xl font-heading font-bold bg-transparent border-b rounded-none px-0 py-0 focus:outline-none ${submitAttempted && shiftsWithDuplicateName.has(s.id) ? 'text-red-500 border-red-300' : 'text-brand-primary border-brand-accent2/40'}`}
                                        />
                                    ) : (
                                        <>
                                            <h3 className={`text-2xl font-heading font-bold ${submitAttempted && shiftsWithDuplicateName.has(s.id) ? 'text-red-500' : 'text-brand-primary'}`}>{s.name}</h3>
                                            <button type="button" onClick={() => startEditShift(s.id, s.name)} className="p-1">
                                                <Edit2 className="h-4 w-4 text-brand-accent2 cursor-pointer" />
                                            </button>
                                        </>
                                    )}
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
                                    <div key={idx} className={`bg-white border rounded-lg px-3 py-2.5 shadow-sm flex items-center gap-3 ${submitAttempted && shiftTimeKeysWithDuplicate.has(`${s.id}-${idx}`) ? 'border-red-200' : 'border-gray-100'}`}>
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => updateTime(s.id, idx, e.target.value)}
                                            className={`text-sm font-semibold bg-transparent outline-none ${submitAttempted && (
                                                shiftTimeKeysWithDuplicate.has(`${s.id}-${idx}`)
                                                || shiftTimeKeysInsideOtherShiftRange.has(`${s.id}-${idx}`)
                                                || shiftTimeKeysEmpty.has(`${s.id}-${idx}`)
                                                || shiftTimeKeysOutsideRestaurantRange.has(`${s.id}-${idx}`)
                                            ) ? 'text-red-500' : 'text-brand-primary'}`}
                                        />
                                        <button onClick={() => removeTime(s.id, idx)} className="text-gray-300 hover:text-red-400 transition-colors">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => addTime(s.id)} className="border-2 border-dashed border-brand-gray/10 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-gray/30 hover:border-brand-secondary/40 hover:text-brand-secondary transition-all">+ Añadir Hora</button>
                            </div>
                            {submitAttempted && shiftsWithDuplicateName.has(s.id) && (
                                <p className="text-xs text-red-500 ml-1 mt-2">El nom del torn està duplicat. Cada torn ha de tenir un nom diferent.</p>
                            )}
                        </div>
                        {submitAttempted && s.times.some((_, idx) => shiftTimeKeysWithDuplicate.has(`${s.id}-${idx}`)) && (
                            <p className="text-xs text-red-500 ml-1 mt-2">Hi ha hores duplicades. Les hores han de ser diferents dins i entre torns.</p>
                        )}
                        {submitAttempted && s.times.some((_, idx) => shiftTimeKeysInsideOtherShiftRange.has(`${s.id}-${idx}`)) && (
                            <p className="text-xs text-red-500 ml-1 mt-2">Aquest torn es solapa amb un altre. Les hores d'un torn no poden estar dins del rang d'un altre torn.</p>
                        )}
                        {submitAttempted && s.times.some((_, idx) => shiftTimeKeysEmpty.has(`${s.id}-${idx}`)) && (
                            <p className="text-xs text-red-500 ml-1 mt-2">Hi ha franges sense hora. Cal informar totes les hores abans de continuar.</p>
                        )}
                        {submitAttempted && s.times.some((_, idx) => shiftTimeKeysOutsideRestaurantRange.has(`${s.id}-${idx}`)) && (
                            <p className="text-xs text-red-500 ml-1 mt-2">Hi ha hores fora del rang general del restaurant (pas 1).</p>
                        )}
                        {submitAttempted && shiftsWithoutTimes.has(s.id) && (
                            <p className="text-xs text-red-500 ml-1 mt-2">Aquest torn no té cap franja horària. Afegeix almenys una hora.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Step2Shifts;
