import { useState, useEffect, useRef } from "react";
import TableIllustration from "../../admin/CreateRestaurant/TableIllustration";
import { useClientReservation } from "../../../hooks/clientReservation.hook";

/**
 * TableIllustration solo acepta estos valores para el prop `type`.
 * Representan las capacidades visuales de la mesa (número de sillas dibujadas).
 */
const VALID_TYPES = [2, 4, 6, 8, 10, 12] as const;
type TableType = (typeof VALID_TYPES)[number];

/**
 * Convierte cualquier número de personas al tipo visual más cercano hacia arriba.
 * Se usa porque TableIllustration no puede dibujar exactamente 3 sillas, solo 2 o 4.
 * Ejemplos: 1→2, 3→4, 5→6, 7→8, 9→10, 11→12.
 */
function snapToTableType(n: number): TableType {
  return (VALID_TYPES.find((t) => t >= n) ?? 12) as TableType;
}

/**
 * Props recibidos desde ClientReservation.tsx:
 * - submitAttempted: si el usuario pulsó "Confirmar" sin elegir mesa, activa el mensaje de error.
 * - onConfirmTable: callback que avanza al siguiente paso.
 * - onZoneChange: callback que recarga las mesas cuando se cambia de zona.
 */
type StepTableSelectionProps = {
  submitAttempted: boolean;
  onConfirmTable: () => void;
  onZoneChange: (zoneId: number) => Promise<void>;
};

export default function StepTableSelection({
  submitAttempted,
  onConfirmTable,
  onZoneChange,
}: StepTableSelectionProps) {
  const {
    zones,           // Lista de zonas del restaurante para las pestañas.
    activeZoneId,    // Zona actualmente seleccionada.
    taulesDisponibles, // Mesas de la zona activa devueltas por el backend.
    selectedTableId,   // Id de la mesa que el usuario ha clicado.
    setSelectedTableId,
    selectedNumPeople, // Número de personas elegido en el selector.
    setSelectedNumPeople,
  } = useClientReservation();

  // Lògica per a l'indicador lliscant (slider adaptatiu per al client)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const zoneRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const idx = zones.findIndex(z => z.id === activeZoneId);
    const el = zoneRefs.current[idx];
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeZoneId, zones]);

  /**
   * Id de la mesa sobre la que está el cursor en este momento.
   * Permite pintar el hover verde sin tocar TableIllustration desde fuera,
   * igual que el admin hace con isDeleteState en el hover de borrado.
   */
  const [hoveredTableId, setHoveredTableId] = useState<number | null>(null);

  // Muestra el mensaje de validación solo si se intentó confirmar sin mesa seleccionada.
  const hasError = submitAttempted && !selectedTableId;
  const hasTables = taulesDisponibles.length > 0;

  /**
   * Número de filas que necesita el grid.
   * fila es 0-indexed, así que fila=0 + span_fila=1 → ocupa hasta la fila 1 (necesitamos 1 fila).
   * fila=2 + span_fila=2 → ocupa hasta la fila 4 (necesitamos 4 filas).
   * Cogemos el máximo de todas las mesas para saber cuántas filas hay que dibujar en total.
   * Si no hay mesas usamos 4 como valor por defecto.
   */
  const rowCount = hasTables
    ? Math.max(...taulesDisponibles.map((t) => t.fila + t.span_fila))
    : 4;

  // Objeto completo de la mesa seleccionada, necesario para calcular el rango del selector.
  const selectedTable = taulesDisponibles.find((t) => t.id === selectedTableId) ?? null;

  /**
   * Opciones del selector de personas: todos los enteros del rango
   * [min_persones_reserva, num_persones_taula], sin saltos.
   * Ejemplo: mesa de 4 con mínimo 1 → [1, 2, 3, 4].
   * Solo se calcula cuando hay una mesa seleccionada.
   */
  const personOptions: number[] = [];
  if (selectedTable) {
    for (let n = selectedTable.min_persones_reserva; n <= selectedTable.num_persones_taula; n++) {
      personOptions.push(n);
    }
  }

  /**
   * Al seleccionar una mesa:
   * 1. Guardamos su id en el contexto.
   * 2. Inicializamos el número de personas al máximo de la mesa (todas las sillas visibles).
   * El usuario puede reducirlo después con el selector.
   */
  const handleSelectTable = (tableId: number, numPersonesMax: number) => {
    setSelectedTableId(tableId);
    setSelectedNumPeople(numPersonesMax);
  };

  return (
    <section className="mx-auto w-full max-w-4xl">
      {/* Pestañas de zonas — mismo estilo que el admin (border-[#4A1A12], fondo activo oscuro) */}
      {zones.length > 0 && (
        <div className="mb-10 flex justify-center pt-2">
          <div className="relative mx-auto flex w-fit rounded-[10px] border-2 border-ds-brand-wine p-1">
            {/* Slider Color Vi Adaptatiu */}
            <div 
              className="absolute top-1 bottom-1 rounded-md bg-ds-brand-wine transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-0"
              style={{ 
                left: indicatorStyle.left, 
                width: indicatorStyle.width 
              }}
            />
            {zones.map((zone, idx) => (
              <button
                key={zone.id}
                ref={(el) => { zoneRefs.current[idx] = el; }}
                type="button"
                onClick={() => void onZoneChange(zone.id)}
                className={`relative z-10 px-7 py-2 rounded-md text-xs font-bold transition-colors duration-300 ${
                  activeZoneId === zone.id
                    ? "text-white"
                    : "text-ds-brand-wine hover:text-ds-brand-wine/80"
                }`}
              >
                {zone.nom}
              </button>
            ))}
          </div>
        </div>
      )}

      {/*
        Plano de mesas.
        Contenedor idéntico al de Step4TableMap del admin:
        fondo blanco, esquinas redondeadas, sombra sutil y scroll vertical.
      */}
      <div className="flex justify-center">
        <div className="w-full max-w-[520px] shrink-0">
          <div className="relative bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,26,18,0.05)] min-h-[560px] overflow-hidden">
            <div className="h-full overflow-y-auto max-h-[680px] relative z-10">
              {!hasTables ? (
                <div className="flex min-h-[560px] items-center justify-center">
                  <p className="text-sm text-[#4A1A12]/40">
                    No hi ha taules per a la zona seleccionada.
                  </p>
                </div>
              ) : (
                /*
                  Grid: 3 columnas, gap-6, altura de fila fija (rowCount).
                  Cada mesa lleva en su div un `style` con gridColumn y gridRow;
                  sin eso el navegador solo rellena celdas en orden (1ª mesa arriba-izq., 2ª a la derecha…)
                  y no respeta fila/columna de la BD.
                */
                <div
                  className="grid w-full grid-cols-3 gap-6 p-4"
                  style={{
                    gridTemplateRows: `repeat(${rowCount}, 130px)`,
                  }}
                >
                  {taulesDisponibles.map((table) => {
                    const isOccupied = !!table.estat_reserva;
                    const isSelected = selectedTableId === table.id;
                    const displayType: TableType = snapToTableType(table.num_persones_taula);

                    /*
                      Posición en el CSS Grid las mesas.

                      -- Por qué "+1" en columna y fila --
                      En la base de datos fila y columna empiezan en 0 (primera fila = 0, primera columna = 0).
                      En CSS Grid las *líneas* del grid se numeran desde 1: la izquierda del plano es la línea 1,
                      no la 0. Por eso la esquina superior izquierda de la mesa empieza en la línea `columna + 1`
                      en horizontal y `fila + 1` en vertical.

                      -- Qué significa "span" --
                      Una mesa puede ocupar más de una casilla (por ejemplo 2 columnas de ancho).
                      `span_columna` y `span_fila` dicen cuántas pistas (celdas) ocupa la mesa en cada eje.
                      La sintaxis "línea-inicio / span N" significa: empieza aquí y ocupa N columnas o N filas.

                      Ejemplo: columna=0, fila=1, span_columna=1, span_fila=1
                        → gridColumn: "1 / span 1"  (primera columna del plano)
                        → gridRow:    "2 / span 1"  (segunda fila del plano)

                      Sin estas propiedades el navegador colocaría las mesas una tras otra en orden de lista,
                      ignorando fila y columna guardadas al crear el restaurante.
                    */
                    return (
                      <div
                        key={table.id}
                        className={`relative z-20 flex h-full w-full min-h-0 items-center justify-center overflow-visible rounded-2xl ${
                          isOccupied ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                        style={{
                          gridColumn: `${table.columna + 1} / span ${table.span_columna}`,
                          gridRow: `${table.fila + 1} / span ${table.span_fila}`,
                        }}
                        onMouseEnter={() => setHoveredTableId(table.id)}
                        onMouseLeave={() => setHoveredTableId(null)}
                        onClick={() => {
                          if (!isOccupied) {
                            handleSelectTable(table.id, table.num_persones_taula);
                          }
                        }}
                      >
                        <TableIllustration
                          type={displayType}
                          id={`T${table.id}`}
                          isDeleteState={isOccupied}
                          isSelected={
                            isSelected ||
                            (!isOccupied && hoveredTableId === table.id)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*
        Selector de número de personas.
        Solo aparece cuando hay una mesa seleccionada.
        Muestra todos los enteros del rango [min_persones_reserva, num_persones_taula].
        Al cambiar el número, solo se actualiza la cantidad de personas de la reserva.
        La ilustración de sillas se mantiene fija según la capacidad real de la mesa.
        Color verde oliva (#5f6d43 = ds-brand-olive) para coincidir con el estilo del Figma.
      */}
      {selectedTable && personOptions.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-[520px] rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_8px_24px_rgba(74,26,18,0.06)]">
            <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#5f6d43]/60">
              Nombre de persones
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {personOptions.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSelectedNumPeople(count)}
                  className={`h-10 w-10 border-2 border-[#5f6d43] text-sm font-black transition-all ${
                    selectedNumPeople === count
                      ? "bg-[#5f6d43] text-white"       // Activo: fondo verde, texto blanco.
                      : "bg-white text-[#5f6d43] hover:bg-[#5f6d43]/10" // Inactivo: borde verde.
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de validación: solo si se pulsó "Confirmar" sin elegir mesa. */}
      {hasError && (
        <p className="mt-6 text-center text-sm font-medium text-red-700">
          Heu de seleccionar una taula per continuar.
        </p>
      )}

      {/* Botón de confirmación: deshabilitado hasta que haya mesa seleccionada. */}
      <div className="mx-auto mt-10 flex w-full max-w-2xl justify-center pb-4">
        <button
          type="button"
          onClick={onConfirmTable}
          disabled={!hasTables || !selectedTableId}
          className="w-full rounded-ds-sm border-2 border-ds-brand-wine bg-transparent py-4 font-ds-sans text-sm font-bold uppercase tracking-[1.5px] text-ds-brand-wine transition-all duration-300 hover:bg-ds-brand-wine hover:text-white hover:shadow-ds-btn active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </section>
  );
}
