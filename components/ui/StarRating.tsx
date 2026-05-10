import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";

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
            ? <Star       key={s} style={{ fontSize: size }} className="text-yellow-400" />
            : <StarBorder  key={s} style={{ fontSize: size }} className="text-gray-300"   />
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
