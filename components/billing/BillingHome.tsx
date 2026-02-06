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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "bills"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInvoices(data);
            setLoading(false);
        }, (err) => {
            console.error("Bills fetch error:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredInvoices = invoices.filter(inv =>
        (inv.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.includes(searchTerm)
    );

    // Derived metrics for the cards
    // TODO: Ideally these should come from a dedicated stats query or aggregation in a real app, 
    // but calculating from the bills list works for small datasets.
    const totalSales = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
    const totalCash = invoices.filter(i => (i.paymentMethod || 'Cash') === 'Cash').reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
    // Placeholder for other stats as we don't strictly track expenses/advance in the bills yet
    const totalAdvance = 0;
    const totalExpenses = 0;

    return (
        <div className="space-y-6 animate-fade-in p-4 bg-gray-50 min-h-screen">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Sales - Green */}
                <div className="bg-[#48bb78] rounded-lg p-4 text-white flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-sm opacity-90 font-medium">Total Sales</p>
                        <h3 className="text-2xl font-bold">₹{totalSales.toFixed(2)}</h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Cash - Blue */}
                <div className="bg-[#00b5e9] rounded-lg p-4 text-white flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-sm opacity-90 font-medium">Total Cash</p>
                        <h3 className="text-2xl font-bold">₹{totalCash.toFixed(2)}</h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                        <CreditCard className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Advance - Orange */}
                <div className="bg-[#fbbf24] rounded-lg p-4 text-white flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-sm opacity-90 font-medium">Total Advance</p>
                        <h3 className="text-2xl font-bold">₹{totalAdvance.toFixed(2)}</h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                        <Tag className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Expenses - Pink */}
                <div className="bg-[#f687b3] rounded-lg p-4 text-white flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-sm opacity-90 font-medium">Total Expenses</p>
                        <h3 className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                        <PieChart className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-2">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button className="bg-[#4a5568] hover:bg-gray-700 text-white flex items-center gap-2 px-4 shadow-sm">
                        <Calendar className="w-4 h-4 text-orange-400" /> CALENDAR
                    </Button>
                    <div className="relative flex-1 md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                            className="w-full pl-10 p-2 border border-gray-300 rounded outline-none text-sm bg-white focus:border-blue-500 transition-colors h-10"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button className="bg-[#4a5568] hover:bg-gray-700 text-white flex items-center gap-2 px-4 shadow-sm">
                        <LayoutDashboard className="w-4 h-4" /> DASHBOARD
                    </Button>
                    <Button
                        onClick={onCreate}
                        className="bg-[#6b46c1] hover:bg-[#553c9a] text-white flex items-center gap-2 px-6 shadow-sm font-bold"
                    >
                        <Plus className="w-5 h-5" /> NEW
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#334155] text-white uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3">Invoice</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Mob</th>
                                <th className="px-4 py-3">Staff</th>
                                <th className="px-4 py-3 text-right">Total</th>
                                <th className="px-4 py-3 text-center">PayMode</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && <tr><td colSpan={9} className="text-center py-4 text-gray-500">Loading...</td></tr>}
                            {!loading && filteredInvoices.length === 0 && <tr><td colSpan={9} className="text-center py-4 text-gray-500">No invoices found</td></tr>}
                            {!loading && filteredInvoices.map((inv, idx) => (
                                <tr key={inv.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-4 py-2 text-gray-600 font-medium">#{inv.id.substring(0, 6).toUpperCase()}</td>
                                    <td className="px-4 py-2 text-gray-600">{inv.date}</td>
                                    <td className="px-4 py-2 text-gray-800 font-semibold">{inv.customerName || 'Walk-in'}</td>
                                    <td className="px-4 py-2 text-gray-600">{inv.customerPhone || '8433217211'}</td>
                                    <td className="px-4 py-2 text-gray-600 text-xs">{inv.items?.[0]?.staff ? 'Staff' : 'Vivek'}</td>
                                    <td className="px-4 py-2 text-right text-gray-800 font-bold">₹{Number(inv.grandTotal).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-center text-xs text-gray-500 uppercase">{inv.paymentMethod || 'Cash'}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Paid</span>
                                    </td>
                                    <td className="px-4 py-2 text-center flex justify-center gap-2">
                                        <Button size="sm" className="bg-[#00bcd4] hover:bg-[#00acc1] text-white h-7 px-3 text-xs rounded shadow-sm">
                                            View
                                        </Button>
                                        <Button size="sm" className="bg-[#00bcd4] hover:bg-[#00acc1] text-white h-7 px-2 text-xs rounded shadow-sm flex items-center gap-1">
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
