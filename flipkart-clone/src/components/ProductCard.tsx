import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  image: string;
  rating?: number | null;
  reviewsCount?: number | null;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  discountPercent,
  image,
  rating,
  reviewsCount,
}: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flipkart-card block group relative">
      <Link to={`/product/${id}`}>
        <div className="p-4">
          {/* Product Image */}
          <div className="relative aspect-square mb-4 overflow-hidden bg-secondary/30 rounded-sm">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            {discountPercent && discountPercent > 0 && (
              <span className="absolute top-2 left-2 bg-offer text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-sm">
                {discountPercent}% off
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            {/* Brand/Name */}
            <h3 className="text-foreground font-medium truncate-2 text-sm leading-5 min-h-10">
              {name}
            </h3>

            {/* Rating */}
            {rating && rating > 0 && (
              <div className="flex items-center gap-2">
                <span className="flipkart-rating">
                  {rating} <Star size={10} fill="currentColor" />
                </span>
                {reviewsCount && (
                  <span className="text-muted-foreground text-xs">
                    ({reviewsCount.toLocaleString()})
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="flipkart-price">{formatPrice(price)}</span>
              {originalPrice && originalPrice > price && (
                <>
                  <span className="flipkart-original-price">{formatPrice(originalPrice)}</span>
                  <span className="flipkart-discount">{discountPercent}% off</span>
                </>
              )}
            </div>

            {/* Free Delivery Badge */}
            {price > 500 && (
              <p className="text-xs text-muted-foreground">Free delivery</p>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist Button - Overlay */}
      <button
        className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 z-10 p-1 bg-white/50 rounded-full"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isInWishlist(id)) {
            removeFromWishlist(id);
          } else {
            addToWishlist({
              id,
              name,
              price,
              originalPrice: originalPrice || undefined,
              discountPercent: discountPercent || undefined,
              image,
              rating: rating || undefined,
              reviewsCount: reviewsCount || undefined
            });
          }
        }}
      >
        <Heart size={18} className={isInWishlist(id) ? "fill-red-500 text-red-500" : ""} />
      </button>
    </div>
  );
}
