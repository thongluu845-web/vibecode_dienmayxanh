import { Star } from "@phosphor-icons/react/dist/ssr";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export default function StarRating({ rating, reviewCount, size = 15 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) =>
          s <= Math.round(rating)
            ? <Star key={s} size={size} weight="fill" className="text-yellow-400" />
            : <Star key={s} size={size} weight="regular" className="text-gray-300" />
        )}
      </div>
      <span className="text-xs text-gray-500">
        {rating.toFixed(1)}
        {reviewCount !== undefined && (
          <span className="text-gray-400"> ({reviewCount.toLocaleString("vi-VN")} đánh giá)</span>
        )}
      </span>
    </div>
  );
}
