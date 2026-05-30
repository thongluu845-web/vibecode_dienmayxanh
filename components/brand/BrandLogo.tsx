import { Snowflake } from "lucide-react";

type BrandLogoProps = {
  className?: string;
  textClassName?: string;
  markClassName?: string;
  showText?: boolean;
};

export default function BrandLogo({
  className = "",
  textClassName = "",
  markClassName = "",
  showText = true,
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-700 text-white shadow-lg shadow-sky-500/20 ${markClassName}`}
      >
        <Snowflake size={34} className="absolute opacity-25" />
        <span className="relative text-sm font-black tracking-tight">LT</span>
      </span>
      {showText && (
        <span className={`hidden leading-none sm:block ${textClassName}`}>
          <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-sky-600">Điện lạnh</span>
          <span className="block text-lg font-black tracking-tight text-slate-900">Lưu Thảo</span>
        </span>
      )}
    </span>
  );
}
