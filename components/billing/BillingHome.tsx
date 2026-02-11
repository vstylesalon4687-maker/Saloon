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
    Printer,
    User,
    Percent
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { BillDetailView } from "./BillDetailView";

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

    // Dashboard Logic State
    const [viewMode, setViewMode] = useState<'list' | 'dashboard'>('list');
    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        const qCustomers = query(collection(db, "customers"));
        const unsubCustomers = onSnapshot(qCustomers, (snapshot) => {
            setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubCustomers();
    }, []);

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

    // Dashboard Metrics Calculation
    const calculateDashboardMetrics = () => {
        let serviceBills = 0;
        let productBills = 0;
        let serviceRevenue = 0;
        let productRevenue = 0;
        let menCount = 0;
        let womenCount = 0;
        let cashSales = 0;
        let cardSales = 0;
        let upiSales = 0;
        let otherSales = 0;
        let totalDiscount = 0;

        filteredInvoices.forEach(inv => {
            const grandTotal = Number(inv.grandTotal) || 0;
            const discount = Number(inv.totalDiscount) || 0;
            totalDiscount += discount;

            let hasService = false;
            let hasProduct = false;
            let invServiceTotal = 0;
            let invProductTotal = 0;

            if (inv.items && Array.isArray(inv.items)) {
                inv.items.forEach((item: any) => {
                    const itemTotal = (Number(item.price) * Number(item.qty)) - (Number(item.disc) || 0);
                    if ((item.code || '').startsWith('P-') || (item.code || '').startsWith('PROD')) {
                        hasProduct = true;
                        invProductTotal += itemTotal;
                    } else {
                        hasService = true;
                        invServiceTotal += itemTotal;
                    }
                });
            } else {
                hasService = true;
                invServiceTotal = grandTotal;
            }

            if (hasService) serviceBills++;
            if (hasProduct) productBills++;

            serviceRevenue += invServiceTotal;
            productRevenue += invProductTotal;

            const method = (inv.paymentMethod || 'Cash').toLowerCase();
            if (method.includes('cash')) cashSales += grandTotal;
            else if (method.includes('card') || method.includes('visa') || method.includes('master')) cardSales += grandTotal;
            else if (method.includes('upi') || method.includes('pay') || method.includes('wallet')) upiSales += grandTotal;
            else otherSales += grandTotal;

            if (inv.customerId) {
                const cust = customers.find(c => c.id === inv.customerId);
                if (cust) {
                    if (cust.gender === 'Male') menCount++;
                    else if (cust.gender === 'Female') womenCount++;
                }
            }
        });

        return {
            serviceBills,
            productBills,
            serviceRevenue,
            productRevenue,
            menCount,
            womenCount,
            cashSales,
            cardSales,
            upiSales,
            otherSales,
            totalDiscount,
            totalBills: filteredInvoices.length
        };
    };

    const metrics = calculateDashboardMetrics();

    // Print Handler
    const handlePrint = (bill: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill #${bill.invoiceNo || bill.id.substring(0, 8).toUpperCase()}</title>
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
                        <div><strong>Invoice #:</strong> ${bill.invoiceNo || bill.id.substring(0, 8).toUpperCase()}</div>
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
                                <td class="text-right">₹${((item.price || 0) * (item.qty || 1) - (item.disc || 0)).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="totals">
                    <div><strong>Sub Total:</strong> ₹${Number(bill.subTotal || 0).toFixed(2)}</div>
                    <div><strong>Discount:</strong> ₹${Number(bill.totalDiscount || 0).toFixed(2)}</div>
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

    if (selectedBill) {
        return <BillDetailView bill={selectedBill} onClose={() => setSelectedBill(null)} />;
    }










    return (
        <div className="space-y-6 animate-in p-4 min-h-screen">
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
                    <Button
                        variant="outline"
                        onClick={() => setViewMode(viewMode === 'list' ? 'dashboard' : 'list')}
                        className={cn("hidden md:flex items-center gap-2 px-4 shadow-sm rounded-xl border-input h-10", viewMode === 'dashboard' ? 'bg-accent text-accent-foreground border-primary' : '')}
                    >
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> {viewMode === 'dashboard' ? 'LIST VIEW' : 'DASHBOARD'}
                    </Button>
                    <Button
                        onClick={onCreate}
                        className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-6 shadow-md shadow-pink-200/20 font-bold w-full md:w-auto justify-center rounded-xl hover:scale-[1.02] transition-transform h-10"
                    >
                        <Plus className="w-5 h-5" /> NEW BILL
                    </Button>
                </div>
            </div>

            {viewMode === 'dashboard' ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up">
                    {/* Row 1: Services & Products */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col items-center flex-1">
                                <div className="bg-white/20 p-2 rounded-lg mb-2"><LayoutDashboard className="w-5 h-5 text-white" /></div>
                                <h3 className="text-3xl font-bold">{metrics.serviceBills}</h3>
                                <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Service Bills</p>
                            </div>
                            <div className="w-px h-12 bg-white/20 mx-2"></div>
                            <div className="flex flex-col items-center flex-1">
                                <div className="bg-white/20 p-2 rounded-lg mb-2"><Tag className="w-5 h-5 text-white" /></div>
                                <h3 className="text-3xl font-bold">{metrics.productBills}</h3>
                                <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Product Bills</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 md:col-span-2 rounded-2xl p-6 text-white text-center shadow-lg flex items-center justify-around">
                        <div className="flex flex-col items-center">
                            <div className="bg-white/20 p-2 rounded-lg mb-2"><BarChart3 className="w-5 h-5 text-white" /></div>
                            <h3 className="text-2xl font-bold">₹{metrics.serviceRevenue.toFixed(0)}</h3>
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Service Net</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">₹{metrics.serviceRevenue.toFixed(0)} Gross</p>
                        </div>
                        <div className="w-px h-16 bg-white/20"></div>
                        <div className="flex flex-col items-center">
                            <div className="bg-white/20 p-2 rounded-lg mb-2"><BarChart3 className="w-5 h-5 text-white" /></div>
                            <h3 className="text-2xl font-bold">₹{metrics.productRevenue.toFixed(0)}</h3>
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Product Net</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">₹{metrics.productRevenue.toFixed(0)} Gross</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white text-center shadow-lg">
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="bg-white/20 p-2 rounded-lg mb-2"><LayoutDashboard className="w-5 h-5 text-white" /></div>
                            <h3 className="text-2xl font-bold">0</h3>
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Product Net</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">0 Gross</p>
                        </div>
                    </div>

                    {/* Row 2: Gender & Cash */}
                    <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
                        <div className="flex gap-4 w-full justify-around">
                            <div className="text-center">
                                <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 text-blue-600 font-bold"><User className="w-5 h-5" /></div>
                                <div className="text-xl font-bold text-blue-900">{metrics.menCount}</div>
                                <div className="text-[10px] font-bold text-blue-400">MEN</div>
                            </div>
                            <div className="text-center">
                                <div className="bg-pink-100 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 text-pink-600 font-bold"><User className="w-5 h-5" /></div>
                                <div className="text-xl font-bold text-pink-900">{metrics.womenCount}</div>
                                <div className="text-[10px] font-bold text-pink-400">WOMEN</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
                        <div className="bg-cyan-50 w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-cyan-600"><CreditCard className="w-6 h-6" /></div>
                        <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Cash Sales</div>
                        <div className="text-2xl font-bold text-cyan-600">₹{metrics.cashSales.toFixed(0)}</div>
                    </div>



                    {/* Payment Types List */}
                    <div className="row-span-2 bg-white border border-border rounded-2xl p-6 shadow-sm">
                        <h4 className="flex items-center gap-2 font-bold text-gray-600 mb-4 text-xs uppercase tracking-wider">
                            <CreditCard className="w-4 h-4 text-primary" /> Payment Methods
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-medium text-gray-700">Cash</span>
                                <span className="font-bold text-indigo-600">₹{metrics.cashSales.toFixed(2)}</span>
                            </div>
                            {metrics.cardSales > 0 && (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">Card</span>
                                    <span className="font-bold text-indigo-600">₹{metrics.cardSales.toFixed(2)}</span>
                                </div>
                            )}
                            {metrics.upiSales > 0 && (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">E-Wallet/UPI</span>
                                    <span className="font-bold text-indigo-600">₹{metrics.upiSales.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-dashed border-gray-200 mt-4 pt-4">
                                <h5 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1 text-center">Overall Advance</h5>
                            </div>
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
                        <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-green-600"><LayoutDashboard className="w-6 h-6" /></div>
                        <div className="text-xl font-bold text-green-700">{metrics.totalBills}</div>
                        <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider">No of Bills</div>
                    </div>

                    <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
                        <div className="bg-red-100 w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-red-600"><LayoutDashboard className="w-6 h-6" /></div>
                        <div className="text-xl font-bold text-red-700">0</div>
                        <div className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Cancelled Bills</div>
                    </div>

                    <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
                        <div className="bg-pink-100 w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-pink-600"><CreditCard className="w-6 h-6" /></div>
                        <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Card Sales</div>
                        <div className="text-xl font-bold text-pink-600">₹{metrics.cardSales.toFixed(0)}</div>
                    </div>

                    <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
                        <div className="bg-sky-100 w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-sky-600"><CreditCard className="w-6 h-6" /></div>
                        <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">E-Wallet</div>
                        <div className="text-xl font-bold text-sky-600">₹{metrics.upiSales.toFixed(0)}</div>
                    </div>

                    {/* Row 4 */}
                    <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
                        <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-amber-600"><Percent className="w-6 h-6" /></div>
                        <div className="text-xl font-bold text-amber-600">{metrics.totalDiscount.toFixed(0)}</div>
                        <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Total Discount</div>
                    </div>
                </div>
            ) : (
                /* Table */
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
                                        <td className="px-6 py-4 text-muted-foreground font-medium">#{inv.invoiceNo || inv.id.substring(0, 6).toUpperCase()}</td>
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
            )}
        </div>
    );
}
