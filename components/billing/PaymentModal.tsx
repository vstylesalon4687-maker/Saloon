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
    const balance = tender > totalAmount ? tender - totalAmount : 0; // Or standard change logic? Assuming simple payment for now.

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

    const paymentModes = [
        { id: "Amex", label: "Amex", color: "bg-blue-100 text-blue-800" },
        { id: "Visa", label: "Visa", color: "bg-blue-100 text-blue-800" },
        { id: "MasterCard", label: "MasterCard", color: "bg-blue-100 text-blue-800" },
        { id: "Maestro", label: "Maestro", color: "bg-blue-100 text-blue-800" },
        { id: "UPI", label: "UPI", color: "bg-purple-100 text-purple-800" },
        { id: "Cash", label: "Cash", color: "bg-green-100 text-green-800" },
        { id: "Cheque", label: "Cheque", color: "bg-yellow-100 text-yellow-800" },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Payment" className="max-w-4xl">
            <div className="flex h-[450px]">
                {/* Left Side: Inputs & Modes */}
                <div className="flex-1 p-6 border-r border-gray-200 flex flex-col gap-6">
                    {/* Split Toggle */}
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-700">Split Payment</span>
                        <div
                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isSplit ? 'bg-blue-500' : 'bg-gray-300'}`}
                            onClick={() => setIsSplit(!isSplit)}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${isSplit ? 'left-6' : 'left-0.5'}`}></div>
                        </div>
                    </div>

                    {/* Tender Input */}
                    <div className="flex items-center gap-4">
                        <label className="w-24 font-bold text-gray-700">Tender:</label>
                        <Input
                            value={tenderAmount}
                            onChange={(e) => setTenderAmount(e.target.value)}
                            className="bg-yellow-50 border-yellow-400 focus:ring-yellow-400 text-lg font-bold w-full"
                        />
                    </div>

                    {/* Payment Modes Grid */}
                    <div className="flex-1">
                        <label className="font-bold text-gray-700 mb-2 block">Payment Mode</label>
                        <div className="grid grid-cols-4 gap-3">
                            {paymentModes.map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setPaymentMethod(mode.id)}
                                    className={`
                                        h-16 rounded-lg font-bold text-sm shadow-sm flex items-center justify-center transition-all border-2
                                        ${paymentMethod === mode.id ? 'border-pink-500 ring-2 ring-pink-200' : 'border-transparent hover:bg-gray-50'}
                                        ${mode.color} // Using basic colors for now, can be images if assets available
                                    `}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Summary */}
                <div className="w-[300px] bg-gray-50 p-6 flex flex-col gap-6">
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-600 font-medium">Total</span>
                        <span className="bg-[#6366f1] text-white px-3 py-1 rounded font-bold">₹{totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-600 font-medium">Tender</span>
                        <span className="font-bold text-gray-800">₹{tender.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-lg pt-4 border-t border-gray-200">
                        <span className="text-gray-600 font-bold">Balance</span>
                        <span className="font-bold text-green-600 text-xl">₹{balance.toFixed(2)}</span>
                    </div>

                    <div className="mt-auto flex gap-3">
                        <Button
                            variant="destructive"
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white h-10 font-bold"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-[#00bcd4] hover:bg-[#00acc1] text-white h-10 font-bold"
                            onClick={handleConfirm}
                        >
                            <Check className="w-4 h-4 mr-2" /> Save
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
