import { Image as ImageIcon } from 'lucide-react';

// Props del uploader reutilizable para formularios con imagen.
type FormImageUploadProps = {
  // Texto de etiqueta mostrado sobre el campo.
  label: string;
  // URL actual a mostrar en preview (temporal o persistida).
  previewUrl?: string | null;
  // Alt accesible para la imagen de preview.
  previewAlt?: string;
  // Callback que devuelve el archivo seleccionado al componente padre.
  onFileChange: (file: File) => void;
  // Callback para eliminar la imagen actual (preview o persistida).
  onRemoveImage: () => void;
  // Clases extra para adaptar layout según pantalla/formulario.
  className?: string;
  // Texto de ayuda mostrado cuando no hay imagen.
  placeholderText?: string;
};

export default function FormImageUpload({
  label,
  previewUrl,
  previewAlt = 'Image preview',
  onFileChange,
  onRemoveImage,
  className = '',
  placeholderText = 'Haz clic o arrastra una imagen aquí',
}: FormImageUploadProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs font-bold uppercase tracking-wider text-brand-primary ml-1">{label}</label>
      <label className="relative block border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-[#F5F5F5]/50 group hover:bg-[#F5F5F5] hover:border-brand-accent2/30 transition-all cursor-pointer">
        {/* Input nativo oculto para abrir selector de archivos con click en toda el área. */}
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={(event) => {
            // Solo usamos el primer archivo seleccionado.
            const selectedFile = event.target.files?.[0];
            if (!selectedFile) return;
            onFileChange(selectedFile);
            // Limpia el input para permitir re-seleccionar el mismo archivo si hace falta.
            event.target.value = '';
          }}
          className="hidden"
        />
        {previewUrl ? (
          <div className="relative h-48 w-full rounded-xl overflow-hidden">
            <img src={previewUrl} alt={previewAlt} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(event) => {
                // Evita abrir el file picker al hacer click en la cruz.
                event.preventDefault();
                onRemoveImage();
              }}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white text-xs font-bold hover:bg-black/80 transition-colors"
            >
              x
            </button>
          </div>
        ) : (
          // Estado vacío: icono + texto de ayuda para invitar a subir imagen.
          <div className="flex flex-col items-center justify-center gap-3 h-24">
            <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
              <ImageIcon className="h-6 w-6 text-brand-gray/40 group-hover:text-brand-accent2 transition-colors" />
            </div>
            <p className="text-[11px] text-brand-gray/60 leading-relaxed text-center">
              {placeholderText}
              <br />
              <span className="opacity-60 text-[10px] uppercase font-bold">Formato: JPG, PNG (Max. 5MB)</span>
            </p>
          </div>
        )}
      </label>
    </div>
  );
}
