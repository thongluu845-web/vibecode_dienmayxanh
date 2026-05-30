import Image from "next/image";
import { getBrandAsset } from "@/lib/brand-assets";

type ApplianceBrandLogoProps = {
  brand: string;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showName?: boolean;
  priority?: boolean;
  sizes?: string;
};

export default function ApplianceBrandLogo({
  brand,
  className = "",
  imageClassName = "",
  textClassName = "",
  showName = false,
  priority = false,
  sizes = "96px",
}: ApplianceBrandLogoProps) {
  const asset = getBrandAsset(brand);

  if (!asset) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <span className={`text-xs font-black uppercase text-blue-700 ${textClassName}`}>{brand}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <Image
        src={asset.logo}
        alt={`${asset.name} logo`}
        width={asset.width}
        height={asset.height}
        priority={priority}
        sizes={sizes}
        className={`h-auto w-auto object-contain ${imageClassName}`}
      />
      {showName && <span className={`truncate text-xs font-black text-slate-700 ${textClassName}`}>{asset.name}</span>}
    </span>
  );
}
