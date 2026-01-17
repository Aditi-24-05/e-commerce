import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { getCartItems, createOrder, sendOrderNotification, type ShippingAddress } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Package, CreditCard, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentOptions } from "@/components/PaymentOptions";
import { processPayment, type PaymentState } from "@/lib/payment";
import { toast } from "sonner";

export default function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<ShippingAddress>({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });

    const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

    const [paymentState, setPaymentState] = useState<PaymentState>({ method: 'COD' });
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const { data: cartItems, isLoading: cartLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCartItems,
    });

    const createOrderMutation = useMutation({
        mutationFn: (data: { address: ShippingAddress, payment: { method: string, status: string, transactionId?: string } }) =>
            createOrder(data.address, data.payment),
        onSuccess: async (order) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });

            // Send notification if user is logged in
            if (user?.email) {
                try {
                    await sendOrderNotification(user.email, order, user.id);
                    toast.success(`Order confirmation sent to ${user.email}`);
                } catch (err) {
                    console.error('Notification error:', err);
                    // We don't block the UI if notification fails, but log it
                }
            }

            navigate(`/order-confirmation/${order.id}`);
        },
        onError: (error) => {
            toast.error('Failed to place order. Please try again.');
            console.error('Order error:', error);
            setIsProcessingPayment(false);
        },
    });

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

    const deliveryCharge = subtotal > 500 ? 0 : 40;
    const total = subtotal + deliveryCharge;
    const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const validateForm = (): boolean => {
        const newErrors: Partial<ShippingAddress> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        else if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = 'Enter valid 10-digit phone';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(formData.pincode.trim())) newErrors.pincode = 'Enter valid 6-digit pincode';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsProcessingPayment(true);
            try {
                // Process Payment
                const result = await processPayment(total, paymentState);

                if (result.success) {
                    createOrderMutation.mutate({
                        address: formData,
                        payment: {
                            method: paymentState.method,
                            status: result.success ? 'COMPLETED' : 'FAILED',
                            transactionId: result.transactionId
                        }
                    });
                } else {
                    toast.error(result.message || 'Payment failed');
                    setIsProcessingPayment(false);
                }
            } catch (error) {
                console.error("Payment Error", error);
                toast.error("An error occurred during payment");
                setIsProcessingPayment(false);
            }
        }
    };

    const handleInputChange = (field: keyof ShippingAddress, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (cartLoading) {
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
                            Add items to proceed with checkout.
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
        <div className="min-h-screen bg-background pb-8">
            <Header />

            <main className="container mx-auto py-4 px-4">
                <div className="grid lg:grid-cols-3 gap-4">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Delivery Address */}
                        <div className="bg-card rounded-sm shadow-card">
                            <div className="p-4 border-b border-border flex items-center gap-3">
                                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-sm flex items-center justify-center text-xs font-medium">
                                    1
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-primary" />
                                    <span className="font-medium text-foreground">DELIVERY ADDRESS</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="John Doe"
                                            className={errors.name ? 'border-destructive' : ''}
                                        />
                                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="9876543210"
                                            className={errors.phone ? 'border-destructive' : ''}
                                        />
                                        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="House No., Building, Street, Area"
                                        className={errors.address ? 'border-destructive' : ''}
                                    />
                                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                                </div>

                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            placeholder="Mumbai"
                                            className={errors.city ? 'border-destructive' : ''}
                                        />
                                        {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state">State *</Label>
                                        <Input
                                            id="state"
                                            value={formData.state}
                                            onChange={(e) => handleInputChange('state', e.target.value)}
                                            placeholder="Maharashtra"
                                            className={errors.state ? 'border-destructive' : ''}
                                        />
                                        {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pincode">Pincode *</Label>
                                        <Input
                                            id="pincode"
                                            value={formData.pincode}
                                            onChange={(e) => handleInputChange('pincode', e.target.value)}
                                            placeholder="400001"
                                            className={errors.pincode ? 'border-destructive' : ''}
                                        />
                                        {errors.pincode && <p className="text-xs text-destructive">{errors.pincode}</p>}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-card rounded-sm shadow-card">
                            <div className="p-4 border-b border-border flex items-center gap-3">
                                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-sm flex items-center justify-center text-xs font-medium">
                                    2
                                </div>
                                <div className="flex items-center gap-2">
                                    <Package size={18} className="text-primary" />
                                    <span className="font-medium text-foreground">ORDER SUMMARY</span>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-white rounded-sm overflow-hidden shrink-0">
                                            <img
                                                src={item.product?.images?.[0] || '/placeholder.svg'}
                                                alt={item.product?.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm text-foreground truncate">{item.product?.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                                            <p className="text-sm font-medium text-foreground mt-1">
                                                {formatPrice(Number(item.product?.price) * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="bg-card rounded-sm shadow-card">
                            <div className="p-4 border-b border-border flex items-center gap-3">
                                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-sm flex items-center justify-center text-xs font-medium">
                                    3
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard size={18} className="text-primary" />
                                    <span className="font-medium text-foreground">PAYMENT</span>
                                </div>
                            </div>

                            <div className="p-4">
                                <PaymentOptions
                                    amount={total}
                                    onPaymentStateChange={setPaymentState}
                                />

                                <Button
                                    onClick={handleSubmit}
                                    disabled={createOrderMutation.isPending || isProcessingPayment}
                                    className="w-full flipkart-btn-buy h-12 mt-4 gap-2"
                                >
                                    {createOrderMutation.isPending || isProcessingPayment ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            {isProcessingPayment ? "PROCESSING PAYMENT..." : "PLACING ORDER..."}
                                        </>
                                    ) : (
                                        <>CONFIRM ORDER • {formatPrice(total)}</>
                                    )}
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
                                    <span className="text-foreground">{formatPrice(subtotal)}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground">Delivery Charges</span>
                                    {deliveryCharge === 0 ? (
                                        <span className="text-success">FREE</span>
                                    ) : (
                                        <span className="text-foreground">{formatPrice(deliveryCharge)}</span>
                                    )}
                                </div>

                                <div className="border-t border-dashed border-border pt-4 flex justify-between font-medium text-lg">
                                    <span className="text-foreground">Total Amount</span>
                                    <span className="text-foreground">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
