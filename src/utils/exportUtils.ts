import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Colors extrets de design-tokens.css
 * ds-brand-wine:   #4a0e0e
 * ds-brand-olive:  #5f6d43
 * ds-brand-gold:   #d4af37
 * ds-canvas:       #f9f7f2
 * ds-surface:      #ffffff
 * ds-avatar-bg:    #d4a93d
 * ds-wine-40:      rgba(74,14,14,0.4) → sobre blanc: #bfa09f aprox → usem #c8b0b0
 */

// ── Paleta de colors (RGB per jsPDF) ────────────────────────────
const C = {
  wine:       [74, 14, 14]   as [number,number,number],   // #4a0e0e
  olive:      [95, 109, 67]  as [number,number,number],   // #5f6d43
  gold:       [212, 175, 55] as [number,number,number],   // #d4af37
  goldAvatar: [212, 169, 61] as [number,number,number],   // #d4a93d
  canvas:     [249, 247, 242] as [number,number,number],  // #f9f7f2
  surface:    [255, 255, 255] as [number,number,number],  // #ffffff
  border:     [232, 227, 220] as [number,number,number],  // derived from wine-40 on white
  wine70:     [138, 96, 96]  as [number,number,number],   // rgba(74,14,14,0.7) blended
  wine40:     [181, 158, 158] as [number,number,number],  // rgba(74,14,14,0.4) blended
  muted:      [107, 114, 128] as [number,number,number],  // ds-ui-muted #6b7280
  dark:       [74, 14, 14]   as [number,number,number],   // main dark text uses wine
  copper:     [139, 69, 19]  as [number,number,number],   // ds-brand-copper #8b4513
};

// ── Tipografies: jsPDF built-in (Helvetica=Montserrat equivalent) ──
// jsPDF no carrega Google Fonts de forma nativa sense embed; usem:
//   'helvetica' bold  → simula Montserrat bold
//   'times'           → simula Playfair Display (serif)

type RestaurantExportData = {
  name: string;
  address: string;
  estat: 'ACTIU' | 'INACTIU';
  taules: number;
  usuaris: number;
  reservesAvui: number;
  zones: number;
  platsDisp: number;
  platsNoDisp: number;
};

type SummaryData = {
  restaurantsActivos: number;
  restaurantsInactivos: number;
  usuarios: number;
  reservasHoy: number;
  reservasSemana: number;
};

export function exportDashboardPDF(
  restaurants: RestaurantExportData[],
  summary: SummaryData
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();   // ~841pt
  const H = doc.internal.pageSize.getHeight();  // ~595pt
  const MARGIN = 40;

  const now = new Date();
  const dateStr = now.toLocaleDateString('ca-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });

  // ════════════════════════════════════════════════════
  //  1. HEADER BAR  (ds-brand-wine com a fons)
  // ════════════════════════════════════════════════════
  const HEADER_H = 72;
  doc.setFillColor(...C.wine);
  doc.rect(0, 0, W, HEADER_H, 'F');

  // Gold accent strip (bottom of header) — simula el border-b-2 wine + gold
  doc.setFillColor(...C.gold);
  doc.rect(0, HEADER_H - 3, W, 3, 'F');

  // Brand name — "DISH" in gold, "SYNC" in white (times bold ≈ Playfair)
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...C.gold);
  doc.text('DISH', MARGIN, 42);
  const dishW = doc.getTextWidth('DISH');
  doc.setTextColor(...C.surface);
  doc.text('SYNC', MARGIN + dishW + 1, 42);

  // Subtitle — "Playfair normal"
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(212, 175, 55, 0.8); // gold suau
  doc.setTextColor(220, 195, 120);
  doc.text('Informe Executiu de Restaurants', MARGIN, 58);

  // Date (right) — Montserrat small
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.wine40);
  doc.setTextColor(220, 200, 180);
  doc.text(`Generat el ${dateStr} a les ${timeStr}`, W - MARGIN, 50, { align: 'right' });

  // ════════════════════════════════════════════════════
  //  2. METRIC CARDS (ds-surface / ds-canvas bg)
  // ════════════════════════════════════════════════════
  const metrics = [
    { label: 'REST. ACTIUS',    value: summary.restaurantsActivos,   color: C.olive },
    { label: 'REST. INACTIUS',  value: summary.restaurantsInactivos,  color: C.wine },
    { label: 'TOTAL USUARIS',   value: summary.usuarios,              color: C.copper },
    { label: 'RESERVES AVUI',   value: summary.reservasHoy,           color: C.wine },
    { label: 'RESERVES SETMANA',value: summary.reservasSemana,        color: C.wine },
  ] as const;

  const CARD_TOP = HEADER_H + 12;
  const CARD_H   = 58;
  const GAP      = 10;
  const CARD_W   = (W - MARGIN * 2 - GAP * (metrics.length - 1)) / metrics.length;

  metrics.forEach((m, i) => {
    const x = MARGIN + i * (CARD_W + GAP);

    // Card bg — ds-surface amb ombra simulada
    doc.setFillColor(...C.surface);
    doc.roundedRect(x, CARD_TOP, CARD_W, CARD_H, 6, 6, 'F');
    // Border — ds-card-border ~wine-05
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, CARD_TOP, CARD_W, CARD_H, 6, 6, 'S');

    // Gold top accent bar
    doc.setFillColor(...C.gold);
    doc.roundedRect(x, CARD_TOP, CARD_W, 3, 2, 2, 'F');

    // Label — ds-caption uppercase tracking
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...C.wine40);
    doc.text(m.label, x + CARD_W / 2, CARD_TOP + 17, { align: 'center' });

    // Value — bold wine
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(...m.color);
    doc.text(String(m.value), x + CARD_W / 2, CARD_TOP + 46, { align: 'center' });
  });

  // ════════════════════════════════════════════════════
  //  3. TABLE SECTION
  // ════════════════════════════════════════════════════
  const TABLE_TOP = CARD_TOP + CARD_H + 16;

  // Section label — uppercase tracking (ds-caption style)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.wine70);
  doc.text('DETALL PER RESTAURANT', MARGIN, TABLE_TOP - 5);

  // Decorative gold underline under section title
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(1);
  doc.line(MARGIN, TABLE_TOP - 3, MARGIN + 145, TABLE_TOP - 3);

  autoTable(doc, {
    startY: TABLE_TOP,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: W - MARGIN * 2,
    head: [[
      'Restaurant', 'Adreça', 'Estat',
      'Taules', 'Usuaris', 'Reserves\nAvui', 'Zones',
      'Plats (D)', 'Plats (N)',
    ]],
    body: restaurants.map((r) => [
      r.name,
      r.address || '—',
      r.estat,
      r.taules,
      r.usuaris,
      r.reservesAvui,
      r.zones,
      r.platsDisp,
      r.platsNoDisp,
    ]),
    headStyles: {
      fillColor: C.wine,
      textColor: C.surface,
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
      cellPadding: { top: 7, bottom: 7, left: 4, right: 4 },
      lineColor: C.gold,
      lineWidth: { bottom: 1.5 },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: C.dark,
      halign: 'center',
      cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', cellWidth: 110 },
      1: { halign: 'left', textColor: C.wine70, cellWidth: 120 },
      2: { halign: 'center', cellWidth: 52 },
    },
    alternateRowStyles: {
      fillColor: C.canvas,  // ds-bg-page color per files alternes
    },
    didParseCell: (data) => {
      // Colored "Estat" text
      if (data.section === 'body' && data.column.index === 2) {
        const val = data.cell.raw as string;
        data.cell.styles.textColor = val === 'ACTIU' ? C.olive : C.wine;
        data.cell.styles.fontStyle = 'bold';
      }
      // Gold value for plats disp
      if (data.section === 'body' && data.column.index === 7) {
        data.cell.styles.textColor = C.olive;
        data.cell.styles.fontStyle = 'bold';
      }
      // Wine for plats no disp
      if (data.section === 'body' && data.column.index === 8) {
        data.cell.styles.textColor = C.wine;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    tableLineColor: C.border,
    tableLineWidth: 0.3,
  });

  // ════════════════════════════════════════════════════
  //  4. FOOTER
  // ════════════════════════════════════════════════════
  const finalY = (doc as any).lastAutoTable?.finalY ?? TABLE_TOP + 100;
  const FOOTER_Y = Math.max(finalY + 18, H - 28);

  // Gold rule
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(1);
  doc.line(MARGIN, FOOTER_Y, W - MARGIN, FOOTER_Y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.wine40);
  doc.text('DishSync · Sistema de Gestió de Restaurants', MARGIN, FOOTER_Y + 12);
  doc.text(`Pàgina 1 de 1`, W - MARGIN, FOOTER_Y + 12, { align: 'right' });

  // ════════════════════════════════════════════════════
  //  5. SAVE
  // ════════════════════════════════════════════════════
  const fileName = `informe-dishsync-${now.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
