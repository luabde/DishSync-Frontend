import React, { createContext, useEffect, useState } from 'react';
import { taulesApi, type TableTypeDTO } from '../api/taules.api';
import { usuarisApi, type AssignableUserDTO } from '../api/usuaris.api';

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
  tableTypeId: number;
  type: number;
  x: number;
  y: number;
  width: number;
  height: number;
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
  newShiftName: string;
  setNewShiftName: React.Dispatch<React.SetStateAction<string>>;

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
  tableTypes: TableTypeDTO[];
  selectedTableType: number | null;
  setSelectedTableType: React.Dispatch<React.SetStateAction<number | null>>;
  handleDrop: (e: React.DragEvent, x: number, y: number, isVertical?: boolean) => void;

  // Paso 5: usuarios asignados al restaurante
  availableUsers: AssignableUserDTO[];
  selectedUsers: AssignableUserDTO[];
  toggleUserSelection: (user: AssignableUserDTO) => void;
}

export const CreateRestaurantContext = createContext<CreateRestaurantContextValue | null>(null);

/**
 * Contexto central del wizard "Crear Restaurante".
 * Reúne en un único lugar todo el estado y las acciones de los 5 pasos:
 * info general, turnos, zonas, mapa de mesas y resumen.
 */
export const CreateRestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * Genera los turnos automáticos de Step2 a partir del horario de Step1.
   * - Crea slots cada 60 minutos entre inicio y fin (incluidos).
   * - Parte los slots en 2 mitades: Dinar (primera) y Sopar (segunda).
   */
  const buildAutomaticShifts = (startTime: string, endTime: string): Shift[] | null => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    // Si las horas no tienen formato válido, no calculamos nada.
    if (
      Number.isNaN(startH) || Number.isNaN(startM) ||
      Number.isNaN(endH) || Number.isNaN(endM)
    ) {
      return null;
    }

    const startMinutes = (startH * 60) + startM;
    const endMinutes = (endH * 60) + endM;
    // Protección: el rango debe ser de menor a mayor.
    if (startMinutes > endMinutes) return null;

    const slots: string[] = [];
    // Generamos slots cada 60 minutos: 12:00, 13:00, 14:00...
    for (let current = startMinutes; current <= endMinutes; current += 60) {
      const hh = String(Math.floor(current / 60)).padStart(2, '0');
      const mm = String(current % 60).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }

    // Reparto 50/50 aproximado: la primera mitad va a Dinar.
    const middle = Math.ceil(slots.length / 2);
    return [
      { id: '1', name: 'Dinar', times: slots.slice(0, middle) },
      { id: '2', name: 'Sopar', times: slots.slice(middle) },
    ];
  };

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
  // Mientras sea true, Step1 recalcula automáticamente los turnos de Step2.
  // Cuando el usuario toca Step2 manualmente, lo pasamos a false para no pisar sus cambios.
  const [usesAutomaticShifts, setUsesAutomaticShifts] = useState(true);
  const [newShiftName, setNewShiftName] = useState('');

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
  const [tableTypes, setTableTypes] = useState<TableTypeDTO[]>([]);
  const [selectedTableType, setSelectedTableType] = useState<number | null>(null);
  const [availableUsers, setAvailableUsers] = useState<AssignableUserDTO[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<AssignableUserDTO[]>([]);

  /**
   * Carga los tipos de mesa desde backend.
   * De esta forma el "mobiliari" no depende de valores hardcodeados
   * en frontend, sino del catálogo real en base de datos.
   */
  useEffect(() => {
    const loadTableTypes = async () => {
      try {
        const data = await taulesApi.getTableTypes();
        setTableTypes(data);
        setSelectedTableType((prev) => prev ?? data[0]?.id ?? null);
      } catch (error) {
        console.error('No se pudieron cargar los tipos de mesa', error);
      }
    };

    loadTableTypes();
  }, []);

  /**
   * Carga usuarios disponibles para asignarlos al nuevo restaurante.
   * Se usa en el nuevo paso "Defineix usuaris".
   */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await usuarisApi.getUsersForAssignment();
        setAvailableUsers(data);
      } catch (error) {
        console.error('No se pudieron cargar los usuarios', error);
      }
    };
    loadUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Si el usuario ya está editando turnos manuales, dejamos de autocalcular.
    if (!usesAutomaticShifts) return;
    const autoShifts = buildAutomaticShifts(formData.startTime, formData.endTime);
    // Solo aplicamos cuando Step1 ya tiene datos válidos.
    if (!autoShifts) return;
    setShifts(autoShifts);
  }, [formData.startTime, formData.endTime, usesAutomaticShifts]);

  // Helper para marcar que desde este punto manda la edición manual del usuario.
  const markShiftsAsManual = () => setUsesAutomaticShifts(false);

  const addShift = () => {
    const cleanName = newShiftName.trim();
    if (!cleanName) return;
    markShiftsAsManual();
    // El primer hueco horario queda vacío para obligar selección explícita.
    const newShift: Shift = { id: Date.now().toString(), name: cleanName, times: [''] };
    setShifts(prev => [...prev, newShift]);
    setNewShiftName('');
  };

  const removeShift = (id: string) => {
    markShiftsAsManual();
    setShifts(prev => prev.filter(s => s.id !== id));
  };

  const addTime = (shiftId: string) => {
    markShiftsAsManual();
    // Al añadir una hora nueva, no se precarga ningún valor por defecto.
    setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, times: [...s.times, ''] } : s));
  };

  const removeTime = (shiftId: string, timeIndex: number) => {
    markShiftsAsManual();
    setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, times: s.times.filter((_, i) => i !== timeIndex) } : s));
  };

  const updateShiftName = (shiftId: string, name: string) => {
    markShiftsAsManual();
    setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, name } : s));
  };

  const updateTime = (shiftId: string, timeIndex: number, time: string) => {
    markShiftsAsManual();
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

  // Inserta una mesa en el grid del paso 4 usando los spans definidos en BD
  /**
   * Coloca una mesa en el mapa (zona activa) usando:
   * - x: columna de destino
   * - y: fila de destino
   * - tableTypeId: tipo de mesa del catálogo (BD)
   *
   * Nota importante:
   * x e y NO se guardan en variables sueltas globales.
   * Se guardan dentro del estado `tables`, en cada objeto mesa:
   * { ..., x: actualX, y, ... } (ver setTables más abajo).
   */
  const placeTable = (x: number, y: number, tableTypeId: number, isVertical: boolean = false) => {
    // Busca en el catálogo (backend) la definición del tipo de mesa seleccionado.
    const tableType = tableTypes.find((t) => t.id === tableTypeId);
    if (!tableType) return;

    // Dimensiones de la mesa según su orientación
    const width = isVertical ? 1 : tableType.span_columna;
    const height = isVertical ? tableType.span_columna : 1;

    // Columna real donde quedará la mesa.
    let actualX = x;

    // Si la mesa se sale por la derecha del grid (3 columnas),
    // la ajustamos automáticamente hacia la izquierda.
    if (actualX + width > 3) actualX = 3 - width;

    // Guarda la mesa en el estado global del contexto.
    // Nota: calculamos colisiones e ID dentro del updater para evitar estados obsoletos.
    setTables(prev => {
      const zoneTables = prev[activeZoneId] || [];

      // Comprueba colisión en el área que ocupará la mesa (x, y, width, height)
      const isOccupied = zoneTables.some(t => {
        const horizontalMatch = (actualX < t.x + t.width) && (actualX + width > t.x);
        const verticalMatch = (y < t.y + (t.height || 1)) && (y + height > t.y);
        return horizontalMatch && verticalMatch;
      });

      // Si colisiona, no se coloca.
      if (isOccupied) return prev;

      // Evita duplicados de IDs aunque se borren mesas intermedias.
      // Ejemplo: si existen T1 y T3, la siguiente será T4 (no T3).
      const usedNumbers = zoneTables
        .map((table) => {
          const match = /^T(\d+)$/.exec(table.id);
          return match ? Number(match[1]) : 0;
        })
        .filter((num) => Number.isFinite(num) && num > 0);
      const nextTableNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;

      return {
        ...prev,
        [activeZoneId]: [
          ...zoneTables,
          {
            id: `T${nextTableNumber}`,
            tableTypeId,
            type: tableType.num_persones,
            x: actualX, // Columna final en el grid
            y, // Fila final en el grid
            width,
            height
          }
        ]
      };
    });
  };

  // Punto de entrada del "drop" del drag&drop
  const handleDrop = (e: React.DragEvent, x: number, y: number, isVertical: boolean = false) => {
    e.preventDefault();
    const typeStr = e.dataTransfer.getData('tableType');
    if (typeStr) placeTable(x, y, parseInt(typeStr, 10), isVertical);
  };

  const toggleUserSelection = (user: AssignableUserDTO) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) return prev.filter((u) => u.id !== user.id);
      return [...prev, user];
    });
  };

  const value: CreateRestaurantContextValue = {
    step, setStep,
    formData, photos, handleChange, setPhotos,
    shifts, addShift, removeShift, addTime, removeTime, updateShiftName, updateTime, newShiftName, setNewShiftName,
    zones, newZoneName, setNewZoneName, addZone, removeZone, updateZoneName,
    activeZoneId, setActiveZoneId, tables, setTables, tableTypes, selectedTableType, setSelectedTableType, handleDrop,
    availableUsers, selectedUsers, toggleUserSelection,
  };

  return (
    <CreateRestaurantContext.Provider value={value}>
      {children}
    </CreateRestaurantContext.Provider>
  );
};

