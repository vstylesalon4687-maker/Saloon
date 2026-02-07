"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
    Calendar,
    Search,
    Plus,
    LayoutDashboard,
    PieChart,
    BarChart3,
    CreditCard,
    Tag,
    Printer
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface BillingHomeProps {
    onCreate: () => void;
}

export function BillingHome({ onCreate }: BillingHomeProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [invoices, setInvoices] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]); // New State for expenses
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState<any>(null); // For View modal
    const [showDateFilter, setShowDateFilter] = useState(false); // For calendar filter
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        // Fetch Bills
        const qBills = query(collection(db, "bills"), orderBy("date", "desc"));
        const unsubBills = onSnapshot(qBills, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInvoices(data);
            if (expenses.length > 0) setLoading(false); // optimize loading state logic if needed
        }, (err) => {
            console.error("Bills fetch error:", err);
        });

        // Fetch Expenses for Summary
        const qExpenses = query(collection(db, "expenses"));
        const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setExpenses(data);
            setLoading(false);
        }, (err) => {
            console.error("Expenses fetch error:", err);
            setLoading(false);
        });

        return () => { unsubBills(); unsubExpenses(); };
    }, []);

    const filteredInvoices = invoices.filter(inv => {
        // Search filter
        const matchesSearch = (inv.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.id.includes(searchTerm) ||
            (inv.customerPhone || "").includes(searchTerm);

        // Date filter
        let matchesDate = true;
        if (startDate || endDate) {
            const invDate = inv.date; // Assuming format like "2024-02-07" or similar
            if (startDate && invDate < startDate) matchesDate = false;
            if (endDate && invDate > endDate) matchesDate = false;
        }

        return matchesSearch && matchesDate;
    });

    // Clear date filter
    const handleClearDateFilter = () => {
        setStartDate("");
        setEndDate("");
        setShowDateFilter(false);
    };

    // Derived metrics
    const totalSales = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
    const totalCash = invoices.filter(i => (i.paymentMethod || 'Cash') === 'Cash').reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
    // Calculate actual expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    // Placeholder for advance if not yet implemented in DB
    const totalAdvance = 0;

    // Print Handler
    const handlePrint = (bill: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill #${bill.id.substring(0, 8).toUpperCase()}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                    .header .logo-container { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px; }
                    .header .logo-container img { height: 60px; width: auto; }
                    .header .salon-name { font-size: 28px; font-weight: bold; color: #333; margin: 0; }
                    .header .tagline { font-size: 14px; color: #666; margin: 5px 0; font-style: italic; }
                    .header .invoice-title { font-size: 18px; font-weight: bold; color: #6b46c1; margin-top: 10px; }
                    .bill-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
                    .bill-info div { }
                    .bill-info strong { display: inline-block; width: 120px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .text-right { text-align: right; }
                    .totals { margin-top: 20px; text-align: right; font-size: 14px; }
                    .totals div { margin: 5px 0; }
                    .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
                    .footer { text-align: center; margin-top: 40px; font-size: 12px; border-top: 1px solid #ddd; padding-top: 10px; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-container">
                        <img src="/vstyles-logo.png" alt="VStyles Logo" onerror="this.style.display='none'">
                        <h1 class="salon-name">VStyles Salon</h1>
                    </div>
                    <p class="tagline">Your Style, Our Passion</p>
                    <div class="invoice-title">BILLING INVOICE</div>
                </div>
                <div class="bill-info">
                    <div>
                        <div><strong>Invoice #:</strong> ${bill.id.substring(0, 8).toUpperCase()}</div>
                        <div><strong>Date:</strong> ${bill.date || new Date().toISOString().split('T')[0]}</div>
                        <div><strong>Payment:</strong> ${bill.paymentMethod || 'Cash'}</div>
                    </div>
                    <div>
                        <div><strong>Customer:</strong> ${bill.customerName || 'Walk-in Customer'}</div>
                        <div><strong>Phone:</strong> ${bill.customerPhone || 'N/A'}</div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Staff</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Price</th>
                            <th class="text-right">Disc</th>
                            <th class="text-right">GST</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(bill.items || []).map((item: any) => `
                            <tr>
                                <td>${item.service || item.desc || '-'}</td>
                                <td>${item.staff || '-'}</td>
                                <td class="text-right">${item.qty || 1}</td>
                                <td class="text-right">₹${Number(item.price || 0).toFixed(2)}</td>
                                <td class="text-right">₹${Number(item.disc || 0).toFixed(2)}</td>
                                <td class="text-right">₹${Number(item.gst || 0).toFixed(2)}</td>
                                <td class="text-right">₹${((item.price || 0) * (item.qty || 1) - (item.disc || 0)).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="totals">
                    <div><strong>Sub Total:</strong> ₹${Number(bill.subTotal || 0).toFixed(2)}</div>
                    <div><strong>Discount:</strong> ₹${Number(bill.totalDiscount || 0).toFixed(2)}</div>
                    <div><strong>GST:</strong> ₹${Number(bill.totalGst || 0).toFixed(2)}</div>
                    <div class="grand-total"><strong>Grand Total:</strong> ₹${Number(bill.grandTotal || 0).toFixed(2)}</div>
                </div>
                <div class="footer">
                    <p>This is a computer-generated invoice</p>
                    <p>Thank you for visiting VStyles Salon - Visit us again!</p>
                </div>
                <div class="no-print" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #6b46c1; color: white; border: none; cursor: pointer; font-size: 16px;">Print Bill</button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; cursor: pointer; font-size: 16px; margin-left: 10px;">Close</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        // Auto-trigger print dialog
        setTimeout(() => printWindow.print(), 250);
    };

    // View Handler
    const handleView = (bill: any) => {
        setSelectedBill(bill);
    };

    return (
        <div className="space-y-6 animate-fade-in p-4 bg-gray-50 min-h-screen">
            {/* View Modal */}
            {selectedBill && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBill(null)}>
                    <div className="bg-white rounded-none shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Bill Details - #{selectedBill.id.substring(0, 8).toUpperCase()}</h2>
                            <button onClick={() => setSelectedBill(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        <div className="p-6">
                            {/* Bill Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Customer Name</p>
                                    <p className="text-lg font-bold">{selectedBill.customerName || 'Walk-in Customer'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-lg font-bold">{selectedBill.customerPhone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="text-lg font-bold">{selectedBill.date}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Method</p>
                                    <p className="text-lg font-bold">{selectedBill.paymentMethod || 'Cash'}</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <table className="w-full border-collapse border border-gray-200 mb-6">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-200 px-4 py-2 text-left">Service</th>
                                        <th className="border border-gray-200 px-4 py-2 text-left">Staff</th>
                                        <th className="border border-gray-200 px-4 py-2 text-right">Qty</th>
                                        <th className="border border-gray-200 px-4 py-2 text-right">Price</th>
                                        <th className="border border-gray-200 px-4 py-2 text-right">Disc</th>
                                        <th className="border border-gray-200 px-4 py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedBill.items || []).map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="border border-gray-200 px-4 py-2">{item.service || item.desc}</td>
                                            <td className="border border-gray-200 px-4 py-2">{item.staff || '-'}</td>
                                            <td className="border border-gray-200 px-4 py-2 text-right">{item.qty}</td>
                                            <td className="border border-gray-200 px-4 py-2 text-right">₹{Number(item.price).toFixed(2)}</td>
                                            <td className="border border-gray-200 px-4 py-2 text-right">₹{Number(item.disc || 0).toFixed(2)}</td>
                                            <td className="border border-gray-200 px-4 py-2 text-right font-bold">₹{((item.price * item.qty) - (item.disc || 0)).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="text-right space-y-2">
                                <div className="flex justify-end gap-4">
                                    <span className="text-gray-600">Sub Total:</span>
                                    <span className="font-bold w-32">₹{Number(selectedBill.subTotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <span className="text-gray-600">Discount:</span>
                                    <span className="font-bold w-32">₹{Number(selectedBill.totalDiscount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <span className="text-gray-600">GST:</span>
                                    <span className="font-bold w-32">₹{Number(selectedBill.totalGst || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-end gap-4 text-xl border-t-2 border-gray-300 pt-2 mt-2">
                                    <span className="text-gray-800 font-bold">Grand Total:</span>
                                    <span className="font-bold text-green-600 w-32">₹{Number(selectedBill.grandTotal || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex justify-end gap-3">
                                <Button onClick={() => setSelectedBill(null)} className="bg-gray-500 hover:bg-gray-600 text-white rounded-none">
                                    Close
                                </Button>
                                <Button onClick={() => handlePrint(selectedBill)} className="bg-[#6b46c1] hover:bg-[#553c9a] text-white rounded-none flex items-center gap-2">
                                    <Printer className="w-4 h-4" /> Print Bill
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Sales - Green */}
                <div className="bg-[#48bb78] rounded-none p-4 text-white flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-sm opacity-90 font-medium">Total Sales</p>
                        <h3 className="text-xl md:text-2xl font-bold">₹{totalSales.toFixed(2)}</h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-none">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Cash - Blue */}
                <div className="bg-[#00b5e9] rounded-none p-4 text-white flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-sm opacity-90 font-medium">Total Cash</p>
                        <h3 className="text-xl md:text-2xl font-bold">₹{totalCash.toFixed(2)}</h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-none">
                        <CreditCard className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Advance - Orange */}
                <div className="bg-[#fbbf24] rounded-none p-4 text-white flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-sm opacity-90 font-medium">Total Advance</p>
                        <h3 className="text-xl md:text-2xl font-bold">₹{totalAdvance.toFixed(2)}</h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-none">
                        <Tag className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Expenses - Pink */}
                <div className="bg-[#f687b3] rounded-none p-4 text-white flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-sm opacity-90 font-medium">Total Expenses</p>
                        <h3 className="text-xl md:text-2xl font-bold">₹{totalExpenses.toFixed(2)}</h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-none">
                        <PieChart className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-2">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    {/* Calendar Filter Button */}
                    <div className="relative">
                        <Button
                            onClick={() => setShowDateFilter(!showDateFilter)}
                            className={`${showDateFilter || startDate || endDate ? 'bg-[#6b46c1]' : 'bg-[#4a5568]'} hover:bg-gray-700 text-white flex items-center gap-2 px-4 shadow-sm w-full sm:w-auto justify-center rounded-none`}
                        >
                            <Calendar className="w-4 h-4 text-orange-400" /> CALENDAR
                            {(startDate || endDate) && <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">●</span>}
                        </Button>

                        {/* Date Filter Dropdown */}
                        {showDateFilter && (
                            <div className="absolute top-12 left-0 bg-white border border-gray-300 shadow-xl rounded-none p-4 z-50 w-80">
                                <h3 className="font-bold text-gray-800 mb-3 text-sm">Filter by Date Range</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-600 block mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full border border-gray-300 rounded-none p-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 block mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full border border-gray-300 rounded-none p-2 text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            onClick={handleClearDateFilter}
                                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white rounded-none text-xs h-8"
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            onClick={() => setShowDateFilter(false)}
                                            className="flex-1 bg-[#6b46c1] hover:bg-[#553c9a] text-white rounded-none text-xs h-8"
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Box */}
                    <div className="relative w-full sm:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                            className="w-full pl-10 p-2 border border-gray-300 rounded-none outline-none text-sm bg-white focus:border-blue-500 transition-colors h-10"
                            placeholder="Search by name, phone or ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <Button className="hidden md:flex bg-[#4a5568] hover:bg-gray-700 text-white items-center gap-2 px-4 shadow-sm rounded-none">
                        <LayoutDashboard className="w-4 h-4" /> DASHBOARD
                    </Button>
                    <Button
                        onClick={onCreate}
                        className="bg-[#6b46c1] hover:bg-[#553c9a] text-white flex items-center gap-2 px-6 shadow-sm font-bold w-full md:w-auto justify-center rounded-none"
                    >
                        <Plus className="w-5 h-5" /> NEW
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#334155] text-white uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 whitespace-nowrap">Invoice</th>
                                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                                <th className="px-4 py-3 whitespace-nowrap">Customer</th>
                                <th className="px-4 py-3 whitespace-nowrap">Mob</th>
                                <th className="px-4 py-3 whitespace-nowrap">Staff</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">Total</th>
                                <th className="px-4 py-3 text-center whitespace-nowrap">PayMode</th>
                                <th className="px-4 py-3 text-center whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 text-center whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && <tr><td colSpan={9} className="text-center py-4 text-gray-500">Loading...</td></tr>}
                            {!loading && filteredInvoices.length === 0 && <tr><td colSpan={9} className="text-center py-4 text-gray-500">No invoices found</td></tr>}
                            {!loading && filteredInvoices.map((inv, idx) => (
                                <tr key={inv.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-4 py-2 text-gray-600 font-medium">#{inv.id.substring(0, 6).toUpperCase()}</td>
                                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{inv.date}</td>
                                    <td className="px-4 py-2 text-gray-800 font-semibold">{inv.customerName || 'Walk-in'}</td>
                                    <td className="px-4 py-2 text-gray-600">{inv.customerPhone || '-'}</td>
                                    <td className="px-4 py-2 text-gray-600 text-xs text-center">
                                        {inv.items && inv.items.length > 0 && inv.items[0].staff ? 'Assigned' : '-'}
                                    </td>
                                    <td className="px-4 py-2 text-right text-gray-800 font-bold">₹{Number(inv.grandTotal).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-center text-xs text-gray-500 uppercase">{inv.paymentMethod || 'Cash'}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-1 rounded-none bg-green-100 text-green-700 text-xs font-semibold">Paid</span>
                                    </td>
                                    <td className="px-4 py-2 text-center flex justify-center gap-2">
                                        <Button size="sm" onClick={() => handleView(inv)} className="bg-[#00bcd4] hover:bg-[#00acc1] text-white h-7 px-3 text-xs rounded-none shadow-sm">
                                            View
                                        </Button>
                                        <Button size="sm" onClick={() => handlePrint(inv)} className="bg-[#00bcd4] hover:bg-[#00acc1] text-white h-7 px-2 text-xs rounded-none shadow-sm flex items-center gap-1">
                                            <Printer className="w-3 h-3" /> Print
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
