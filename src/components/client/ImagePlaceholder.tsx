type ImagePlaceholderProps = {
  altText: string;
  className?: string;
};

export function ImagePlaceholder({ altText, className = "" }: ImagePlaceholderProps) {
  return (
    <div className={`flex items-center justify-center rounded-lg bg-ds-surface-muted ${className}`}>
      <p className="px-4 text-center text-sm text-ds-ui-muted">{altText}</p>
    </div>
  );
}
