import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { ProductCard } from "@/components/ProductCard";

export default function Wishlist() {
    const { items, clearWishlist } = useWishlist();

    return (
        <div className="min-h-screen bg-background pb-8">
            <Header />

            <main className="container mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-medium flex items-center gap-2">
                        My Wishlist <span className="text-muted-foreground text-base font-normal">({items.length})</span>
                    </h1>
                    {items.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearWishlist}>
                            Clear All
                        </Button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="bg-card rounded-sm shadow-card p-12 text-center max-w-md mx-auto mt-12">
                        <Heart size={80} className="mx-auto text-muted-foreground mb-6" />
                        <h2 className="text-xl font-medium text-foreground mb-2">Empty Wishlist</h2>
                        <p className="text-muted-foreground mb-6">
                            You have no items in your wishlist. Start adding!
                        </p>
                        <Link to="/">
                            <Button className="flipkart-btn-primary">Shop Now</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
                        {items.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                originalPrice={product.originalPrice}
                                discountPercent={product.discountPercent}
                                image={product.image}
                                rating={product.rating}
                                reviewsCount={product.reviewsCount}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
