"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { X, Check, AlertTriangle, CreditCard, Wallet, Banknote, RefreshCcw, Trash2, Globe, Smartphone, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onConfirm: (method: string, details?: any) => void;
}

export function PaymentModal({ isOpen, onClose, totalAmount, onConfirm }: PaymentModalProps) {
    const [payments, setPayments] = useState<{ id: string, method: string, amount: number, details?: any }[]>([]);
    const [isSplit, setIsSplit] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Initialize with full amount in Cash
    useEffect(() => {
        if (isOpen) {
            setPayments([{ id: Date.now().toString(), method: "Cash", amount: totalAmount }]);
            setIsSplit(false);
        }
    }, [isOpen, totalAmount]);

    const totalTender = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const handleAddPayment = (method: string) => {
        if (isSplit) {
            // Add new payment line
            const remaining = Math.max(0, totalAmount - totalTender);
            setPayments([...payments, { id: Date.now().toString(), method, amount: remaining > 0 ? remaining : 0 }]);
        } else {
            // Replace existing
            setPayments([{ id: Date.now().toString(), method, amount: totalAmount }]);
        }
    };

    const handleRemovePayment = (id: string) => {
        setPayments(payments.filter(p => p.id !== id));
    };

    const handleUpdatePayment = (id: string, field: string, value: any) => {
        setPayments(payments.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleConfirm = () => {
        setShowConfirmation(true);
    };

    const handleFinalize = () => {
        // Construct detailed payment info
        const paymentDetails = {
            tender: totalTender,
            modes: payments,
            isSplit
        };
        // Flatten for simple backward compatibility if needed, distinct modes joined
        const mainMethod = isSplit ? "Split" : payments[0]?.method || "Cash";

        onConfirm(mainMethod, paymentDetails);
        setShowConfirmation(false);
        onClose();
    };

    // Icons mapping would ideally use dynamic icons but for now we map manually or use generic
    // The image shows icons for Amex, Visa, etc.
    // We will use Lucide icons as placeholders for specific brand icons.

    const paymentModes = [
        { id: "Amex", label: "Amex", color: "bg-pink-100 text-blue-600 border-pink-200", image: "/amex.png", icon: <CreditCard className="w-8 h-8" /> },
        { id: "Visa", label: "Visa", color: "bg-pink-100 text-blue-700 border-pink-200", image: "/visa.png", icon: <CreditCard className="w-8 h-8" /> },
        { id: "MasterCard", label: "MasterCard", color: "bg-pink-100 text-red-600 border-pink-200", image: "/mastercard.png", icon: <CreditCard className="w-8 h-8" /> },
        { id: "Maestro", label: "Maestro", color: "bg-pink-100 text-blue-500 border-pink-200", image: "/maestro.png", icon: <CreditCard className="w-8 h-8" /> },
        { id: "UPI", label: "EWallet", color: "bg-pink-100 text-foreground border-pink-200", image: "/upi.png", icon: <Smartphone className="w-8 h-8" /> },
        { id: "Cash", label: "Cash", color: "bg-pink-100 text-green-600 border-pink-200", image: null, icon: <Banknote className="w-8 h-8" /> },
        { id: "Finance", label: "Finance", color: "bg-pink-100 text-teal-600 border-pink-200", image: "/finance.png", icon: <Landmark className="w-8 h-8" /> },
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
                                    className={cn("w-10 h-5 border transition-colors cursor-pointer relative rounded-full", isSplit ? 'bg-indigo-500 border-indigo-500' : 'bg-muted border-input')}
                                    onClick={() => {
                                        setIsSplit(!isSplit);
                                        // Reset to single cash payment when toggling off
                                        if (isSplit) {
                                            setPayments([{ id: Date.now().toString(), method: "Cash", amount: totalAmount }]);
                                        }
                                    }}
                                >
                                    <div
                                        className={cn("absolute top-0.5 w-4 h-4 bg-white shadow-sm transition-all rounded-full", isSplit ? 'left-[calc(100%-1.15rem)]' : 'left-0.5')}
                                    ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 select-none cursor-pointer" onClick={() => setIsSplit(!isSplit)}>Split Payment</span>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
                                onClick={() => {
                                    setPayments([{ id: Date.now().toString(), method: "Cash", amount: totalAmount }]);
                                    setIsSplit(false);
                                }}
                            >
                                <RefreshCcw className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-border my-1"></div>

                    {/* Payment Mode Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {paymentModes.map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => handleAddPayment(mode.id)}
                                className={cn(
                                    "h-20 flex flex-col items-center justify-center gap-1 border rounded-xl shadow-sm transition-all p-2 overflow-hidden relative hover:scale-[1.02] active:scale-95 group",
                                    "hover:shadow-md bg-white",
                                    mode.color
                                )}
                            >
                                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                                    {/* Icon Container (Always visible as fallback or primary) */}
                                    <div className={cn("mb-1 transition-opacity duration-200", mode.image ? "opacity-0 group-hover:opacity-10 absolute" : "opacity-100")}>
                                        {mode.icon}
                                    </div>

                                    {/* Image Container (If exists) */}
                                    {mode.image && (
                                        <div className="relative w-full h-8 mb-1 flex items-center justify-center">
                                            <img
                                                src={mode.image}
                                                alt={mode.label}
                                                className="max-w-full max-h-full object-contain drop-shadow-sm"
                                                onError={(e) => {
                                                    // Hide image on error and show fallback icon by removing opacity class from parent sibling? 
                                                    // Easier: Hide this image element
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    // Find the fallback icon sibling and make it visible?
                                                    // React state is better, but for now let's just use CSS tricks or simpler logic.
                                                    // Simpler: Just rely on the text label if image fails? No, let's keep the icon visible underneath.
                                                }}
                                            />
                                            {/* Fallback icon visible behind transparent image or if image fails/is missing */}
                                            <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-20">
                                                {mode.icon}
                                            </div>
                                        </div>
                                    )}

                                    {/* Text Label */}
                                    <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tight">{mode.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content: Summary & Actions */}
                <div className="flex-1 flex flex-col bg-card relative">
                    {/* Header Summary Badges */}
                    <div className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-10">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-800 w-20">Tender:</span>
                                <div className="bg-[#06b6d4] text-white text-2xl font-bold px-4 py-2 rounded-lg shadow-sm min-w-[160px] text-center">
                                    ₹{totalTender.toFixed(2)}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-800 w-20">Total:</span>
                                <div className="bg-[#6366f1] text-white text-2xl font-bold px-4 py-2 rounded-lg shadow-sm min-w-[160px] text-center">
                                    ₹{totalAmount.toFixed(2)}
                                </div>
                            </div>
                        </div>
                        {totalTender > totalAmount && (
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-800 w-24">Balance:</span>
                                <div className="bg-[#10b981] text-white text-2xl font-bold px-4 py-2 rounded-lg shadow-sm animate-pulse min-w-[160px] text-center">
                                    ₹{(totalTender - totalAmount).toFixed(2)}
                                </div>
                            </div>
                        )}
                        {totalTender < totalAmount && (
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-800 w-24">Pending:</span>
                                <div className="bg-[#ef4444] text-white text-2xl font-bold px-4 py-2 rounded-lg shadow-sm animate-pulse min-w-[160px] text-center">
                                    ₹{(totalAmount - totalTender).toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Cards List */}
                    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto content-start">
                        <div className="flex flex-wrap gap-4 content-start items-start">
                            {payments.map((payment, index) => (
                                <div key={payment.id} className="relative w-full md:w-[48%] bg-white rounded-md p-2 shadow-sm animate-in zoom-in-95 duration-200">
                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemovePayment(payment.id)}
                                        className="absolute -top-2 -left-2 bg-[#f43f5e] text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors z-20"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>

                                    {/* Header Name */}
                                    <div className="text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                        {payment.method}
                                    </div>

                                    <div className="space-y-2">
                                        {/* Card Details (Only for non-Cash) */}
                                        {payment.method !== 'Cash' && (
                                            <>
                                                <div className="relative">
                                                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#06b6d4] flex items-center justify-center rounded-l-md text-white">
                                                        <CreditCard className="w-4 h-4" />
                                                    </div>
                                                    <select
                                                        className="w-full pl-9 pr-2 py-1 border border-gray-300 rounded-r-md text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500 h-8"
                                                        value={payment.method}
                                                        onChange={(e) => handleUpdatePayment(payment.id, 'method', e.target.value)}
                                                    >
                                                        {paymentModes.filter(m => m.id !== 'Cash').map(mode => (
                                                            <option key={mode.id} value={mode.id}>{mode.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="relative flex h-8">
                                                    <div className="w-1/3 bg-[#6366f1] flex items-center px-2 gap-1 rounded-l-md text-white text-[10px]">
                                                        <CreditCard className="w-3 h-3" />
                                                        <span>0000</span>
                                                    </div>
                                                    <input
                                                        className="flex-1 border border-l-0 border-gray-300 rounded-r-md px-2 py-1 text-xs text-right outline-none focus:ring-1 focus:ring-blue-500"
                                                        placeholder="0000"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Total Field (Read-only display) */}
                                        <div className="relative flex shadow-md h-16 mb-3">
                                            <div className="w-32 bg-[#6366f1] flex items-center justify-center rounded-l-lg text-white text-lg font-bold">
                                                TOTAL
                                            </div>
                                            <div className="flex-1 border-2 border-l-0 border-gray-300 rounded-r-lg px-4 text-2xl font-bold text-right text-gray-900 bg-gray-50 flex items-center justify-end">
                                                ₹{totalAmount.toFixed(2)}
                                            </div>
                                        </div>

                                        {/* Tender Field */}
                                        <div className="relative flex shadow-md h-16">
                                            <div className="w-32 bg-gray-800 flex items-center justify-center rounded-l-lg text-white text-lg font-bold">
                                                TENDER
                                            </div>
                                            <div className="flex-1 border-2 border-l-0 border-gray-300 rounded-r-lg bg-white flex items-center justify-end px-4 relative">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    ₹{Number(payment.amount || 0).toFixed(2)}
                                                </span>
                                                <input
                                                    type="number"
                                                    className="absolute inset-0 w-full text-2xl font-bold text-right outline-none text-transparent bg-transparent focus:ring-0 border-0 px-4 cursor-text"
                                                    value={payment.amount}
                                                    onChange={(e) => handleUpdatePayment(payment.id, 'amount', e.target.value)}
                                                    onFocus={(e) => e.target.select()}
                                                    style={{ caretColor: '#111827' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-border flex justify-end items-center bg-card absolute bottom-0 left-0 right-0 w-full">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="hidden md:flex bg-accent hover:bg-accent/80 text-primary border-primary/20 px-4 h-10 font-bold rounded-xl uppercase tracking-wide"
                                onClick={onClose}
                            >
                                Close
                            </Button>
                            <Button
                                className={cn(
                                    "px-8 h-10 font-bold rounded-xl shadow-lg transition-all uppercase tracking-wide",
                                    Math.abs(totalAmount - totalTender) > 0.05
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-xl hover:scale-[1.02]"
                                )}
                                onClick={handleConfirm}
                                disabled={Math.abs(totalAmount - totalTender) > 0.05}
                            >
                                Pay Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                title=""
                className="w-[300px] bg-white rounded-xl p-4 shadow-2xl border border-gray-100"
                overlayClassName="z-[110]" // Ensure it is above the payment modal
            >
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Confirm Payment</h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Generate bill for <span className="font-bold text-gray-800">₹{totalAmount.toFixed(2)}</span>?
                        </p>
                    </div>
                    <div className="flex gap-2 w-full pt-1">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-lg h-8 text-xs border-gray-200 text-gray-600 hover:bg-gray-50"
                            onClick={() => setShowConfirmation(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 rounded-lg h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                            onClick={handleFinalize}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </Modal>
        </Modal >
    );
}
