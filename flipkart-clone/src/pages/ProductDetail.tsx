import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { ImageCarousel } from "@/components/ImageCarousel";
import { getProduct, addToCart } from "@/lib/supabase";
import { ShoppingCart, Zap, Star, Check, Truck, Shield, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(id!),
        enabled: !!id,
    });

    const addToCartMutation = useMutation({
        mutationFn: (productId: string) => addToCart(productId, 1),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Added to cart!');
        },
        onError: () => {
            toast.error('Failed to add to cart');
        },
    });

    const [isCartLoading, setIsCartLoading] = useState(false);
    const [isBuyLoading, setIsBuyLoading] = useState(false);

    const handleAddToCart = () => {
        if (product) {
            setIsCartLoading(true);
            addToCartMutation.mutate(product.id, {
                onSettled: () => setIsCartLoading(false)
            });
        }
    };

    const handleBuyNow = () => {
        if (product) {
            setIsBuyLoading(true);
            addToCartMutation.mutate(product.id, {
                onSuccess: () => {
                    navigate('/cart');
                },
                onSettled: () => setIsBuyLoading(false)
            });
        }
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
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

    if (error || !product) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto py-20 text-center">
                    <h1 className="text-2xl font-medium text-foreground mb-4">Product not found</h1>
                    <Button onClick={() => navigate('/')}>Back to Home</Button>
                </div>
            </div>
        );
    }

    const specifications = product.specifications as Record<string, string> || {};
    const highlights = product.highlights as string[] || [];

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto py-4 px-4">
                <div className="bg-card rounded-sm shadow-card">
                    <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 p-4 lg:p-6">
                        {/* Left Column - Images */}
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <ImageCarousel images={product.images} productName={product.name} />

                            {/* Action Buttons - Desktop */}
                            <div className="hidden lg:flex gap-4 mt-6">
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={isCartLoading || product.stock === 0}
                                    className={cn(
                                        "flex-1 flipkart-btn-cart h-14 text-base gap-2",
                                        isBuyLoading && "pointer-events-none"
                                    )}
                                >
                                    {isCartLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <ShoppingCart size={20} />
                                    )}
                                    {isCartLoading ? 'ADDING...' : 'ADD TO CART'}
                                </Button>
                                <Button
                                    onClick={handleBuyNow}
                                    disabled={isBuyLoading || product.stock === 0}
                                    className={cn(
                                        "flex-1 flipkart-btn-buy h-14 text-base gap-2",
                                        isCartLoading && "pointer-events-none"
                                    )}
                                >
                                    {isBuyLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Zap size={20} />
                                    )}
                                    {isBuyLoading ? 'WAIT...' : 'BUY NOW'}
                                </Button>
                            </div>
                        </div>

                        {/* Right Column - Product Info */}
                        <div className="space-y-6">
                            {/* Breadcrumb */}
                            <nav className="text-sm text-muted-foreground">
                                <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</span>
                                {product.category && (
                                    <>
                                        <span className="mx-2">›</span>
                                        <span
                                            className="hover:text-primary cursor-pointer"
                                            onClick={() => navigate(`/?category=${product.category.slug}`)}
                                        >
                                            {product.category.name}
                                        </span>
                                    </>
                                )}
                                <span className="mx-2">›</span>
                                <span className="text-foreground">{product.name.substring(0, 30)}...</span>
                            </nav>

                            {/* Product Title */}
                            <h1 className="text-lg lg:text-xl font-medium text-foreground leading-relaxed">
                                {product.name}
                            </h1>

                            {/* Rating */}
                            {product.rating && Number(product.rating) > 0 && (
                                <div className="flex items-center gap-3">
                                    <span className="flipkart-rating text-sm px-2 py-1">
                                        {product.rating} <Star size={12} fill="currentColor" />
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                        {product.reviews_count?.toLocaleString()} Ratings & Reviews
                                    </span>
                                </div>
                            )}

                            {/* Special Offer */}
                            {product.discount_percent && product.discount_percent > 0 && (
                                <p className="text-offer font-medium text-sm">Special Price</p>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <span className="text-2xl lg:text-3xl font-medium text-foreground">
                                    {formatPrice(Number(product.price))}
                                </span>
                                {product.original_price && Number(product.original_price) > Number(product.price) && (
                                    <>
                                        <span className="text-muted-foreground line-through text-lg">
                                            {formatPrice(Number(product.original_price))}
                                        </span>
                                        <span className="text-offer font-medium">
                                            {product.discount_percent}% off
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Stock Status */}
                            {product.stock > 0 ? (
                                <div className="flex items-center gap-2 text-success">
                                    <Check size={18} />
                                    <span className="font-medium">In Stock</span>
                                    {product.stock < 10 && (
                                        <span className="text-warning text-sm">(Only {product.stock} left)</span>
                                    )}
                                </div>
                            ) : (
                                <p className="text-destructive font-medium">Out of Stock</p>
                            )}

                            {/* Delivery Info */}
                            <div className="flex flex-wrap gap-6 py-4 border-y border-border">
                                <div className="flex items-center gap-2 text-sm">
                                    <Truck size={20} className="text-primary" />
                                    <span>{Number(product.price) > 500 ? 'Free Delivery' : '₹40 Delivery'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <RotateCcw size={20} className="text-primary" />
                                    <span>7 Days Return</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Shield size={20} className="text-primary" />
                                    <span>1 Year Warranty</span>
                                </div>
                            </div>

                            {/* Highlights */}
                            {highlights.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-foreground mb-3">Highlights</h3>
                                    <ul className="space-y-2">
                                        {highlights.map((highlight, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <span className="text-foreground mt-1">•</span>
                                                {highlight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Description */}
                            {product.description && (
                                <div>
                                    <h3 className="font-medium text-foreground mb-3">Description</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {/* Specifications */}
                            {Object.keys(specifications).length > 0 && (
                                <div>
                                    <h3 className="font-medium text-foreground mb-3">Specifications</h3>
                                    <div className="bg-muted/50 rounded-sm divide-y divide-border">
                                        {Object.entries(specifications).map(([key, value]) => (
                                            <div key={key} className="flex py-3 px-4">
                                                <span className="w-1/3 text-sm text-muted-foreground">{key}</span>
                                                <span className="flex-1 text-sm text-foreground">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Action Buttons */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 flex gap-3 z-40">
                <Button
                    onClick={handleAddToCart}
                    disabled={isCartLoading || product.stock === 0}
                    className={cn(
                        "flex-1 flipkart-btn-cart h-12 gap-2",
                        isBuyLoading && "pointer-events-none"
                    )}
                >
                    {isCartLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <ShoppingCart size={18} />
                    )}
                    {isCartLoading ? 'ADDING...' : 'ADD TO CART'}
                </Button>
                <Button
                    onClick={handleBuyNow}
                    disabled={isBuyLoading || product.stock === 0}
                    className={cn(
                        "flex-1 flipkart-btn-buy h-12 gap-2",
                        isCartLoading && "pointer-events-none"
                    )}
                >
                    {isBuyLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Zap size={18} />
                    )}
                    {isBuyLoading ? 'WAIT...' : 'BUY NOW'}
                </Button>
            </div>
        </div>
    );
}
