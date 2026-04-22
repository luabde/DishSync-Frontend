import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

type ViewType = 'TABLE' | 'GRID';

type ViewToggleProps = {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
};

export function ViewToggle({ view, onViewChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`flex items-center gap-1 rounded-lg bg-ds-table-header-bg p-1 border border-ds-card-border ${className}`}>
      <button
        type="button"
        onClick={() => onViewChange('TABLE')}
        className={`flex size-8 items-center justify-center rounded-md transition-all ${
          view === 'TABLE' 
            ? 'bg-ds-brand-wine text-white shadow-sm' 
            : 'text-ds-brand-wine/60 hover:bg-ds-brand-wine/10'
        }`}
        title="Vista de llista"
      >
        <List className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewChange('GRID')}
        className={`flex size-8 items-center justify-center rounded-md transition-all ${
          view === 'GRID' 
            ? 'bg-ds-brand-wine text-white shadow-sm' 
            : 'text-ds-brand-wine/60 hover:bg-ds-brand-wine/10'
        }`}
        title="Vista de graella"
      >
        <LayoutGrid className="size-4" />
      </button>
    </div>
  );
}
