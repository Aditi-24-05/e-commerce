import * as React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const banners = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop",
        alt: "Flight Sale",
        title: "Big Savings on Flights",
        subtitle: "Up to 20% Off"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1200&auto=format&fit=crop",
        alt: "Fashion Sale",
        title: "Latest Trends",
        subtitle: "Min 50% Off"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1200&auto=format&fit=crop",
        alt: "Electronics",
        title: "Best of Electronics",
        subtitle: "Special Launch"
    }
];

export function BannerCarousel() {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    return (
        <div className="w-full bg-muted/20 py-4">
            <div className="container mx-auto px-2">
                <Carousel
                    setApi={setApi}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full relative group"
                >
                    <CarouselContent>
                        {banners.map((banner) => (
                            <CarouselItem key={banner.id}>
                                <div className="relative w-full h-[200px] sm:h-[280px] rounded-sm overflow-hidden cursor-pointer">
                                    <img
                                        src={banner.image}
                                        alt={banner.alt}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay for text (Optional, usually text is in image for these banners but we'll add some) */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex flex-col justify-center px-8 sm:px-16 text-white">
                                        <h2 className="text-2xl sm:text-4xl font-bold mb-2">{banner.title}</h2>
                                        <p className="text-lg sm:text-xl font-medium">{banner.subtitle}</p>
                                        <button className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-sm font-bold w-fit text-sm hover:scale-105 transition-transform">
                                            Shop Now
                                        </button>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Custom Arrows - Visible on hover, styled like Flipkart's */}
                    <CarouselPrevious className="hidden sm:flex h-24 w-12 rounded-r-md rounded-l-none -left-4 bg-white/90 hover:bg-white border-none shadow-md text-gray-800" />
                    <CarouselNext className="hidden sm:flex h-24 w-12 rounded-l-md rounded-r-none -right-4 bg-white/90 hover:bg-white border-none shadow-md text-gray-800" />

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {Array.from({ length: count }).map((_, index) => (
                            <button
                                key={index}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    current === index ? "bg-white w-4" : "bg-white/50 hover:bg-white/75"
                                )}
                                onClick={() => api?.scrollTo(index)}
                            />
                        ))}
                    </div>
                </Carousel>
            </div>
        </div>
    );
}
