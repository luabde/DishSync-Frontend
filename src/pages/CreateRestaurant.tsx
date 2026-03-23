import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Import Modular Components
import Step1Info from '../components/CreateRestaurant/Step1Info';
import Step2Shifts from '../components/CreateRestaurant/Step2Shifts';
import Step3Zones from '../components/CreateRestaurant/Step3Zones';
import Step4TableMap from '../components/CreateRestaurant/Step4TableMap';
import Step5Summary from '../components/CreateRestaurant/Step5Summary';

interface Zone {
    id: string;
    name: string;
}

interface Shift {
    id: string;
    name: string;
    times: string[];
}

interface Table {
    id: string;
    type: 2 | 4 | 6 | 8 | 12;
    x: number;
    y: number;
    width: number;
}

export default function CreateRestaurant() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Step 1 State
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        startTime: '',
        endTime: '',
        description: '',
    });

    // Step 2 State
    const [shifts, setShifts] = useState<Shift[]>([
        { id: '1', name: 'Comida', times: ['13:00', '13:30', '14:00', '14:30'] },
        { id: '2', name: 'Cena', times: ['20:00', '20:30', '21:00', '21:30', '22:00'] }
    ]);

    // Step 3 State
    const [zones, setZones] = useState<Zone[]>([
        { id: '1', name: 'P. BAJA' },
        { id: '2', name: 'PLANO PRINCIPAL' }
    ]);
    const [newZoneName, setNewZoneName] = useState('');

    // Step 4 State
    const [activeZoneId, setActiveZoneId] = useState('1');
    const [tables, setTables] = useState<Record<string, Table[]>>({
        '1': [],
        '2': []
    });
    const [selectedTableType, setSelectedTableType] = useState<2 | 4 | 6 | 8 | 12 | null>(null);

    // Handlers for Step 1
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handlers for Step 2
    const addShift = () => {
        const newShift: Shift = { id: Date.now().toString(), name: 'Nou Turno', times: ['12:00'] };
        setShifts([...shifts, newShift]);
    };
    const removeShift = (id: string) => setShifts(shifts.filter(s => s.id !== id));
    const addTime = (shiftId: string) => {
        setShifts(shifts.map(s => s.id === shiftId ? { ...s, times: [...s.times, "12:00"] } : s));
    };
    const removeTime = (shiftId: string, timeIndex: number) => {
        setShifts(shifts.map(s => s.id === shiftId ? { ...s, times: s.times.filter((_, i) => i !== timeIndex) } : s));
    };

    // Handlers for Step 3
    const addZone = () => {
        if (!newZoneName.trim()) return;
        const newId = Date.now().toString();
        setZones([...zones, { id: newId, name: newZoneName.toUpperCase() }]);
        setTables(prev => ({ ...prev, [newId]: [] }));
        setNewZoneName('');
    };
    const removeZone = (id: string) => {
        setZones(zones.filter(z => z.id !== id));
        const newTables = { ...tables };
        delete newTables[id];
        setTables(newTables);
    };

    // Handlers for Step 4
    const placeTable = (x: number, y: number, type: number) => {
        // Source of truth for widths (3-column grid): 2P/4P:1, 6P/8P:2, 12P:3
        const width = (type === 2 || type === 4) ? 1 : (type === 6 || type === 8) ? 2 : 3;
        
        // SMART SNAP: If it doesn't fit at the drop point in a 3-column grid, shift it left
        let actualX = x;
        if (actualX + width > 3) {
            actualX = 3 - width;
        }

        const zoneTables = tables[activeZoneId] || [];
        const isOccupied = zoneTables.some(t => 
            (y === t.y) && (
                (actualX >= t.x && actualX < t.x + t.width) || 
                (actualX + width > t.x && actualX <= t.x) ||
                (t.x >= actualX && t.x < actualX + width)
            )
        );

        if (isOccupied) return;

        setTables(prev => ({
            ...prev,
            [activeZoneId]: [...(prev[activeZoneId] || []), { 
                id: `T${(prev[activeZoneId] || []).length + 1}`,
                type: type as Table['type'],
                x: actualX,
                y,
                width
            }]
        }));
    };
    
    const handleDrop = (e: React.DragEvent, x: number, y: number) => {
        e.preventDefault();
        const typeStr = e.dataTransfer.getData('tableType');
        if (typeStr) placeTable(x, y, parseInt(typeStr));
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1Info formData={formData} handleChange={handleChange} />;
            case 2: return <Step2Shifts shifts={shifts} addShift={addShift} removeShift={removeShift} addTime={addTime} removeTime={removeTime} />;
            case 3: return <Step3Zones zones={zones} newZoneName={newZoneName} setNewZoneName={setNewZoneName} addZone={addZone} removeZone={removeZone} />;
            case 4: return (
                <Step4TableMap 
                    zones={zones} 
                    activeZoneId={activeZoneId} 
                    setActiveZoneId={setActiveZoneId} 
                    tables={tables} 
                    setTables={setTables} 
                    selectedTableType={selectedTableType} 
                    setSelectedTableType={setSelectedTableType as any} 
                    handleDrop={handleDrop} 
                />
            );
            case 5: return <Step5Summary formData={formData} shifts={shifts} zones={zones} tables={tables} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F2] font-body text-brand-gray pb-12 transition-all duration-500">
            <header className="max-w-4xl mx-auto pt-8 px-6 text-center">
                <nav className="flex items-center justify-center gap-2 text-xs font-medium text-brand-gray/40 mb-12 uppercase tracking-widest">
                    <Link to="/" className="hover:text-brand-primary transition-colors">Restaurants</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-brand-primary/60">Nou</span>
                </nav>
                <h1 className="text-6xl font-heading font-black text-brand-primary mb-12 tracking-tighter">Dish<span className="text-[#B38B59] italic uppercase text-4xl ml-2 tracking-normal font-medium">Sync</span></h1>
            </header>

            <main className="max-w-4xl mx-auto px-6 transition-all duration-700">
                <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-brand-primary/10 p-10 md:p-14 transition-all duration-700">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-16 px-4">
                        <button 
                            onClick={() => step > 1 && setStep(step - 1)} 
                            className={`p-4 -ml-4 rounded-full transition-all active:scale-90 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-brand-primary hover:bg-brand-primary/5'}`}
                        >
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex gap-4 flex-1 max-w-xl px-12">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button key={s} onClick={() => setStep(s)} className={`h-2.5 flex-1 rounded-full transition-all duration-700 ${s === step ? 'bg-[#4A1A12] w-full shadow-lg shadow-brand-primary/20' : s < step ? 'bg-[#4A1A12] opacity-20' : 'bg-gray-100'}`} />
                            ))}
                        </div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-brand-gray/30 whitespace-nowrap">STEP 0{step}</span>
                    </div>

                    {renderStep()}

                    {/* Navigation */}
                    <div className="pt-20">
                        <button 
                            onClick={() => step < 5 ? setStep(step + 1) : navigate('/dashboard')} 
                            className="w-full py-7 bg-[#4A1A12] text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-black hover:shadow-[0_25px_60px_rgba(0,0,0,0.3)] transition-all duration-700 active:scale-[0.98] shadow-3xl shadow-[#4A1A12]/30"
                        >
                            {step === 5 ? 'Confirmar i Finalitzar' : 'CONTINUAR'}
                        </button>
                    </div>
                </div>
                <footer className="mt-20 text-center pb-12">
                    <p className="text-[10px] font-black text-brand-gray/10 tracking-[0.2em] uppercase">SYSTEM CORE — DISHSYNC OPERATIONAL SUITE v2.1.0</p>
                </footer>
            </main>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4A1A1215; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4A1A1230; }
            `}} />
        </div>
    );
}
