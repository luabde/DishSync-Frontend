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
    isVertical?: boolean; // Orientación vertical
    scale?: number; // Escala visual opcional para layouts responsive
}

const TableIllustration: React.FC<TableIllustrationProps> = ({ type, id, isGhost, isInvalid, minimalist, isDeleteState, isVertical, scale = 1 }) => {
    const accentColor = isDeleteState 
        ? "bg-[#4A1A12]" 
        : (isInvalid ? "bg-red-500" : (isGhost ? "bg-blue-400/10" : "bg-[#EDE8E0]"));
    
    const borderColor = isDeleteState 
        ? "border-[#4A1A12]" 
        : (isInvalid ? "border-red-600" : (isGhost ? "border-blue-500/20" : "border-[#4A1A12]/25"));
    
    const textColor = isDeleteState 
        ? "text-white" 
        : (isGhost ? "text-blue-900/30" : "text-[#4A1A12]");
    
    const borderStyle = isGhost ? "border-dashed" : "border-solid";
    const isSquare = type === 2 || type === 4;

    const getPositions = () => {
        if (type === 2 || type === 4) return [50]; 
        if (type === 6 || type === 8) return [22.887, 50.0, 77.113]; 
        if (type === 10 || type === 12) return [14.84, 32.42, 50.0, 67.58, 85.16]; 
        return [50];
    };

    const positions = getPositions();
    const hasSideChairs = type !== 2 && type !== 6 && type !== 10;
    const cellHeight = CONFIG.CELL_H * scale;
    const bodyHeight = CONFIG.BODY_H * scale;
    const stoolWidth = CONFIG.STOOL_W * scale;
    const stoolHeight = CONFIG.STOOL_H * scale;
    const insetX = CONFIG.INSET_X * scale;
    const stoolOffset = CONFIG.STOOL_OFFSET * scale;
    const labelFontSize = 11 * scale;
    const deleteFontSize = 20 * scale;
    const minimalistLabelFontSize = 15 * scale;

    if (minimalist) {
        return (
            <div className="relative flex items-center justify-center w-full h-full select-none overflow-visible">
                <div 
                    className={`flex justify-center transition-all duration-500 group ${isVertical ? 'rotate-90' : ''}`} 
                    style={{ 
                        paddingLeft: isVertical ? 0 : insetX, 
                        paddingRight: isVertical ? 0 : insetX,
                        width: isVertical ? cellHeight : '100%',
                        height: isVertical ? '100%' : cellHeight
                    }}
                >
                    <div 
                        className={`bg-[#EDE8E0] border-2 border-[#4A1A12]/30 ${CONFIG.ROUNDED} flex items-center justify-center font-black text-[#4A1A12] transition-all relative z-[10] shadow-sm group-hover:bg-[#4A1A12] group-hover:text-white group-hover:scale-105`}
                        style={{ 
                            width: isSquare ? bodyHeight : '100%', 
                            height: bodyHeight,
                            fontSize: minimalistLabelFontSize,
                        }}
                    >
                        <span className={isVertical ? '-rotate-90' : ''}>{type}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative flex items-center justify-center w-full h-full select-none overflow-visible transition-all duration-300`}>
            {/* CHAIRS ON LONG SIDES (Top/Bottom if horizontal, Left/Right if vertical) */}
            {!isGhost && (
                <div 
                    className={`absolute z-[30] pointer-events-none inset-0`} 
                >
                    {positions.map((pos, i) => (
                        <React.Fragment key={i}>
                            {/* Side A (Top or Left) */}
                            <div 
                                className={`absolute ${accentColor} border border-solid ${borderColor} ${CONFIG.STOOL_ROUNDED} transition-all`} 
                                style={{ 
                                    left: isVertical ? stoolOffset : `${pos}%`, 
                                    top: isVertical ? `${pos}%` : stoolOffset,
                                    width: isVertical ? stoolHeight : stoolWidth, 
                                    height: isVertical ? stoolWidth : stoolHeight,
                                    transform: isVertical ? 'translateY(-50%)' : 'translateX(-50%)'
                                }}
                            />
                            {/* Side B (Bottom or Right) */}
                            <div 
                                className={`absolute ${accentColor} border border-solid ${borderColor} ${CONFIG.STOOL_ROUNDED} transition-all`} 
                                style={{ 
                                    right: isVertical ? stoolOffset : 'auto',
                                    left: isVertical ? 'auto' : `${pos}%`, 
                                    bottom: isVertical ? 'auto' : stoolOffset,
                                    top: isVertical ? `${pos}%` : 'auto',
                                    width: isVertical ? stoolHeight : stoolWidth, 
                                    height: isVertical ? stoolWidth : stoolHeight,
                                    transform: isVertical ? 'translateY(-50%)' : 'translateX(-50%)'
                                }}
                            />
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* MAIN UNIT */}
            <div className={`flex items-center justify-center relative w-full h-full ${isVertical ? 'flex-col' : 'flex-row'}`}>
                {/* HEAD CHAIRS (Side chairs for horizontal, Top/Bottom for vertical) */}
                {hasSideChairs && !isGhost && (
                    <>
                        <div 
                            className={`absolute z-[30] ${accentColor} border border-solid ${borderColor} ${CONFIG.STOOL_ROUNDED} transition-all`}
                            style={{ 
                                width: isVertical ? stoolWidth : stoolHeight, 
                                height: isVertical ? stoolHeight : stoolWidth,
                                ...(isVertical
                                    ? { left: '50%', top: stoolOffset, transform: 'translateX(-50%)' }
                                    : { left: stoolOffset, top: '50%', transform: 'translateY(-50%)' })
                            }}
                        />
                        <div 
                            className={`absolute z-[30] ${accentColor} border border-solid ${borderColor} ${CONFIG.STOOL_ROUNDED} transition-all`}
                            style={{ 
                                right: isVertical ? 'auto' : stoolOffset,
                                bottom: isVertical ? stoolOffset : 'auto',
                                width: isVertical ? stoolWidth : stoolHeight, 
                                height: isVertical ? stoolHeight : stoolWidth,
                                ...(isVertical ? { left: '50%', transform: 'translateX(-50%)' } : { top: '50%', transform: 'translateY(-50%)' })
                            }}
                        />
                    </>
                )}
                
                {/* TABLE BODY */}
                <div 
                    className={`flex justify-center items-center`} 
                    style={{ 
                        paddingLeft: isVertical ? 0 : insetX, 
                        paddingRight: isVertical ? 0 : insetX,
                        paddingTop: isVertical ? insetX : 0,
                        paddingBottom: isVertical ? insetX : 0,
                        width: '100%',
                        height: '100%'
                    }}
                >
                    <div 
                        className={`${accentColor} border ${borderStyle} ${borderColor} ${CONFIG.ROUNDED} flex items-center justify-center font-bold ${textColor} text-[11px] transition-all relative z-[10] shadow-sm`}
                        style={{ 
                            width: isSquare ? bodyHeight : (isVertical ? bodyHeight : '100%'), 
                            height: isSquare ? bodyHeight : (isVertical ? '100%' : bodyHeight),
                            fontSize: isDeleteState ? deleteFontSize : labelFontSize,
                        }}
                    >
                        {!isGhost && (isDeleteState ? "×" : (id || (id ? id : type)))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableIllustration;
