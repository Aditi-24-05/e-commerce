import { createClient } from "@supabase/supabase-js";
import Fuse from "fuse.js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Product {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    discount_percent?: number;
    images: string[];
    rating?: number;
    reviews_count?: number;
    category?: any;
    category_id?: string;
    description?: string;
    stock?: number;
    highlights?: string[];
    specifications?: Record<string, string>;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
}

export interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    product?: Product;
}

// Category synonyms and related terms
const categorySynonyms: Record<string, string[]> = {
    'mobiles': ['phone', 'smartphone', 'mobile', 'cell', 'iphone', 'android', 'samsung', 'oneplus', 'xiaomi', 'realme', 'oppo', 'vivo'],
    'electronics': ['gadget', 'device', 'electronic', 'tech', 'technology'],
    'fashion': ['clothing', 'clothes', 'wear', 'apparel', 'dress', 'shirt', 'pant', 'jeans', 'tshirt', 't-shirt'],
    'home': ['furniture', 'decor', 'decoration', 'household', 'kitchen', 'bedroom', 'living'],
    'appliances': ['appliance', 'washing', 'fridge', 'refrigerator', 'ac', 'microwave', 'oven'],
    'books': ['book', 'novel', 'textbook', 'reading', 'literature'],
    'toys': ['toy', 'game', 'kids', 'children', 'play'],
    'sports': ['sport', 'fitness', 'gym', 'exercise', 'athletic'],
    'beauty': ['cosmetic', 'makeup', 'skincare', 'beauty', 'grooming'],
    'groceries': ['grocery', 'food', 'snack', 'beverage', 'drink']
};

// Function to find matching categories based on search query
function getMatchingCategories(query: string, categories: Category[]): string[] {
    const lowerQuery = query.toLowerCase().trim();
    const matchingCategoryIds: string[] = [];

    categories.forEach(category => {
        const categorySlug = category.slug.toLowerCase();
        const categoryName = category.name.toLowerCase();
        
        // Direct match with category name or slug
        if (categoryName.includes(lowerQuery) || lowerQuery.includes(categoryName) ||
            categorySlug.includes(lowerQuery) || lowerQuery.includes(categorySlug)) {
            matchingCategoryIds.push(category.id);
            return;
        }

        // Check synonyms
        const synonyms = categorySynonyms[categorySlug] || [];
        const matches = synonyms.some(synonym => 
            lowerQuery.includes(synonym) || synonym.includes(lowerQuery)
        );
        
        if (matches) {
            matchingCategoryIds.push(category.id);
        }
    });

    return matchingCategoryIds;
}

// Local storage fallback for cart
const CART_STORAGE_KEY = 'flipkart_cart';

function getCartFromStorage(): CartItem[] {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCartToStorage(cart: CartItem[]) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Failed to save cart:', error);
    }
}

// API Functions

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data || [];
}

export async function getProducts(categorySlug: string = 'all', searchQuery: string = ''): Promise<Product[]> {
    let query = supabase
        .from('products')
        .select('*, category:categories(*)');

    // First, get all categories for search matching
    const categories = await getCategories();

    // Apply category filter if specified in URL
    if (categorySlug && categorySlug !== 'all') {
        const { data: catData } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
        if (catData) {
            query = query.eq('category_id', catData.id);
        }
    }

    const { data: products, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    let result = (products || []).map(item => ({
        ...item,
        category: item.category
    })) as Product[];

    // Enhanced search with category matching
    if (searchQuery) {
        // Check if search query matches any category
        const matchingCategoryIds = getMatchingCategories(searchQuery, categories);
        
        // If search matches specific categories, show ALL products from those categories
        if (matchingCategoryIds.length > 0) {
            result = result.filter(product => 
                matchingCategoryIds.includes(product.category_id || '')
            );
            // Don't apply fuzzy search, return all products from matched categories
        } else {
            // If no category match, do regular fuzzy search across all products
            const fuseOptions = {
                keys: [
                    { name: 'name', weight: 0.6 },
                    { name: 'category.name', weight: 0.3 },
                    { name: 'description', weight: 0.1 }
                ],
                threshold: 0.4,
                location: 0,
                distance: 100,
                includeScore: true,
                ignoreLocation: false,
                useExtendedSearch: false,
                minMatchCharLength: 2
            };

            const fuse = new Fuse(result, fuseOptions);
            const searchResults = fuse.search(searchQuery);
            result = searchResults.map(res => res.item);
        }
    }

    return result;
}

export async function getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }
    return data;
}

// Cart functions
export async function getCartItems(): Promise<CartItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const cart = getCartFromStorage();

    const cartWithProducts = await Promise.all(cart.map(async (item) => {
        const product = await getProduct(item.product_id);
        return {
            ...item,
            product: product || undefined
        };
    }));

    return cartWithProducts;
}

export async function addToCart(productId: string, quantity: number = 1): Promise<CartItem[]> {
    const cart = getCartFromStorage();
    const existingItem = cart.find(item => item.product_id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: Date.now().toString(),
            product_id: productId,
            quantity,
        });
    }

    saveCartToStorage(cart);
    return getCartItems();
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<CartItem[]> {
    const cart = getCartFromStorage();
    const item = cart.find(i => i.id === itemId);

    if (item) {
        if (quantity <= 0) {
            const filtered = cart.filter(i => i.id !== itemId);
            saveCartToStorage(filtered);
        } else {
            item.quantity = quantity;
            saveCartToStorage(cart);
        }
    }

    return getCartItems();
}

export async function removeFromCart(itemId: string): Promise<CartItem[]> {
    const cart = getCartFromStorage();
    const filtered = cart.filter(i => i.id !== itemId);
    saveCartToStorage(filtered);

    return getCartItems();
}

export async function clearCart(): Promise<void> {
    saveCartToStorage([]);
}

export interface ShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

export interface Order {
    id: string;
    created_at: string;
    order_number: string;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_pincode: string;
    subtotal: number;
    shipping_cost: number;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_method: string;
    payment_status: string;
    transaction_id?: string;
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_image?: string;
    price: number;
    quantity: number;
}

export interface Notification {
    id: string;
    created_at: string;
    user_id?: string;
    email: string;
    type: string;
    order_id?: string;
    content?: any;
    status: 'pending' | 'sent' | 'failed';
}

export async function sendOrderNotification(
    email: string,
    order: Order,
    userId?: string
): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            email,
            type: 'order_confirmation',
            order_id: order.id,
            content: {
                order_number: order.order_number,
                total: order.total,
                items: order.order_items?.map(i => ({
                    name: i.product_name,
                    qty: i.quantity,
                    price: i.price
                }))
            },
            status: 'pending'
        });

    if (error) {
        console.error('Error recording notification:', error);
        throw new Error('Failed to record notification');
    }
}

export async function createOrder(
    shippingAddress: ShippingAddress,
    paymentDetails: { method: string, status: string, transactionId?: string }
): Promise<Order> {
    const cart = getCartItemsFromStorage();

    if (cart.length === 0) throw new Error("Cart is empty");

    const cartItems = await getCartItems();
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.product?.price || 0) * item.quantity), 0);
    const shipping_cost = subtotal > 500 ? 0 : 40;
    const total = subtotal + shipping_cost;

    const orderNumber = 'ORD-' + Date.now();

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            order_number: orderNumber,
            shipping_name: shippingAddress.name,
            shipping_phone: shippingAddress.phone,
            shipping_address: shippingAddress.address,
            shipping_city: shippingAddress.city,
            shipping_state: shippingAddress.state,
            shipping_pincode: shippingAddress.pincode,
            subtotal,
            shipping_cost,
            total,
            status: 'pending',
            payment_method: paymentDetails.method,
            payment_status: paymentDetails.status,
            transaction_id: paymentDetails.transactionId
        })
        .select()
        .single();

    if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('Failed to create order');
    }

    const orderItemsData = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product!.name,
        product_image: item.product!.images?.[0],
        price: item.product!.price,
        quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

    if (itemsError) {
        console.error('Error creating order items:', itemsError);
    }

    clearCart();

    return order;
}

export async function getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return null;
    }
    return data;
}

export async function getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
    return data || [];
}

function getCartItemsFromStorage(): CartItem[] {
    return getCartFromStorage();
}