
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
    category?: any; // Can be string or object depending on join
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

// Local storage fallback for cart since we don't have auth enforced yet
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

    if (searchQuery) {
        const fuseOptions = {
            keys: [
                { name: 'name', weight: 0.7 },
                { name: 'category.name', weight: 0.5 },
                { name: 'description', weight: 0.2 },
                { name: 'highlights', weight: 0.1 }
            ],
            threshold: 0.25, // Stricter
            location: 0,
            distance: 20, // Penalize matches far from the start of the string
            includeScore: true,
            ignoreLocation: false,
            useExtendedSearch: true,
            minMatchCharLength: 3
        };

        const fuse = new Fuse(result, fuseOptions);
        const searchResults = fuse.search(searchQuery);
        result = searchResults.map(res => res.item);
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

// Cart functions remain local for now as discussed in plan
export async function getCartItems(): Promise<CartItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate async

    const cart = getCartFromStorage();

    // Attach product details from DB for each cart item
    // This is N+1 but okay for logic simplicity right now, or we can use `in` query
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
    const cart = getCartItemsFromStorage(); // Helper to access storage directly

    if (cart.length === 0) throw new Error("Cart is empty");

    // Calculate totals
    const cartItems = await getCartItems(); // Get full items with product details
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.product?.price || 0) * item.quantity), 0);
    const shipping_cost = subtotal > 500 ? 0 : 40;
    const total = subtotal + shipping_cost;

    // Create Order object directly in logic if we don't have DB tables, 
    // BUT user wants Supabase. So we insert into 'orders' table.

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

    // Create Order Items
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
        // Should ideally rollback order here but for simple clone we skip
    }

    // Clear cart
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

// Helper to get raw storage items needed for createOrder before async expansion
function getCartItemsFromStorage(): CartItem[] {
    return getCartFromStorage();
}

