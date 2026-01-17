
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Wallet, Banknote } from "lucide-react";
import type { PaymentMethod, PaymentState, CardDetails } from "@/lib/payment";

interface PaymentOptionsProps {
    amount?: number;
    onPaymentStateChange: (state: PaymentState) => void;
}

export function PaymentOptions({ onPaymentStateChange }: PaymentOptionsProps) {
    const [method, setMethod] = useState<PaymentMethod>('COD');
    const [cardDetails, setCardDetails] = useState<CardDetails>({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        holderName: ''
    });
    const [upiId, setUpiId] = useState('');

    const handleMethodChange = (newMethod: PaymentMethod) => {
        setMethod(newMethod);
        updateParent(newMethod, cardDetails, upiId);
    };

    const handleCardChange = (field: keyof CardDetails, value: string) => {
        const updated = { ...cardDetails, [field]: value };
        setCardDetails(updated);
        updateParent(method, updated, upiId);
    };

    const handleUpiChange = (value: string) => {
        setUpiId(value);
        updateParent(method, cardDetails, value);
    };

    const updateParent = (m: PaymentMethod, c: CardDetails, u: string) => {
        onPaymentStateChange({
            method: m,
            cardDetails: m === 'CARD' ? c : undefined,
            upiId: m === 'UPI' ? u : undefined
        });
    };

    return (
        <div className="space-y-6">
            <RadioGroup defaultValue="COD" value={method} onValueChange={(v) => handleMethodChange(v as PaymentMethod)}>

                {/* UPI Option */}
                <div className="border rounded-md p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="UPI" id="upi" />
                        <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer font-medium">
                            <Wallet size={20} className="text-primary" />
                            UPI (PhonePe, Google Pay, BHIM)
                        </Label>
                    </div>

                    {method === 'UPI' && (
                        <div className="pl-6 pt-2 animate-in slide-in-from-top-2 duration-200">
                            <Input
                                placeholder="Enter UPI ID (e.g. mobile@upi)"
                                value={upiId}
                                onChange={(e) => handleUpiChange(e.target.value)}
                                className="max-w-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Secure payment via your UPI app
                            </p>
                        </div>
                    )}
                </div>

                {/* Card Option */}
                <div className="border rounded-md p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CARD" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer font-medium">
                            <CreditCard size={20} className="text-primary" />
                            Credit / Debit / ATM Card
                        </Label>
                    </div>

                    {method === 'CARD' && (
                        <div className="pl-6 pt-2 grid gap-4 max-w-sm animate-in slide-in-from-top-2 duration-200">
                            <Input
                                placeholder="Card Number"
                                value={cardDetails.cardNumber}
                                onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                                maxLength={16}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="MM/YY"
                                    value={cardDetails.expiryDate}
                                    onChange={(e) => handleCardChange('expiryDate', e.target.value)}
                                    maxLength={5}
                                />
                                <Input
                                    placeholder="CVV"
                                    type="password"
                                    value={cardDetails.cvv}
                                    onChange={(e) => handleCardChange('cvv', e.target.value)}
                                    maxLength={3}
                                />
                            </div>
                            <Input
                                placeholder="Card Holder Name"
                                value={cardDetails.holderName}
                                onChange={(e) => handleCardChange('holderName', e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* COD Option */}
                <div className="border rounded-md p-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="COD" id="cod" />
                        <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer font-medium">
                            <Banknote size={20} className="text-primary" />
                            Cash on Delivery
                        </Label>
                    </div>
                    {method === 'COD' && (
                        <p className="text-xs text-muted-foreground mt-2 pl-6">
                            Pay cash at the time of delivery.
                        </p>
                    )}
                </div>

            </RadioGroup>
        </div>
    );
}
