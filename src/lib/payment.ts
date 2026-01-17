
export type PaymentMethod = 'CARD' | 'UPI' | 'COD';

export interface CardDetails {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    holderName: string;
}

export interface PaymentState {
    method: PaymentMethod;
    cardDetails?: CardDetails;
    upiId?: string;
}

export interface PaymentResult {
    success: boolean;
    transactionId: string;
    message?: string;
}

export async function processPayment( state: PaymentState): Promise<PaymentResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (state.method === 'COD') {
        return {
            success: true,
            transactionId: `COD-${Date.now()}`,
            message: 'Order placed successfully with Cash on Delivery'
        };
    }

    if (state.method === 'UPI') {
        if (!state.upiId || !state.upiId.includes('@')) {
            return { success: false, transactionId: '', message: 'Invalid UPI ID' };
        }
        return {
            success: true,
            transactionId: `UPI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            message: 'Payment processed successfully via UPI'
        };
    }

    if (state.method === 'CARD') {
        if (!state.cardDetails || state.cardDetails.cardNumber.length < 12) {
            return { success: false, transactionId: '', message: 'Invalid Card Details' };
        }
        return {
            success: true,
            transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            message: 'Card payment processed successfully'
        };
    }

    return { success: false, transactionId: '', message: 'Unknown payment method' };
}
