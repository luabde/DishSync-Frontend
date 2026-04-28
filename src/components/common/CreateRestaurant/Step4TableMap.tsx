import React, { useState } from 'react';
import TableIllustration from './TableIllustration';
import { useCreateRestaurant } from '../../../hooks/createRestaurant.hook';


interface Step4TableMapProps {
    onValidityChange: (isValid: boolean) => void;
    submitAttempted: boolean;
}

const Step4TableMap: React.FC<Step4TableMapProps> = ({ onValidityChange, submitAttempted }) => {
    const {
        zones,
        activeZoneId,
        setActiveZoneId,
        tables,
        setTables,
        tableTypes,
        selectedTableType,
        setSelectedTableType,
        handleDrop
    } = useCreateRestaurant();
    const activeTables = tables[activeZoneId] || [];
    // Regla de negocio: no se puede continuar si alguna zona está vacía.
    const allZonesHaveAtLeastOneTable = zones.every((zone) => (tables[zone.id] || []).length > 0);

    // Estado temporal de interacción (drag, hover de celda y hover de mesa)
    const [draggedType, setDraggedType ] = useState<number | null>(null);
    const [isVertical] = useState(false);
    const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);
    const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, type: number) => {
        e.dataTransfer.setData('tableType', type.toString());
        setDraggedType(type);
        setSelectedTableType(type as any);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => {
        setDraggedType(null);
        setHoveredCell(null);
    };

    const removeTable = (tableId: string) => {
        setTables(prev => ({
            ...prev,
            [activeZoneId]: prev[activeZoneId].filter(t => t.id !== tableId)
        }));
    };

    // Convierte num_persones del backend a los tipos visuales soportados por TableIllustration
    const toIllustrationType = (numPeople: number): 2 | 4 | 6 | 8 | 10 | 12 => {
        if (numPeople <= 2) return 2;
        if (numPeople <= 4) return 4;
        if (numPeople <= 6) return 6;
        if (numPeople <= 8) return 8;
        if (numPeople <= 10) return 10;
        return 12;
    };

    const CELL_SIZE = 130;
    const CELL_GAP = 24;
    const gridCols = 3;
    const gridRows = 4;
    const totalCells = gridCols * gridRows;

    const getFootprint = (tableTypeId: number, x: number, y: number, vertical: boolean) => {
        const tableType = tableTypes.find(t => t.id === tableTypeId);
        const span = tableType?.span_columna ?? 1;
        const width = vertical ? 1 : span;
        const height = vertical ? span : 1;
        return { width, height, xStart: x, xEnd: x + width - 1, yStart: y, yEnd: y + height - 1 };
    };

    const isPlacementValid = (tableTypeId: number, x: number, y: number, vertical: boolean) => {
        const { xEnd, yEnd } = getFootprint(tableTypeId, x, y, vertical);
        if (xEnd >= gridCols) return false;
        
        return !activeTables.some(t => {
            const horizontalMatch = (x < t.x + t.width) && (xEnd >= t.x);
            const verticalMatch = (y < t.y + t.height) && (yEnd >= t.y);
            return horizontalMatch && verticalMatch;
        });
    };

    // Informa al padre para bloquear "Continuar" en este paso cuando corresponda.
    React.useEffect(() => {
        onValidityChange(allZonesHaveAtLeastOneTable);
    }, [allZonesHaveAtLeastOneTable, onValidityChange]);

    return (
        <div className="flex flex-col items-center gap-12 w-full select-none animate-in fade-in slide-in-from-right-4 duration-500">

            {/* 1) Navegació de zones (Estil segmentat modern) */}
            <div className="bg-[#F5F5F5] p-1.5 rounded-2xl flex gap-1 shadow-inner">
                {zones.map(z => (
                    <button
                        key={z.id}
                        onClick={() => setActiveZoneId(z.id)}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300
                            ${activeZoneId === z.id
                                ? 'bg-white text-[#4A1A12] shadow-md scale-[1.02]'
                                : 'text-brand-gray/40 hover:text-brand-gray/60 hover:bg-white/50'}`}
                    >
                        {z.name}
                    </button>
                ))}
            </div>

            {/* 2) Área principal: paleta + plano */}
            <div className="flex flex-row items-start justify-center gap-0 w-full max-w-[1240px]">

                {/* Paleta lateral de tipos de mesa (arrastrables) */}
                <div className="w-64 shrink-0 h-[640px] border-r border-[#4A1A12]/5 pr-10 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col items-center gap-4 py-10">
                        <h3 className="text-[#4A1A12] font-black text-[10px] uppercase tracking-[0.6em] opacity-30">Mobiliari</h3>
                        {/* 
                            Rotació desactivada temporalment a petició de l'usuari.
                            Per reactivar, només cal tornar a mostrar aquest botó i l'estat isVertical.
                        */}
                        {/* <button 
                            onClick={() => setIsVertical(!isVertical)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${isVertical ? 'bg-[#4A1A12] text-white border-[#4A1A12]' : 'bg-white text-[#4A1A12] border-[#4A1A12]/20 hover:border-[#4A1A12]/40'}`}
                        >
                            <svg className={`w-3.5 h-3.5 transition-transform duration-500 ${isVertical ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-[9px] font-black uppercase tracking-widest">{isVertical ? 'Vertical' : 'Horitzontal'}</span>
                        </button> */}
                    </div>
                    <div className="flex flex-col gap-14 items-center w-full pb-10">
                        {/* El catálogo viene de backend (tabla TAULES) */}
                        {tableTypes.map((tableType) => {
                            // Ancho lógico en columnas para renderizar la miniatura de la paleta
                            const colWidth = tableType.span_columna;
                            const mockWidth = colWidth * 130 + (colWidth - 1) * 24;
                            const isSelected = selectedTableType === tableType.id;
                            const visualType = toIllustrationType(tableType.num_persones);

                            return (
                                <div
                                    key={tableType.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, tableType.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => setSelectedTableType(tableType.id)}
                                    className={`group relative flex flex-col items-center cursor-grab active:cursor-grabbing transition-all w-full
                                        ${isSelected
                                            ? 'scale-110'
                                            : 'scale-100 opacity-60 hover:opacity-100 hover:scale-110'}`}
                                >
                                    <div className="h-10 w-full flex items-center justify-center pointer-events-none mb-3 overflow-visible transition-all">
                                        <div
                                            className="scale-[0.38] origin-center flex justify-center transition-all shrink-0"
                                            style={{ width: mockWidth }}
                                        >
                                            <TableIllustration type={visualType} minimalist isVertical={isVertical} />
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${isSelected ? 'text-[#4A1A12] opacity-100' : 'text-[#4A1A12]/40 opacity-0 group-hover:opacity-100'}`}>
                                        {tableType.num_persones} Pers.
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Plano de mesas con 4 filas sin scroll */}
                <div className="flex-1 min-w-0 overflow-hidden">
                    <div
                        className="w-full h-[640px]"
                    >
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: `repeat(${gridCols}, ${CELL_SIZE}px)`,
                                gridTemplateRows: `repeat(${gridRows}, ${CELL_SIZE}px)`,
                                gap: `${CELL_GAP}px`,
                                padding: '24px',
                                width: gridCols * CELL_SIZE + (gridCols - 1) * CELL_GAP + 48,
                            }}
                        >
                            {Array.from({ length: totalCells }).map((_, i) => {
                                const x = i % gridCols;
                                const y = Math.floor(i / gridCols);
                                const tableAtPos = activeTables.find(t =>
                                    (x >= t.x && x < t.x + t.width) && (y >= t.y && y < t.y + t.height)
                                );
                                const isOrigin = tableAtPos && tableAtPos.x === x && tableAtPos.y === y;
                                const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
                                const showGhost = isHovered && draggedType && !tableAtPos;
                                const invalidPlacement = Boolean(showGhost && !isPlacementValid(draggedType!, x, y, isVertical));

                                return (
                                    <div
                                        key={`${x}-${y}`}
                                        className="relative rounded-2xl transition-all duration-300 group flex items-center justify-center overflow-visible"
                                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            if (hoveredCell?.x !== x || hoveredCell?.y !== y) {
                                                setHoveredCell({ x, y });
                                            }
                                        }}
                                        onDragLeave={() => setHoveredCell(null)}
                                        onDrop={(e) => {
                                            handleDrop(e, x, y, isVertical);
                                            handleDragEnd();
                                        }}
                                    >
                                        {/* Marca visual de celda vacía */}
                                        {!tableAtPos && !showGhost && (
                                            <div className="relative w-4 h-4 flex items-center justify-center opacity-[0.2] transition-all group-hover:opacity-40 group-hover:scale-125">
                                                <div className="absolute w-full h-px bg-[#4A1A12]" />
                                                <div className="absolute h-full w-px bg-[#4A1A12]" />
                                            </div>
                                        )}

                                        {/* Preview (ghost) durante el arrastre */}
                                        {showGhost && (
                                            <div
                                                className="absolute top-0 left-0 z-20 pointer-events-none opacity-80"
                                                style={{
                                                    width: `calc(100% * ${getFootprint(draggedType!, x, y, isVertical).width} + ${CELL_GAP}px * (${getFootprint(draggedType!, x, y, isVertical).width} - 1))`,
                                                    height: `calc(100% * ${getFootprint(draggedType!, x, y, isVertical).height} + ${CELL_GAP}px * (${getFootprint(draggedType!, x, y, isVertical).height} - 1))`
                                                } as any}
                                            >
                                                <TableIllustration
                                                    type={toIllustrationType(tableTypes.find(t => t.id === draggedType!)?.num_persones ?? 2)}
                                                    isGhost
                                                    isInvalid={invalidPlacement}
                                                    isVertical={isVertical}
                                                />
                                            </div>
                                        )}

                                        {/* Mesa real: solo se pinta en su celda de origen */}
                                        {isOrigin && (
                                            <div
                                                className="absolute top-0 left-0 z-20 cursor-pointer"
                                                style={{
                                                    width: `calc(100% * ${tableAtPos.width} + ${CELL_GAP}px * (${tableAtPos.width} - 1))`,
                                                    height: `calc(100% * ${tableAtPos.height} + ${CELL_GAP}px * (${tableAtPos.height} - 1))`
                                                } as any}
                                                onMouseEnter={() => setHoveredTableId(tableAtPos.id)}
                                                onMouseLeave={() => setHoveredTableId(null)}
                                                onClick={() => removeTable(tableAtPos.id)}
                                            >
                                                <TableIllustration
                                                    id={tableAtPos.id}
                                                    type={toIllustrationType(tableAtPos.type)}
                                                    isDeleteState={hoveredTableId === tableAtPos.id}
                                                    isVertical={tableAtPos.height > 1 || (tableAtPos.width === 1 && tableAtPos.height > 0 && tableAtPos.type > 4)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
            {submitAttempted && !allZonesHaveAtLeastOneTable && (
                <p className="text-xs text-red-500">
                    Totes les zones han de tenir almenys una taula assignada per continuar.
                </p>
            )}
        </div>
    );
};

export default Step4TableMap;
