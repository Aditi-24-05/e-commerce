import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number | null;
    discountPercent?: number;
    image: string;
    rating?: number | null;
    reviewsCount?: number;
}

interface WishlistContextType {
    items: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<Product[]>([]);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('flipkart_wishlist');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse wishlist', e);
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('flipkart_wishlist', JSON.stringify(items));
    }, [items]);

    const addToWishlist = (product: Product) => {
        setItems(prev => {
            if (prev.some(item => item.id === product.id)) return prev;
            toast.success(`${product.name} added to Wishlist`);
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId: string) => {
        setItems(prev => prev.filter(item => item.id !== productId));
        toast.info('Removed from Wishlist');
    };

    const isInWishlist = (productId: string) => {
        return items.some(item => item.id === productId);
    };

    const clearWishlist = () => setItems([]);

    return (
        <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
