type Tono = "success" | "neutral" | "warning" | "danger";

const TONE_CLASSES: Record<Tono, string> = {
  success: "bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]",
  neutral: "bg-surface-container text-on-surface-variant border-outline-variant",
  warning: "bg-[#FFF8E1] text-[#8D6E00] border-[#F5E39A]",
  danger: "bg-error-container text-on-error-container border-error/30",
};

export function EstadoBadge({ label, tone }: { label: string; tone: Tono }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-label-caps font-label-caps ${TONE_CLASSES[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
