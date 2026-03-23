import React from 'react';

// ARCHITECTURAL CONSTANTS - THE GROUND TRUTH
const CONFIG = {
    CELL_H: 130, // Reference cell height for 1-column tables
    BODY_H: 82,  // Main table body height
    STOOL_W: 58,  // Widened seating profile
    STOOL_H: 15,  // Slimmed/Elegant seating profile
    INSET_X: 24,  // Side insets for body alignment
    STOOL_OFFSET: 2, // Standard air gap from body
    ROUNDED: "rounded-[0.4rem]",      
    STOOL_ROUNDED: "rounded-[0.25rem]" 
};

/**
 * ARCHITECTURAL GLOBAL GRID (High Precision)
 * Goal: Chairs must line up across different table widths.
 * 
 * Column Width: 130px
 * Gap: 24px (Tailwind gap-6)
 * 2-Cell Container: 284px (130*2 + 24)
 * 3-Cell Container: 438px (130*3 + 24*2)
 */

export interface TableIllustrationProps {
    type: 2 | 4 | 6 | 8 | 10 | 12;
    active?: boolean;
    id?: string;
    isGhost?: boolean;   
    isInvalid?: boolean; 
    minimalist?: boolean; 
    isDeleteState?: boolean; 
}

const TableIllustration: React.FC<TableIllustrationProps> = ({ type, id, isGhost, isInvalid, minimalist, isDeleteState }) => {
    const accentColor = isDeleteState 
        ? "bg-[#4A1A12]" 
        : (isInvalid ? "bg-red-500" : (isGhost ? "bg-blue-400/10" : "bg-[#F9F9F9]"));
    
    const borderColor = isDeleteState 
        ? "border-[#4A1A12]" 
        : (isInvalid ? "border-red-600" : (isGhost ? "border-blue-500/20" : "border-gray-200"));
    
    const textColor = isDeleteState 
        ? "text-white" 
        : (isGhost ? "text-blue-900/30" : "text-[#4A1A12]");
    
    const borderStyle = isGhost ? "border-dashed" : "border-solid";
    const isSquare = type === 2 || type === 4;

    /**
     * HIGH-PRECISION ALIGNMENT LOGIC
     * Anchoring stools to shared columns regardless of the table width.
     */
    const getTopBottomPositions = () => {
        // 130px (1 Cell) -> Center: 65px (50%)
        if (type === 2 || type === 4) return [50]; 
        
        // 284px (2 Cells) -> Global Centers: [65, 142, 219]px
        // 65/284 = 22.887% | 142/284 = 50.0% | 219/284 = 77.113%
        if (type === 6) return [22.887, 77.113]; 
        if (type === 8) return [22.887, 50.0, 77.113]; 
        
        // 438px (3 Cells) -> Global Centers: [65, 142, 219, 296, 373]px
        // 65/438 = 14.84% | 142/438 = 32.42% | 219/438 = 50.0% | 296/438 = 67.58% | 373/438 = 85.16%
        if (type === 10) return [14.84, 32.42, 67.58, 85.16]; 
        if (type === 12) return [14.84, 32.42, 50.0, 67.58, 85.16]; 
        
        return [50];
    };

    const positions = getTopBottomPositions();
    const hasSideChairs = type !== 2;

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
                        {!isGhost && (isDeleteState ? "×" : (id || (id ? id : type)))}
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
