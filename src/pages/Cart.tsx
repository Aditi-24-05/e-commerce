import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { CartItem } from "@/components/CartItem";
import { getCartItems, updateCartItemQuantity, removeFromCart } from "@/lib/supabase";
import { ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCartItems,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItemQuantity(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => {
      toast.error('Failed to update quantity');
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateQuantityMutation.mutate({ itemId, quantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => {
    return sum + (Number(item.product?.price) * item.quantity);
  }, 0) || 0;

  const originalTotal = cartItems?.reduce((sum, item) => {
    const originalPrice = item.product?.original_price 
      ? Number(item.product.original_price) 
      : Number(item.product?.price);
    return sum + (originalPrice * item.quantity);
  }, 0) || 0;

  const discount = originalTotal - subtotal;
  const deliveryCharge = subtotal > 500 ? 0 : 40;
  const total = subtotal + deliveryCharge;
  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-20">
          <div className="bg-card rounded-sm shadow-card p-8 text-center max-w-md mx-auto">
            <ShoppingBag size={80} className="mx-auto text-muted-foreground mb-6" />
            <h1 className="text-xl font-medium text-foreground mb-2">Your cart is empty!</h1>
            <p className="text-muted-foreground mb-6">
              Add items to it now.
            </p>
            <Button onClick={() => navigate('/')} className="flipkart-btn-primary">
              Shop now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <Header />

      <main className="container mx-auto py-4 px-4">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-sm shadow-card">
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h1 className="text-lg font-medium text-foreground">
                  My Cart ({totalItems})
                </h1>
                {subtotal > 500 && (
                  <span className="text-sm text-success">Free Delivery</span>
                )}
              </div>

              {/* Items */}
              <div>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    id={item.id}
                    productId={item.product_id}
                    name={item.product?.name || ''}
                    image={item.product?.images?.[0] || '/placeholder.svg'}
                    price={Number(item.product?.price) || 0}
                    originalPrice={item.product?.original_price ? Number(item.product.original_price) : null}
                    quantity={item.quantity}
                    stock={item.product?.stock || 0}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>

              {/* Place Order - Desktop */}
              <div className="hidden lg:flex p-4 border-t border-border justify-end">
                <Button
                  onClick={() => navigate('/checkout')}
                  className="flipkart-btn-buy px-8 h-12 gap-2"
                >
                  PLACE ORDER <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Price Details */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-sm shadow-card lg:sticky lg:top-24">
              <div className="p-4 border-b border-border">
                <h2 className="text-muted-foreground font-medium text-sm tracking-wider">
                  PRICE DETAILS
                </h2>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Price ({totalItems} items)</span>
                  <span className="text-foreground">{formatPrice(originalTotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Discount</span>
                    <span className="text-success">- {formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Delivery Charges</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-success">FREE</span>
                  ) : (
                    <span className="text-foreground">{formatPrice(deliveryCharge)}</span>
                  )}
                </div>

                <div className="border-t border-dashed border-border pt-4 flex justify-between font-medium">
                  <span className="text-foreground">Total Amount</span>
                  <span className="text-foreground">{formatPrice(total)}</span>
                </div>

                {discount > 0 && (
                  <p className="text-success text-sm font-medium pt-2 border-t border-border">
                    You will save {formatPrice(discount)} on this order
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Place Order */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 flex items-center justify-between z-40">
        <div>
          <span className="text-lg font-medium text-foreground">{formatPrice(total)}</span>
          <p className="text-xs text-muted-foreground">View price details</p>
        </div>
        <Button
          onClick={() => navigate('/checkout')}
          className="flipkart-btn-buy px-6 h-12 gap-2"
        >
          PLACE ORDER <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
