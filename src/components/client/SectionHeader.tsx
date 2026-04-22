type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  centered?: boolean;
};

export function SectionHeader({ title, subtitle, centered = false }: SectionHeaderProps) {
  return (
    <div className={centered ? "text-center" : ""}>
      <h2 className="font-ds-display text-4xl font-black uppercase tracking-[-0.02em] text-ds-brand-wine md:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-lg italic text-ds-brand-wine/80">{subtitle}</p>}
    </div>
  );
}
