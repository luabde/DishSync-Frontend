import React from 'react';

type ManagementTableProps = {
  /** Llista de títols per a les columnes. Poden ser strings o nodes complexos. */
  headers: (string | React.ReactNode)[];
  /** Els continguts de la taula (normalment files <tr>). */
  children: React.ReactNode;
  /** Contingut opcional per al peu de la taula (ex: paginació). */
  footer?: React.ReactNode;
  /** Classes addicionals per al contenidor exterior. */
  className?: string;
  /** Classes addicionals per a la pròpia etiqueta <table>. */
  tableClassName?: string;
};

/**
 * Component unificat per a les taules de gestió (Usuaris, Restaurants, etc.)
 * Proporciona una estructura visual consistent amb els estils de la marca Dish-Sync.
 */
export function ManagementTable({ 
  headers, 
  children, 
  footer,
  className = '', 
  tableClassName = '' 
}: ManagementTableProps) {
  return (
    <div className={`w-full max-w-[1000px] overflow-hidden rounded-ds-table border border-ds-card-border bg-ds-bg-elevated shadow-ds-table ${className}`}>
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse text-left ${tableClassName}`}>
          <thead>
            <tr className="bg-ds-table-header-bg">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`px-3 py-3 font-ds-sans text-[10px] font-bold uppercase tracking-[1.1px] text-ds-wine-50 sm:px-5 sm:py-4 sm:text-[11px] lg:px-8 ${
                    index === headers.length - 1 ? 'text-right' : ''
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ds-row-divider">
            {children}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="border-t border-ds-row-divider bg-ds-table-header-bg">
          {footer}
        </div>
      )}
    </div>
  );
}


