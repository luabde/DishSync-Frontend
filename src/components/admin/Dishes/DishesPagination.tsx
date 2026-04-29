import { ChevronLeft, ChevronRight } from 'lucide-react';

type DishesPaginationProps = {
  currentPage: number;
  totalPages: number;
  visibleItems: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function DishesPagination({
  currentPage,
  totalPages,
  visibleItems,
  totalItems,
  onPageChange,
}: DishesPaginationProps) {
  // Lista de botones de página en desktop.
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-6 flex w-full max-w-[960px] flex-col items-center justify-center gap-4 border-t border-ds-row-divider bg-ds-table-header-bg px-4 py-5 sm:flex-row sm:justify-between sm:px-6 sm:py-6">
      <p className="text-center font-ds-sans text-xs font-medium text-ds-wine-40 sm:text-left">
        Mostrant {totalItems ? `${visibleItems} de ${totalItems}` : '0'} plats
      </p>
      <div className="flex max-w-full items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={totalPages === 0 || currentPage === 1}
          className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || currentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
          aria-label="Pàgina anterior"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`flex size-8 items-center justify-center rounded font-ds-sans text-xs font-bold ${page === currentPage
              ? 'bg-ds-brand-wine text-white'
              : 'border border-ds-pagination-border bg-ds-bg-elevated text-ds-brand-wine'}`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(totalPages === 0 ? currentPage : Math.min(totalPages, currentPage + 1))}
          disabled={totalPages === 0 || currentPage === totalPages}
          className={`flex size-8 items-center justify-center rounded border border-ds-pagination-border bg-ds-bg-elevated ${totalPages === 0 || currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}`}
          aria-label="Pàgina següent"
        >
          <ChevronRight className="size-3.5 text-ds-brand-wine" />
        </button>
      </div>
    </div>
  );
}
