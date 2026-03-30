import React, { createContext, useMemo, useState } from 'react';

export interface Zone {
  id: string;
  name: string;
}

export interface Shift {
  id: string;
  name: string;
  times: string[];
}

export interface TableMapItem {
  id: string;
  type: 2 | 4 | 6 | 8 | 12;
  x: number;
  y: number;
  width: number;
}

interface CreateRestaurantContextValue {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;

  formData: {
    name: string;
    address: string;
    phone: string;
    startTime: string;
    endTime: string;
    description: string;
  };
  photos: File[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setPhotos: React.Dispatch<React.SetStateAction<File[]>>;

  shifts: Shift[];
  addShift: () => void;
  removeShift: (id: string) => void;
  addTime: (shiftId: string) => void;
  removeTime: (shiftId: string, timeIndex: number) => void;
  updateShiftName: (shiftId: string, name: string) => void;
  updateTime: (shiftId: string, timeIndex: number, time: string) => void;

  zones: Zone[];
  newZoneName: string;
  setNewZoneName: React.Dispatch<React.SetStateAction<string>>;
  addZone: () => void;
  removeZone: (id: string) => void;
  updateZoneName: (id: string, name: string) => void;

  activeZoneId: string;
  setActiveZoneId: (id: string) => void;
  tables: Record<string, TableMapItem[]>;
  setTables: React.Dispatch<React.SetStateAction<Record<string, TableMapItem[]>>>;
  selectedTableType: 2 | 4 | 6 | 8 | 12 | null;
  setSelectedTableType: React.Dispatch<React.SetStateAction<2 | 4 | 6 | 8 | 12 | null>>;
  handleDrop: (e: React.DragEvent, x: number, y: number) => void;
}

export const CreateRestaurantContext = createContext<CreateRestaurantContextValue | null>(null);

/**
 * Contexto central del wizard "Crear Restaurante".
 * Reúne en un único lugar todo el estado y las acciones de los 5 pasos:
 * info general, turnos, zonas, mapa de mesas y resumen.
 */
export const CreateRestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState(1);

  // Paso 1: datos generales del restaurante
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    startTime: '',
    endTime: '',
    description: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);

  // Paso 2: turnos y franjas horarias
  const [shifts, setShifts] = useState<Shift[]>([
    { id: '1', name: 'Dinar', times: ['13:00', '13:30', '14:00', '14:30'] },
    { id: '2', name: 'Sopar', times: ['20:00', '20:30', '21:00', '21:30', '22:00'] }
  ]);

  // Paso 3: zonas del restaurante
  const [zones, setZones] = useState<Zone[]>([
    { id: '1', name: 'P. BAJA' },
    { id: '2', name: 'PLANO PRINCIPAL' }
  ]);
  const [newZoneName, setNewZoneName] = useState('');

  // Paso 4: mapa de mesas por zona
  const [activeZoneId, setActiveZoneId] = useState('1');
  const [tables, setTables] = useState<Record<string, TableMapItem[]>>({
    '1': [],
    '2': []
  });
  const [selectedTableType, setSelectedTableType] = useState<2 | 4 | 6 | 8 | 12 | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addShift = () => {
    const newShift: Shift = { id: Date.now().toString(), name: 'Nou Turno', times: ['12:00'] };
    setShifts(prev => [...prev, newShift]);
  };

  const removeShift = (id: string) => setShifts(prev => prev.filter(s => s.id !== id));

  const addTime = (shiftId: string) => {
    setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, times: [...s.times, '12:00'] } : s));
  };

  const removeTime = (shiftId: string, timeIndex: number) => {
    setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, times: s.times.filter((_, i) => i !== timeIndex) } : s));
  };

  const updateShiftName = (shiftId: string, name: string) => {
    setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, name } : s));
  };

  const updateTime = (shiftId: string, timeIndex: number, time: string) => {
    setShifts(prev => prev.map(s => {
      if (s.id !== shiftId) return s;
      return { ...s, times: s.times.map((t, index) => index === timeIndex ? time : t) };
    }));
  };

  const addZone = () => {
    if (!newZoneName.trim()) return;
    const newId = Date.now().toString();
    setZones(prev => [...prev, { id: newId, name: newZoneName.toUpperCase() }]);
    setTables(prev => ({ ...prev, [newId]: [] }));
    setNewZoneName('');
  };

  const removeZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
    setTables(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateZoneName = (id: string, name: string) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, name } : z));
  };

  // Inserta una mesa en el grid del paso 4 con validación de colisión horizontal
  const placeTable = (x: number, y: number, type: number) => {
    const width = (type === 2 || type === 4) ? 1 : (type === 6 || type === 8) ? 2 : 3;
    let actualX = x;
    if (actualX + width > 3) actualX = 3 - width;

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
        type: type as TableMapItem['type'],
        x: actualX,
        y,
        width
      }]
    }));
  };

  // Punto de entrada del "drop" del drag&drop
  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    const typeStr = e.dataTransfer.getData('tableType');
    if (typeStr) placeTable(x, y, parseInt(typeStr, 10));
  };

  const value = useMemo<CreateRestaurantContextValue>(() => ({
    step, setStep,
    formData, photos, handleChange, setPhotos,
    shifts, addShift, removeShift, addTime, removeTime, updateShiftName, updateTime,
    zones, newZoneName, setNewZoneName, addZone, removeZone, updateZoneName,
    activeZoneId, setActiveZoneId, tables, setTables, selectedTableType, setSelectedTableType, handleDrop,
  }), [
    step, formData, photos, shifts, zones, newZoneName, activeZoneId, tables, selectedTableType
  ]);

  return (
    <CreateRestaurantContext.Provider value={value}>
      {children}
    </CreateRestaurantContext.Provider>
  );
};

