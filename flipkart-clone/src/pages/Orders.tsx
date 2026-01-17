import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { getOrders } from "@/lib/supabase";
import { Package, ChevronRight, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Orders() {
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
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

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-20">
          <div className="bg-card rounded-sm shadow-card p-8 text-center max-w-md mx-auto">
            <Package size={80} className="mx-auto text-muted-foreground mb-6" />
            <h1 className="text-xl font-medium text-foreground mb-2">No orders yet!</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't placed any orders.
            </p>
            <Button onClick={() => navigate('/')} className="flipkart-btn-primary">
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header />

      <main className="container mx-auto py-4 px-4">
        <h1 className="flipkart-section-title mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/order-confirmation/${order.id}`}
              className="block bg-card rounded-sm shadow-card hover:shadow-hover transition-shadow"
            >
              <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-primary" />
                  <span className="font-medium text-foreground">{order.order_number}</span>
                </div>
                <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
              </div>

              <div className="p-4">
                {/* Order Items Preview */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {order.order_items?.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white rounded-sm overflow-hidden shrink-0">
                        <img
                          src={item.product_image || '/placeholder.svg'}
                          alt={item.product_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate max-w-40">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.order_items && order.order_items.length > 3 && (
                    <div className="flex items-center">
                      <span className="text-sm text-primary">
                        +{order.order_items.length - 3} more
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Info */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-lg font-medium text-foreground">
                      {formatPrice(Number(order.total))}
                    </span>
                    <span className="ml-2 inline-flex items-center text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
