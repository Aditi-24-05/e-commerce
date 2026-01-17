import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { getOrder } from "@/lib/supabase";
import { CheckCircle, Package, MapPin, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const deliveryDate = new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000);
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-2xl font-medium text-foreground mb-4">Order not found</h1>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header />

      <main className="container mx-auto py-4 px-4">
        {/* Success Banner */}
        <div className="bg-success/10 border border-success/20 rounded-sm p-6 text-center mb-6">
          <CheckCircle size={64} className="mx-auto text-success mb-4" />
          <h1 className="text-2xl font-medium text-foreground mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground">
            Thank you for shopping with us. Your order has been confirmed.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Order Info */}
            <div className="bg-card rounded-sm shadow-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="text-lg font-medium text-primary">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="text-foreground">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-sm p-3 flex items-center gap-3">
                <Package size={20} className="text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">Estimated Delivery</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="bg-card rounded-sm shadow-card">
              <div className="p-4 border-b border-border">
                <h2 className="font-medium text-foreground flex items-center gap-2">
                  <Package size={18} className="text-primary" />
                  Ordered Items
                </h2>
              </div>

              <div className="divide-y divide-border">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-white rounded-sm overflow-hidden shrink-0">
                      <img
                        src={item.product_image || '/placeholder.svg'}
                        alt={item.product_name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-foreground font-medium">{item.product_name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      <p className="text-foreground font-medium mt-2">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-card rounded-sm shadow-card p-4">
              <h2 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                Delivery Address
              </h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="text-foreground font-medium">{order.shipping_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                <p>Phone: {order.shipping_phone}</p>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-sm shadow-card lg:sticky lg:top-24">
              <div className="p-4 border-b border-border">
                <h2 className="text-muted-foreground font-medium text-sm tracking-wider">
                  PAYMENT SUMMARY
                </h2>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(Number(order.subtotal))}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Delivery Charges</span>
                  {Number(order.shipping_cost) === 0 ? (
                    <span className="text-success">FREE</span>
                  ) : (
                    <span className="text-foreground">{formatPrice(Number(order.shipping_cost))}</span>
                  )}
                </div>

                <div className="border-t border-dashed border-border pt-4 flex justify-between font-medium text-lg">
                  <span className="text-foreground">Total Paid</span>
                  <span className="text-foreground">{formatPrice(Number(order.total))}</span>
                </div>

                <div className="bg-muted/50 rounded-sm p-3 text-center">
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="text-sm font-medium text-foreground">Cash on Delivery</p>
                </div>
              </div>

              <div className="p-4 border-t border-border space-y-3">
                <Button
                  onClick={() => navigate('/orders')}
                  className="w-full flipkart-btn-primary h-11"
                >
                  View All Orders
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full h-11 gap-2"
                >
                  <Home size={16} />
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
