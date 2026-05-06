import React from 'react';

// Constantes visuales base para dibujar mesa y sillas.
// Solo afectan al aspecto (tamaño, separación, redondeo), no a la lógica del drag & drop.
const CONFIG = {
    CELL_H: 130, // Altura de referencia de una celda del grid
    BODY_H: 82,  // Altura del cuerpo principal de la mesa
    STOOL_W: 58,  // Ancho de las sillas
    STOOL_H: 15,  // Alto de las sillas
    INSET_X: 24,  // Margen interno lateral para alinear el cuerpo de la mesa
    STOOL_OFFSET: 2, // Separación entre sillas y mesa
    ROUNDED: "rounded-[0.4rem]",      // Redondeo de las esquinas del cuerpo de la mesa
    STOOL_ROUNDED: "rounded-[0.25rem]" // Redondeo de las esquinas de las sillas
};

export interface TableIllustrationProps {
    type: 2 | 4 | 6 | 8 | 10 | 12; // Capacidad de la mesa (define forma y distribución visual de sillas)
    active?: boolean; // Estado opcional para estilos (ahora mismo no se usa)
    id?: string; // Etiqueta visible en el centro (ej: "T1", "T2")
    isGhost?: boolean;   // Modo preview durante drag & drop
    isInvalid?: boolean; // Marca visual de posición no válida (normalmente rojo)
    minimalist?: boolean; // Versión compacta usada en la paleta/lateral
    isDeleteState?: boolean; // Estado hover de borrado (muestra "×")
    isSelected?: boolean; // Mesa seleccionada por el cliente (pinta verde oliva)
    statusTone?: 'OCCUPIED' | 'RESERVED'; // Tono visual opcional para estados de reserva en mapas
}

const TableIllustration: React.FC<TableIllustrationProps> = ({
    type,
    id,
    isGhost,
    isInvalid,
    minimalist,
    isDeleteState,
    isSelected,
    statusTone,
}) => {
    const hasStatusTone = Boolean(statusTone);

    const accentColor = statusTone === 'OCCUPIED'
        ? "bg-[#8b4513]"
        : statusTone === 'RESERVED'
        ? "bg-[#4a0e0e]"
        : isDeleteState
        ? "bg-[#4A1A12]"
        : isSelected
        ? "bg-[#5f6d43]"
        : (isInvalid ? "bg-red-500" : (isGhost ? "bg-blue-400/10" : "bg-[#F9F9F9]"));
    
    const borderColor = statusTone === 'OCCUPIED'
        ? "border-[#8b4513]"
        : statusTone === 'RESERVED'
        ? "border-[#4a0e0e]"
        : isDeleteState
        ? "border-[#4A1A12]"
        : isSelected
        ? "border-[#5f6d43]"
        : (isInvalid ? "border-red-600" : (isGhost ? "border-blue-500/20" : "border-gray-200"));
    
    const textColor = hasStatusTone
        ? "text-white"
        : isDeleteState
        ? "text-white"
        : isSelected
        ? "text-white"
        : (isGhost ? "text-blue-900/30" : "text-[#4A1A12]");
    
    const borderStyle = isGhost ? "border-dashed" : "border-solid";
    const isSquare = type === 2 || type === 4;

    /**
     * Calcula las posiciones horizontales (en %) para pintar las sillas
     * superiores e inferiores de la mesa.
     *
     * La idea es mantener la alineación visual entre mesas de distinto ancho:
     * - Mesas pequeñas (2/4): una sola silla centrada.
     * - Mesas medianas (6/8): sillas repartidas en una mesa de 2 columnas.
     * - Mesas grandes (10/12): sillas repartidas en una mesa de 3 columnas.
     *
     * Devuelve un array de porcentajes que luego se usa como `left: "${pos}%"`
     * para cada silla top/bottom.
     */
    const getTopBottomPositions = () => {
        // Mesa de 1 columna: una silla centrada.
        if (type === 2 || type === 4) return [50]; 
        
        // Mesa de 2 columnas.
        // Usamos centros globales para que "encajen" con el grid visual.
        if (type === 6) return [22.887, 50.0, 77.113]; 
        if (type === 8) return [22.887, 50.0, 77.113]; 
        
        // Mesa de 3 columnas.
        // Más puntos de anclaje para distribuir más sillas sin desalinear.
        if (type === 10) return [14.84, 32.42, 50.0, 67.58, 85.16]; 
        if (type === 12) return [14.84, 32.42, 50.0, 67.58, 85.16]; 
        
        // Fallback seguro: centrado.
        return [50];
    };

    const positions = getTopBottomPositions();
    const hasSideChairs = type !== 2 && type !== 6 && type !== 10;

    if (minimalist) {
        return (
            <div className="relative flex items-center justify-center w-full h-full select-none overflow-visible">
                <div className={`flex justify-center w-full group`} style={{ paddingLeft: CONFIG.INSET_X, paddingRight: CONFIG.INSET_X }}>
                    <div 
                        className={`bg-white border-2 border-[#4A1A12] ${CONFIG.ROUNDED} flex items-center justify-center font-black text-[#4A1A12] text-[15px] transition-all relative z-[10] shadow-sm group-hover:bg-[#4A1A12] group-hover:text-white group-hover:scale-105`}
                        style={{ width: isSquare ? CONFIG.BODY_H : '100%', height: CONFIG.BODY_H }}
                    >
                        {type}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center w-full h-full select-none overflow-visible transition-colors duration-200">
            {/* TOP STOOLS */}
            {!isGhost && (
                <div className={`absolute left-0 right-0 z-[30] pointer-events-none`} style={{ top: CONFIG.STOOL_OFFSET, height: CONFIG.STOOL_H }}>
                    {positions.map((pos, i) => (
                        <div 
                            key={i} 
                            className={`absolute top-0 -translate-x-1/2 ${accentColor} border border-solid ${borderColor} ${CONFIG.STOOL_ROUNDED} transition-all`} 
                            style={{ left: `${pos}%`, width: CONFIG.STOOL_W, height: CONFIG.STOOL_H }}
                        />
                    ))}
                </div>
            )}

            {/* MAIN UNIT */}
            <div className="flex items-center w-full justify-center relative">
                {/* LEFT CHAIR */}
                {hasSideChairs && !isGhost && (
                    <div 
                        className={`absolute top-1/2 -translate-y-1/2 z-[30] ${accentColor} border border-solid ${borderColor} ${CONFIG.STOOL_ROUNDED} transition-all`}
                        style={{ left: CONFIG.STOOL_OFFSET, width: CONFIG.STOOL_H, height: CONFIG.STOOL_W }}
                    />
                )}
                
                {/* TABLE BODY */}
                <div className={`flex justify-center w-full`} style={{ paddingLeft: CONFIG.INSET_X, paddingRight: CONFIG.INSET_X }}>
                    <div 
                        className={`${accentColor} border ${borderStyle} ${borderColor} ${CONFIG.ROUNDED} flex items-center justify-center font-bold ${textColor} text-[11px] transition-all relative z-[10] shadow-sm`}
                        style={{ 
                            width: isSquare ? CONFIG.BODY_H : '100%', 
                            height: CONFIG.BODY_H,
                            fontSize: isDeleteState ? '20px' : '11px' 
                        }}
                    >
                        {!isGhost && (isDeleteState && !hasStatusTone ? "×" : (id || (id ? id : type)))}
                    </div>
                </div>

                {/* RIGHT CHAIR */}
                {hasSideChairs && !isGhost && (
                    <div 
                        className={`absolute top-1/2 -translate-y-1/2 z-[30] ${accentColor} border border-solid ${borderColor} ${CONFIG.STOOL_ROUNDED} transition-all`}
                        style={{ right: CONFIG.STOOL_OFFSET, width: CONFIG.STOOL_H, height: CONFIG.STOOL_W }}
                    />
                )}
            </div>

            {/* BOTTOM STOOLS */}
            {!isGhost && (
                <div className={`absolute left-0 right-0 z-[30] pointer-events-none`} style={{ bottom: CONFIG.STOOL_OFFSET, height: CONFIG.STOOL_H }}>
                    {positions.map((pos, i) => (
                        <div 
                            key={i} 
                            className={`absolute top-0 -translate-x-1/2 ${accentColor} border border-solid ${borderColor} ${CONFIG.STOOL_ROUNDED} transition-all`} 
                            style={{ left: `${pos}%`, width: CONFIG.STOOL_W, height: CONFIG.STOOL_H }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TableIllustration;
