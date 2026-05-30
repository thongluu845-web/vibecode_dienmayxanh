import type { LucideIcon } from "lucide-react";
import { Package, Refrigerator, ShowerHead, Snowflake, WashingMachine } from "lucide-react";

type CategoryIconProps = {
  slug: string;
  className?: string;
  size?: number;
};

const icons: Record<string, LucideIcon> = {
  "may-lanh": Snowflake,
  "may-giat": WashingMachine,
  "tu-lanh": Refrigerator,
  "may-nuoc-nong": ShowerHead,
};

export default function CategoryIcon({ slug, className, size = 20 }: CategoryIconProps) {
  const Icon = icons[slug] ?? Package;

  return <Icon aria-hidden="true" className={className} size={size} strokeWidth={2.4} />;
}
