import React from "react";
import { X, User, History, Share2, Printer, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface BillDetailViewProps {
    bill: any;
    onClose: () => void;
    onCancel?: (billId: string) => void;
}

export function BillDetailView({ bill, onClose, onCancel }: BillDetailViewProps) {
    if (!bill) return null;


    // Calculate/Derive values
    const invoiceId = bill.invoiceNo ? `${bill.invoiceNo}` : (bill.id ? bill.id.substring(0, 8).toUpperCase() : "---");
    const customerName = bill.customerName || "Walk-in Customer";
    const customerPhone = bill.customerPhone ? bill.customerPhone : "";
    const nameDisplay = customerPhone ? `${customerPhone} - ${customerName}` : customerName;

    // Format Date: "09/02/2026 08:09 PM"
    const dateObj = bill.date ? new Date(bill.date) : new Date();
    // Simple format if date string is standard, otherwise use logic
    // Assuming bill.date is YYYY-MM-DD or ISO. 
    // If it's just YYYY-MM-DD, we might mock time or leave it.
    const dateDisplay = bill.date;

    // Items
    const items = bill.items || [];

    // Payment
    const paymentMethod = bill.paymentMethod || "Cash";
    const totalAmount = Number(bill.grandTotal || 0);

    // Totals Breakdown
    const subTotal = Number(bill.subTotal || 0);
    const totalDiscount = Number(bill.totalDiscount || 0);
    const grandTotal = Number(bill.grandTotal || 0);

    // Mock Customer Stats (Since we might not have them in the bill object)
    // In a real app, we would fetch these based on customer ID/Phone
    const customerStats = {
        visits: 1,
        totalBills: 1,
        avgBill: grandTotal,
        lastVisit: bill.date,
        isMember: false
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-background">
            {/* Tabs Header */}
            <div className="flex bg-gray-100 border-b border-gray-200">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 border-r border-gray-300"
                >
                    Bill Home Page
                </button>
                <div className="px-4 py-2 text-sm font-medium text-white bg-[#0081a7] flex items-center gap-2 rounded-none">
                    {invoiceId}-{customerName.split(' ')[0]}
                    <X className="w-4 h-4 cursor-pointer hover:text-red-200" onClick={onClose} />
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Content */}
                <div className="flex-1 p-4 overflow-y-auto border-r border-gray-200 bg-white">
                    {/* Header Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Name</label>
                            <input
                                type="text"
                                value={nameDisplay}
                                readOnly
                                className="w-full border border-gray-300 rounded-none px-3 py-2 bg-gray-50 text-sm font-medium"
                            />
                        </div>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Date</label>
                                <input
                                    type="text"
                                    value={dateDisplay}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-none px-3 py-2 bg-gray-50 text-sm font-medium"
                                />
                            </div>
                            <div className="bg-pink-100 border border-pink-200 px-3 py-2 rounded-none flex items-center gap-2 h-[38px]">
                                <span className="text-sm font-bold text-gray-700">Invoice ID</span>
                                <span className="bg-[#ec4899] text-white text-xs font-bold px-2 py-0.5 rounded-none">{invoiceId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Services Table */}
                    <div className="mb-6">
                        <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Services</div>
                        <div className="border border-[#1e3a8a] rounded-none overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-[#1e3a8a] text-white">
                                    <tr>
                                        <th className="px-3 py-2 text-left w-1/5">Staff</th>
                                        <th className="px-3 py-2 text-left w-2/5">Particulars</th>
                                        <th className="px-3 py-2 text-center w-12 border-l border-blue-800">Qty</th>
                                        <th className="px-3 py-2 text-right w-20 border-l border-blue-800">Price</th>
                                        <th className="px-3 py-2 text-right w-16 border-l border-blue-800">Disc</th>
                                        <th className="px-3 py-2 text-right w-24 border-l border-blue-800">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-200">
                                            <td className="px-3 py-2 border-r border-gray-200">{item.staff || '-'}</td>
                                            <td className="px-3 py-2 border-r border-gray-200 font-medium">{item.service || item.desc}</td>
                                            <td className="px-3 py-2 text-center border-r border-gray-200">{item.qty}</td>
                                            <td className="px-3 py-2 text-right border-r border-gray-200">{Number(item.price).toFixed(2)}</td>
                                            <td className="px-3 py-2 text-right border-r border-gray-200">{Number(item.disc || 0).toFixed(0)}</td>
                                            <td className="px-3 py-2 text-right">{((item.price * item.qty) - (item.disc || 0)).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {/* Empty rows filler if needed */}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-4 text-gray-400">No services added</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment Section - EWallet Tender */}
                    <div className="w-64 border border-[#0ea5e9] rounded-none overflow-hidden">
                        <div className="bg-white p-2 border-b border-[#0ea5e9]">
                            <span className="text-xs font-bold text-[#0ea5e9] uppercase">EWALLET TENDER</span>
                        </div>
                        <div className="p-3 bg-white">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-[#f43f5e] text-white p-1.5 rounded-none text-xs">
                                    <Share2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1 text-right text-gray-500 text-sm italic">{paymentMethod}</div>
                            </div>
                            <div className="flex items-stretch border border-gray-300 rounded-none overflow-hidden">
                                <div className="bg-[#333] text-white px-3 py-2 text-sm font-bold flex items-center">INR</div>
                                <div className="flex-1 bg-white px-3 py-2 text-right text-xl font-medium text-gray-700">
                                    {totalAmount.toFixed(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-[350px] bg-white flex flex-col border-l border-gray-200">
                    {/* Customer Profile */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2 overflow-hidden border-2 border-green-200">
                                <User className="w-10 h-10 text-green-600" />
                                {/* Image would go here if available */}
                            </div>
                            <h3 className="font-bold text-gray-800">{customerName}</h3>
                            <p className="text-sm text-gray-500">{customerPhone}</p>
                            <span className={cn(
                                "mt-1 px-4 py-0.5 rounded-none text-white text-xs font-bold",
                                customerStats.isMember ? "bg-purple-500" : "bg-[#f43f5e]"
                            )}>
                                {customerStats.isMember ? "Member" : "Non Member"}
                            </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-y-1 gap-x-4 text-xs">
                            <div className="flex items-center gap-1 text-gray-500">
                                <History className="w-3 h-3" /> No of visit
                            </div>
                            <div className="font-bold text-right">{customerStats.visits}</div>

                            <div className="flex items-center gap-1 text-gray-500">
                                <FileText className="w-3 h-3" /> Total no bill
                            </div>
                            <div className="font-bold text-right">{customerStats.totalBills}</div>

                            <div className="flex items-center gap-1 text-gray-500">
                                <span className="font-bold">%</span> Avg bill total
                            </div>
                            <div className="font-bold text-right">₹{customerStats.avgBill.toFixed(2)}</div>

                            <div className="flex items-center gap-1 text-gray-500">
                                <History className="w-3 h-3" /> Last visit
                            </div>
                            <div className="font-bold text-right text-[#0ea5e9]">{customerStats.lastVisit}</div>

                            <div className="flex items-center gap-1 text-gray-500">
                                <History className="w-3 h-3" /> History
                            </div>
                            <div className="font-bold text-right text-red-500 cursor-pointer">Click Here</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <div className="flex-1 py-2 text-center text-sm font-medium text-gray-500 border-b-2 border-transparent hover:bg-gray-50 cursor-pointer">
                            Discount Details
                        </div>
                        <div className="flex-1 py-2 text-center text-sm font-medium text-white bg-[#1e88e5] border-b-2 border-[#1e88e5]">
                            Bill Details
                        </div>
                    </div>

                    {/* Bill Details Breakdown */}
                    <div className="p-4 flex-1 overflow-y-auto space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-700">Net Sales <span className="text-pink-500 text-xs font-normal">(before Discount)</span></span>
                            <span className="font-bold">₹{subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-xs">
                            <span>Mem - Disc</span>
                            <span>+ ₹0.00</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-xs">
                            <span>Discount</span>
                            <span>+ ₹{totalDiscount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                            <span className="text-gray-500">Discount Total</span>
                            <span className="text-gray-500">- ₹{totalDiscount.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between py-1">
                            <span className="font-bold text-[#0ea5e9]">Net Sales <span className="text-xs font-normal">(- Discount)</span></span>
                            <span className="font-bold text-[#0ea5e9]">₹{(subTotal - totalDiscount).toFixed(2)}</span>
                        </div>



                        <div className="flex justify-between py-1">
                            <span className="font-bold text-[#3b82f6]">Gross Sales</span>
                            <span className="font-bold text-[#3b82f6]">₹{grandTotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-gray-500 text-xs">
                            <span>Wallet Advance</span>
                            <span>+ ₹0.00</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-xs">
                            <span>Advance Amount</span>
                            <span>+ ₹0.00</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                            <span className="text-amber-500">Advance Total</span>
                            <span className="text-amber-500">- ₹0.00</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                            <span className="text-xl font-bold text-[#8b5cf6]">Total</span>
                            <span className="text-xl font-bold text-[#8b5cf6]">₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-14 border-t border-gray-200 bg-white flex items-center justify-between px-4">
                <Button
                    variant="outline"
                    className="bg-amber-400 hover:bg-amber-500 text-white border-none font-medium h-9 rounded-none shadow-sm"
                    onClick={() => onCancel && onCancel(bill.id)}
                >
                    Cancel Bill <History className="w-4 h-4 ml-1" />
                </Button>

                <div className="flex gap-2">
                    <Button
                        onClick={onClose}
                        className="bg-[#f43f5e] hover:bg-[#e11d48] text-white border-none font-medium h-9 rounded-none shadow-sm"
                    >
                        Close X
                    </Button>
                    <Button
                        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-none font-medium h-9 rounded-none shadow-sm"
                    >
                        Add New Bill <Plus className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
