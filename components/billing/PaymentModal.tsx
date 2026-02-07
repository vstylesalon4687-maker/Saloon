"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { X, Check } from "lucide-react";

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
        { id: "Amex", label: "Amex", color: "bg-pink-50 text-blue-600 border-pink-100", image: "/amex.png" },
        { id: "Visa", label: "Visa", color: "bg-pink-50 text-blue-700 border-pink-100", image: "/visa.png" },
        { id: "MasterCard", label: "MasterCard", color: "bg-pink-50 text-red-600 border-pink-100", image: "/mastercard.png" },
        { id: "Maestro", label: "Maestro", color: "bg-pink-50 text-blue-500 border-pink-100", image: "/maestro.png" },
        { id: "UPI", label: "EWallet", color: "bg-gray-100 text-gray-800 border-gray-200", image: "/upi.png" },
        { id: "Cash", label: "Cash", color: "bg-pink-50 text-green-600 border-pink-100", image: "/cash.png" },
        { id: "Finance", label: "Finance", color: "bg-pink-50 text-teal-600 border-pink-100", image: "/finance.png" },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Payment" className="max-w-5xl h-[600px] p-0 overflow-hidden flex flex-col">
            <div className="flex flex-1 h-full overflow-hidden">
                {/* Left Sidebar: Payment Methods */}
                <div className="w-[320px] border-r border-gray-200 p-4 flex flex-col gap-6 bg-white overflow-y-auto">

                    {/* Header + Toggle */}
                    <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">PAYMENT METHOD</div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-10 h-5 border transition-colors cursor-pointer relative ${isSplit ? 'bg-gray-700 border-gray-700' : 'bg-gray-200 border-gray-300'}`}
                                    onClick={() => setIsSplit(!isSplit)}
                                >
                                    <div
                                        className={`absolute top-0.5 w-4 h-4 bg-white shadow-sm transition-all rounded-none ${isSplit ? 'left-[calc(100%-1.15rem)]' : 'left-0.5'}`}
                                    ></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-700 select-none cursor-pointer" onClick={() => setIsSplit(!isSplit)}>Split Payment</span>
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-none bg-gray-800 text-white hover:bg-gray-700">
                                {/* Reset Icon placeholder */}
                                <Check className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Payment Mode Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {paymentModes.map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => setPaymentMethod(mode.id)}
                                className={`
                                    h-20 flex flex-col items-center justify-center gap-2 border rounded-none shadow-sm transition-all p-1 overflow-hidden relative
                                    ${paymentMethod === mode.id ? 'ring-2 ring-offset-1 ring-blue-500' : 'hover:bg-gray-50'}
                                    ${mode.color}
                                `}
                            >
                                {/* Fallback Text (always rendered, hidden if image loads successfully covering it?) 
                                    Actually, cleaner to use conditional state, but for stateless list:
                                    Render text. Image absolute on top.
                                */}
                                <span className="text-[10px] font-bold text-gray-700 z-0">{mode.label}</span>

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
                <div className="flex-1 flex flex-col bg-white relative">
                    {/* Header Summary Badges */}
                    <div className="flex items-center justify-around p-8 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-700">Total:</span>
                            <div className="bg-[#6366f1] text-white text-xl font-bold px-4 py-1 rounded-none shadow-sm">
                                ₹{totalAmount.toFixed(2)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-700">Tender:</span>
                            <div className="bg-[#ec4899] text-white text-xl font-bold px-4 py-1 rounded-none shadow-sm flex items-center">
                                <span>₹</span>
                                <input
                                    className="bg-transparent border-none outline-none text-white w-24 font-bold placeholder-white/70"
                                    value={tenderAmount}
                                    onChange={(e) => setTenderAmount(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Empty Body Area (or Split Details List in future) */}
                    <div className="flex-1 bg-white">
                        {/* Placeholder for split details */}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-white absolute bottom-0 left-0 right-0 w-full">
                        <Button
                            className="bg-[#ff4081] hover:bg-[#f50057] text-white px-6 h-10 font-bold rounded-none flex items-center gap-2 shadow-sm"
                            onClick={onClose}
                        >
                            <div className="w-4 h-4 border-2 border-white/50 rounded-full border-t-white animate-spin hidden"></div> {/* Spinner placeholder */}
                            <X className="w-4 h-4" /> Cancel
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                className="bg-red-500 hover:bg-red-600 text-white px-4 h-10 font-bold rounded-none"
                                onClick={onClose}
                            >
                                Close <X className="w-3 h-3 ml-1" />
                            </Button>
                            <Button
                                className="bg-[#00bcd4] hover:bg-[#00acc1] text-white px-6 h-10 font-bold rounded-none shadow-sm"
                                onClick={handleConfirm}
                            >
                                Generate Bill
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
