import React, { useState } from 'react';
import TableIllustration from './TableIllustration';

interface Step4TableMapProps {
    zones: { id: string; name: string }[];
    activeZoneId: string;
    setActiveZoneId: (id: string) => void;
    tables: Record<string, any[]>;
    setTables: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
    selectedTableType: 2 | 4 | 6 | 8 | 12 | null; // Changed 10 to 12
    setSelectedTableType: (type: 2 | 4 | 6 | 8 | 12 | null) => void; // Changed 10 to 12
    handleDrop: (e: React.DragEvent, x: number, y: number) => void;
}

const Step4TableMap: React.FC<Step4TableMapProps> = ({ 
    zones, activeZoneId, setActiveZoneId, tables, setTables, selectedTableType, setSelectedTableType, handleDrop 
}) => {
    const activeTables = tables[activeZoneId] || [];
    
    // PREMIUM DRAG-AND-DROP STATE
    const [draggedType, setDraggedType ] = useState<number | null>(null);
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

    const getFootprint = (type: number, x: number) => {
        const width = type === 12 ? 3 : (type === 2 || type === 4 ? 1 : 2); // Changed 10 to 12
        return { width, xStart: x, xEnd: x + width - 1 };
    };

    const isPlacementValid = (type: number, x: number, y: number) => {
        const { width, xEnd } = getFootprint(type, x);
        if (xEnd >= 3) return false;
        return !activeTables.some(t => {
            const horizontalMatch = (x <= t.x + t.width - 1) && (xEnd >= t.x);
            return t.y === y && horizontalMatch;
        });
    };

    return (
        <div className="flex flex-col items-center gap-12 w-full select-none">
            {/* 1: Zone Navigation */}
            <div className="flex justify-center gap-4">
                {zones.map(z => (
                    <button
                        key={z.id}
                        onClick={() => setActiveZoneId(z.id)}
                        className={`px-10 py-3 border-2 border-[#4A1A12] text-[10px] font-black uppercase tracking-[0.3em] transition-all
                            ${activeZoneId === z.id 
                                ? 'bg-[#4A1A12] text-white' 
                                : 'bg-white text-[#4A1A12] hover:bg-gray-50'}`}
                    >
                        {z.name}
                    </button>
                ))}
            </div>

            {/* 2: Main Workspace */}
            <div className="flex flex-row items-center justify-center gap-16 w-full max-w-[1240px] px-10">
                
                {/* ZEN FLOATING PALETTE (Robust Hybrid Style) */}
                <div className="w-48 shrink-0 flex flex-col items-center gap-10 relative py-10 border-r border-[#4A1A12]/5 pr-10">
                    <h3 className="text-[#4A1A12] font-black text-[10px] uppercase tracking-[0.6em] mb-4 opacity-30">Mobiliari</h3>
                    <div className="flex flex-col gap-14 items-center w-full">
                        {[2, 4, 6, 8, 12].map((type) => { // Changed 10 to 12
                            const colWidth = type === 12 ? 3 : (type === 2 || type === 4 ? 1 : 2); // Changed 10 to 12
                            const mockWidth = colWidth * 130 + (colWidth - 1) * 24;
                            const isSelected = selectedTableType === type;

                            return (
                                <div 
                                    key={type}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, type)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => setSelectedTableType(type as any)}
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
                                            <TableIllustration type={type as any} minimalist />
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${isSelected ? 'text-[#4A1A12] opacity-100' : 'text-[#4A1A12]/40 opacity-0 group-hover:opacity-100'}`}>
                                        {type} Pers.
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ARCHITECTURAL GRID (Realistic Mode) */}
                <div className="w-[440px] shrink-0">
                    <div className="relative bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,26,18,0.05)] min-h-[640px] overflow-hidden">
                        <div className="h-full overflow-y-auto custom-scrollbar max-h-[720px] relative z-10">
                            <div className="grid grid-cols-3 gap-6 p-1 min-h-full auto-rows-[130px]">
                                {Array.from({ length: 45 }).map((_, i) => {
                                    const x = i % 3;
                                    const y = Math.floor(i / 3);
                                    const tableAtPos = activeTables.find(t => 
                                        y === t.y && (x >= t.x && x < t.x + t.width)
                                    );
                                    const isOrigin = tableAtPos && tableAtPos.x === x;
                                    const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
                                    const showGhost = isHovered && draggedType && !tableAtPos;
                                    const invalidPlacement = showGhost && !isPlacementValid(draggedType!, x, y);

                                    return (
                                        <div 
                                            key={i} 
                                            className="relative rounded-2xl transition-all duration-300 group flex items-center justify-center overflow-visible"
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                if (hoveredCell?.x !== x || hoveredCell?.y !== y) {
                                                    setHoveredCell({ x, y });
                                                }
                                            }}
                                            onDragLeave={() => setHoveredCell(null)}
                                            onDrop={(e) => {
                                                handleDrop(e, x, y);
                                                handleDragEnd();
                                            }}
                                        >
                                            {/* Architectural Cross Markers (+) */}
                                            {!tableAtPos && !showGhost && (
                                                <div className="relative w-3 h-3 flex items-center justify-center opacity-[0.05] transition-opacity group-hover:opacity-20">
                                                    <div className="absolute w-full h-[1px] bg-[#4A1A12]" />
                                                    <div className="absolute h-full w-[1px] bg-[#4A1A12]" />
                                                </div>
                                            )}

                                            {showGhost && (
                                                <div 
                                                    className="absolute top-0 left-0 z-20 h-full w-full pointer-events-none opacity-80" 
                                                    style={{ 
                                                        width: `calc(100% * ${getFootprint(draggedType!, x).width} + 1.5rem * (${getFootprint(draggedType!, x).width} - 1))`
                                                    } as any}
                                                >
                                                    <TableIllustration type={draggedType as any} isGhost isInvalid={invalidPlacement} />
                                                </div>
                                            )}

                                            {isOrigin && (
                                                <div 
                                                    className="absolute top-0 left-0 z-20 h-full w-full cursor-pointer" 
                                                    style={{ 
                                                        width: `calc(100% * ${tableAtPos.width} + 1.5rem * (${tableAtPos.width} - 1))`
                                                    } as any}
                                                    onMouseEnter={() => setHoveredTableId(tableAtPos.id)}
                                                    onMouseLeave={() => setHoveredTableId(null)}
                                                    onClick={() => removeTable(tableAtPos.id)}
                                                >
                                                    <TableIllustration 
                                                        id={tableAtPos.id} 
                                                        type={tableAtPos.type} 
                                                        isDeleteState={hoveredTableId === tableAtPos.id}
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

            </div>
        </div>
    );
};

export default Step4TableMap;
