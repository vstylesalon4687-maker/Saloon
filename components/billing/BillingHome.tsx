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
import { cn } from "@/lib/utils";

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
                    th { background-color: #fce7f3; font-weight: bold; color: #831843; }
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
                    <button onclick="window.print()" style="padding: 10px 20px; background: #db2777; color: white; border: none; cursor: pointer; font-size: 16px; border-radius: 6px;">Print Bill</button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; cursor: pointer; font-size: 16px; margin-left: 10px; border-radius: 6px;">Close</button>
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
        <div className="space-y-6 animate-in p-4 min-h-screen">
            {/* View Modal */}
            {selectedBill && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBill(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                            <table className="w-full border-collapse border border-gray-200 mb-6 rounded-lg overflow-hidden">
                                <thead className="bg-pink-50">
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
                                <Button onClick={() => setSelectedBill(null)} className="bg-gray-500 hover:bg-gray-600 text-white rounded-md">
                                    Close
                                </Button>
                                <Button onClick={() => handlePrint(selectedBill)} className="bg-primary hover:bg-primary/90 text-white rounded-md flex items-center gap-2">
                                    <Printer className="w-4 h-4" /> Print Bill
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Sales */}
                <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-5 border border-border shadow-sm hover-lift flex justify-between items-center group">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider group-hover:text-primary transition-colors">Total Sales</p>
                        <h3 className="text-2xl font-bold text-foreground font-mono mt-1">₹{totalSales.toFixed(2)}</h3>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-6 h-6 text-emerald-500" />
                    </div>
                </div>

                {/* Total Cash */}
                <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-5 border border-border shadow-sm hover-lift flex justify-between items-center group">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider group-hover:text-primary transition-colors">Total Cash</p>
                        <h3 className="text-2xl font-bold text-foreground font-mono mt-1">₹{totalCash.toFixed(2)}</h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                        <CreditCard className="w-6 h-6 text-blue-500" />
                    </div>
                </div>

                {/* Total Advance */}
                <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-5 border border-border shadow-sm hover-lift flex justify-between items-center group">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider group-hover:text-primary transition-colors">Total Advance</p>
                        <h3 className="text-2xl font-bold text-foreground font-mono mt-1">₹{totalAdvance.toFixed(2)}</h3>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                        <Tag className="w-6 h-6 text-amber-500" />
                    </div>
                </div>

                {/* Total Expenses */}
                <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-5 border border-border shadow-sm hover-lift flex justify-between items-center group">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider group-hover:text-primary transition-colors">Total Expenses</p>
                        <h3 className="text-2xl font-bold text-foreground font-mono mt-1">₹{totalExpenses.toFixed(2)}</h3>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                        <PieChart className="w-6 h-6 text-rose-500" />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-2 bg-card p-4 rounded-2xl border border-border shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    {/* Calendar Filter Button */}
                    <div className="relative">
                        <Button
                            onClick={() => setShowDateFilter(!showDateFilter)}
                            className={cn(
                                "flex items-center gap-2 px-4 w-full sm:w-auto justify-center rounded-xl transition-all border border-input h-10 shadow-sm",
                                showDateFilter || startDate || endDate ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'
                            )}
                        >
                            <Calendar className={cn("w-4 h-4", showDateFilter || startDate || endDate ? "text-primary-foreground" : "text-muted-foreground")} />
                            <span className="font-medium">CALENDAR</span>
                            {(startDate || endDate) && <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">●</span>}
                        </Button>

                        {/* Date Filter Dropdown */}
                        {showDateFilter && (
                            <div className="absolute top-12 left-0 bg-popover border border-border shadow-xl rounded-2xl p-4 z-50 w-80 animate-in fade-in zoom-in-95">
                                <h3 className="font-bold text-foreground mb-3 text-sm">Filter by Date Range</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground block mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full border border-input rounded-xl p-2 text-sm focus:ring-ring focus:border-ring bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground block mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full border border-input rounded-xl p-2 text-sm focus:ring-ring focus:border-ring bg-background"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            onClick={handleClearDateFilter}
                                            variant="outline"
                                            className="flex-1 rounded-xl h-9 text-xs"
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            onClick={() => setShowDateFilter(false)}
                                            className="flex-1 rounded-xl h-9 text-xs"
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
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                            className="w-full pl-10 p-2.5 border border-input rounded-xl outline-none text-sm bg-muted/50 focus:border-ring focus:ring-1 focus:ring-ring transition-colors h-10"
                            placeholder="Search by name, phone or ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <Button variant="outline" className="hidden md:flex items-center gap-2 px-4 shadow-sm rounded-xl border-input h-10">
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> DASHBOARD
                    </Button>
                    <Button
                        onClick={onCreate}
                        className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-6 shadow-md shadow-pink-200/20 font-bold w-full md:w-auto justify-center rounded-xl hover:scale-[1.02] transition-transform h-10"
                    >
                        <Plus className="w-5 h-5" /> NEW BILL
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-accent text-accent-foreground uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">Invoice</th>
                                <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                                <th className="px-6 py-4 whitespace-nowrap">Mob</th>
                                <th className="px-6 py-4 whitespace-nowrap">Staff</th>
                                <th className="px-6 py-4 text-right whitespace-nowrap">Total</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">PayMode</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading && <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</td></tr>}
                            {!loading && filteredInvoices.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">No invoices found</td></tr>}
                            {!loading && filteredInvoices.map((inv, idx) => (
                                <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground font-medium">#{inv.id.substring(0, 6).toUpperCase()}</td>
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{inv.date}</td>
                                    <td className="px-6 py-4 text-foreground font-semibold">{inv.customerName || 'Walk-in'}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{inv.customerPhone || '-'}</td>
                                    <td className="px-6 py-4 text-muted-foreground text-xs text-center">
                                        {inv.items && inv.items.length > 0 && inv.items[0].staff ? 'Assigned' : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right text-foreground font-bold">₹{Number(inv.grandTotal).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center text-xs text-muted-foreground uppercase">{inv.paymentMethod || 'Cash'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold border border-green-200">Paid</span>
                                    </td>
                                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                                        <Button size="sm" onClick={() => handleView(inv)} variant="secondary" className="h-8 px-3 text-xs rounded-lg shadow-sm">
                                            View
                                        </Button>
                                        <Button size="sm" onClick={() => handlePrint(inv)} className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3 text-xs rounded-lg shadow-sm flex items-center gap-1">
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
