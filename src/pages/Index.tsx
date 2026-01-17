import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { CategoryBar } from "@/components/CategoryBar";
import { BannerCarousel } from "@/components/BannerCarousel";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const Index = () => {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products', category, searchQuery],
        queryFn: () => getProducts(category, searchQuery),
    });

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Header />
            <CategoryBar />

            {/* Show Banner only on Home (no search/category filter) */}
            {!searchQuery && category === 'all' && <BannerCarousel />}


            <main className="container mx-auto py-4 px-4">
                {/* Page Title */}
                <div className="mb-6">
                    {searchQuery ? (
                        <h1 className="flipkart-section-title">
                            Search results for "{searchQuery}"
                        </h1>
                    ) : category !== 'all' ? (
                        <h1 className="flipkart-section-title capitalize">
                            {category.replace('-', ' ')}
                        </h1>
                    ) : (
                        <h1 className="flipkart-section-title">
                            Products For You
                        </h1>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-destructive/10 text-destructive rounded-sm p-4 text-center">
                        Something went wrong. Please try again.
                    </div>
                )}

                {/* Products Grid */}
                {products && products.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={Number(product.price)}
                                originalPrice={product.original_price ? Number(product.original_price) : null}
                                discountPercent={product.discount_percent}
                                image={product.images[0] || '/placeholder.svg'}
                                rating={product.rating ? Number(product.rating) : null}
                                reviewsCount={product.reviews_count}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {products && products.length === 0 && !isLoading && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg mb-2">
                            No products found
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-foreground text-primary-foreground mt-8">
                <div className="container mx-auto py-8 px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-medium mb-4 text-muted">ABOUT</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:underline">Contact Us</a></li>
                                <li><a href="#" className="hover:underline">About Us</a></li>
                                <li><a href="#" className="hover:underline">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-4 text-muted">HELP</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:underline">Payments</a></li>
                                <li><a href="#" className="hover:underline">Shipping</a></li>
                                <li><a href="#" className="hover:underline">Cancellation</a></li>
                                <li><a href="#" className="hover:underline">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-4 text-muted">POLICY</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:underline">Return Policy</a></li>
                                <li><a href="#" className="hover:underline">Terms Of Use</a></li>
                                <li><a href="#" className="hover:underline">Security</a></li>
                                <li><a href="#" className="hover:underline">Privacy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-4 text-muted">Mail Us:</h4>
                            <p className="text-sm text-muted-foreground">
                                Flipkart Internet Private Limited,<br />
                                Buildings Alyssa, Begonia &<br />
                                Clove Embassy Tech Village,<br />
                                Outer Ring Road, Bengaluru, 560103
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-muted-foreground/20 mt-8 pt-8 text-center text-sm text-muted-foreground">
                        © 2024 Flipkart Clone. Made with ❤️ for learning purposes.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Index;
