"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onConfirm: (method: string, details?: any) => void;
}

export function PaymentModal({ isOpen, onClose, totalAmount, onConfirm }: PaymentModalProps) {
    const [tenderAmount, setTenderAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [isSplit, setIsSplit] = useState(false);

    // Derived state
    const tender = Number(tenderAmount) || 0;
    // const balance = tender > totalAmount ? tender - totalAmount : 0; 

    useEffect(() => {
        if (isOpen) {
            setTenderAmount(totalAmount.toFixed(2));
            setPaymentMethod("Cash");
            setIsSplit(false);
        }
    }, [isOpen, totalAmount]);

    const handleConfirm = () => {
        onConfirm(paymentMethod, { tender: tender, split: isSplit });
        onClose();
    };

    // Icons mapping would ideally use dynamic icons but for now we map manually or use generic
    // The image shows icons for Amex, Visa, etc.
    // We will use Lucide icons as placeholders for specific brand icons.

    const paymentModes = [
        { id: "Amex", label: "Amex", color: "bg-accent text-blue-600 border-accent", image: "/amex.png" },
        { id: "Visa", label: "Visa", color: "bg-accent text-blue-700 border-accent", image: "/visa.png" },
        { id: "MasterCard", label: "MasterCard", color: "bg-accent text-red-600 border-accent", image: "/mastercard.png" },
        { id: "Maestro", label: "Maestro", color: "bg-accent text-blue-500 border-accent", image: "/maestro.png" },
        { id: "UPI", label: "EWallet", color: "bg-muted text-foreground border-border", image: "/upi.png" },
        { id: "Cash", label: "Cash", color: "bg-accent text-green-600 border-accent", image: "/cash.png" },
        { id: "Finance", label: "Finance", color: "bg-accent text-teal-600 border-accent", image: "/finance.png" },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Payment" className="max-w-5xl h-[600px] p-0 overflow-hidden flex flex-col bg-card border border-border animate-slide-up">
            <div className="flex flex-1 h-full overflow-hidden">
                {/* Left Sidebar: Payment Methods */}
                <div className="w-[320px] border-r border-border p-4 flex flex-col gap-6 bg-card overflow-y-auto">

                    {/* Header + Toggle */}
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">PAYMENT METHOD</div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className={cn("w-10 h-5 border transition-colors cursor-pointer relative rounded-full", isSplit ? 'bg-primary border-primary' : 'bg-muted border-input')}
                                    onClick={() => setIsSplit(!isSplit)}
                                >
                                    <div
                                        className={cn("absolute top-0.5 w-4 h-4 bg-background shadow-sm transition-all rounded-full", isSplit ? 'left-[calc(100%-1.15rem)]' : 'left-0.5')}
                                    ></div>
                                </div>
                                <span className="text-sm font-semibold text-foreground select-none cursor-pointer" onClick={() => setIsSplit(!isSplit)}>Split Payment</span>
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-muted text-muted-foreground hover:bg-muted/80">
                                {/* Reset Icon placeholder */}
                                <Check className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-border my-1"></div>

                    {/* Payment Mode Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {paymentModes.map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => setPaymentMethod(mode.id)}
                                className={cn(
                                    "h-20 flex flex-col items-center justify-center gap-2 border rounded-xl shadow-sm transition-all p-1 overflow-hidden relative hover-lift",
                                    paymentMethod === mode.id ? 'ring-2 ring-offset-1 ring-primary border-primary' : 'hover:bg-accent border-border',
                                    mode.color
                                )}
                            >
                                {/* Fallback Text (always rendered, hidden if image loads successfully covering it?) 
                                    Actually, cleaner to use conditional state, but for stateless list:
                                    Render text. Image absolute on top.
                                */}
                                <span className="text-[10px] font-bold text-foreground z-0">{mode.label}</span>

                                <div className="absolute inset-0 flex items-center justify-center z-10 w-full h-full p-2">
                                    <img
                                        src={mode.image}
                                        alt={mode.label}
                                        className="max-w-full max-h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content: Summary & Actions */}
                <div className="flex-1 flex flex-col bg-card relative">
                    {/* Header Summary Badges */}
                    <div className="flex items-center justify-around p-8 border-b border-border">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-foreground">Total:</span>
                            <div className="bg-primary text-primary-foreground text-xl font-bold px-4 py-1 rounded-xl shadow-sm">
                                ₹{totalAmount.toFixed(2)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-foreground">Tender:</span>
                            <div className="bg-muted/50 border border-input text-xl font-bold px-4 py-1 rounded-xl shadow-sm flex items-center">
                                <span className="text-foreground">₹</span>
                                <input
                                    className={cn(
                                        "flex h-10 w-full rounded-lg bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                                        "border-none outline-none text-foreground w-24 font-bold placeholder-muted-foreground"
                                    )}
                                    value={tenderAmount}
                                    onChange={(e) => setTenderAmount(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Empty Body Area (or Split Details List in future) */}
                    <div className="flex-1 bg-card">
                        {/* Placeholder for split details */}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-border flex justify-between items-center bg-card absolute bottom-0 left-0 right-0 w-full">
                        <Button
                            variant="secondary"
                            className="bg-muted hover:bg-muted/80 text-foreground px-6 h-10 font-bold rounded-xl flex items-center gap-2 shadow-sm uppercase tracking-wide border border-border"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="hidden md:flex bg-accent hover:bg-accent/80 text-primary border-primary/20 px-4 h-10 font-bold rounded-xl uppercase tracking-wide"
                                onClick={onClose}
                            >
                                Close
                            </Button>
                            <Button
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-10 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] uppercase tracking-wide"
                                onClick={handleConfirm}
                            >
                                Pay Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
