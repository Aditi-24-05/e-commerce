import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number | null;
  quantity: number;
  stock: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({
  id,
  productId,
  name,
  image,
  price,
  originalPrice,
  quantity,
  stock,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="flex gap-4 p-4 border-b border-border last:border-b-0">
      {/* Product Image */}
      <Link to={`/product/${productId}`} className="shrink-0">
        <div className="w-24 h-24 lg:w-28 lg:h-28 bg-white rounded-sm overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link to={`/product/${productId}`}>
          <h3 className="text-foreground font-medium text-sm lg:text-base truncate-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <span className="flipkart-price text-base lg:text-lg">{formatPrice(price)}</span>
          {originalPrice && originalPrice > price && (
            <>
              <span className="flipkart-original-price">{formatPrice(originalPrice)}</span>
              <span className="flipkart-discount">{discount}% off</span>
            </>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center border border-border rounded-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => onUpdateQuantity(id, quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus size={14} />
            </Button>
            <span className="w-12 text-center text-sm font-medium border-x border-border">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => onUpdateQuantity(id, quantity + 1)}
              disabled={quantity >= stock}
            >
              <Plus size={14} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(id)}
          >
            <Trash2 size={16} className="mr-1" />
            Remove
          </Button>
        </div>

        {/* Stock Warning */}
        {stock < 10 && (
          <p className="text-xs text-warning mt-2">Only {stock} left in stock</p>
        )}
      </div>

      {/* Item Total (Desktop) */}
      <div className="hidden lg:block text-right">
        <span className="text-foreground font-medium">
          {formatPrice(price * quantity)}
        </span>
      </div>
    </div>
  );
}
