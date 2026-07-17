interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * The "D" monogram from the brand kit: a ring containing a rounded bar +
 * offset half-circle. Built from primitives (not an SVG import) so the size
 * and stroke scale together exactly as in the design reference.
 */
export function LogoMark({ size = 38, className = "" }: LogoMarkProps) {
  const stroke = Math.max(1.25, size * 0.04);
  const barWidth = size * 0.4;
  const barHeight = size * 0.45;

  return (
    <div
      className={`flex items-center justify-center rounded-full border-ink-700 ${className}`}
      style={{ width: size, height: size, borderWidth: stroke, borderStyle: "solid" }}
    >
      <div
        className="relative rounded-r-full border-ink-700"
        style={{
          width: barWidth,
          height: barHeight,
          borderWidth: stroke,
          borderStyle: "solid",
          borderLeft: "none",
        }}
      >
        <div
          className="absolute top-0 bottom-0 bg-ink-700"
          style={{ left: -stroke * 3, width: stroke * 2 }}
        />
      </div>
    </div>
  );
}

interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  dark?: boolean;
}

const sizeMap = {
  sm: { mark: 32, title: "text-[12px]", tagline: "text-[6px]" },
  md: { mark: 38, title: "text-[13px]", tagline: "text-[6.5px]" },
  lg: { mark: 48, title: "text-[16px]", tagline: "text-[8px]" },
};

export function Logo({ size = "md", withTagline = true, dark = false }: WordmarkProps) {
  const s = sizeMap[size];
  const titleColor = dark ? "text-white" : "text-ink-900";
  const taglineColor = dark ? "text-dark-500" : "text-ink-500";

  return (
    <div className="flex items-center gap-[11px]">
      <LogoMark size={s.mark} />
      <div>
        <div className={`${s.title} font-medium tracking-[0.2em] ${titleColor}`}>
          UMER DESIGNS
        </div>
        {withTagline && (
          <div className={`${s.tagline} tracking-[0.2em] ${taglineColor}`}>
            TENDING YOUR VISIONS INTO REALITY
          </div>
        )}
      </div>
    </div>
  );
}
