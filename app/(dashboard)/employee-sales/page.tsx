"use client";
import React, { useState, useEffect } from "react";
import { Calendar, ArrowLeft, Download, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";

export default function EmployeeSalesPage() {
    const [allBills, setAllBills] = useState<any[]>([]); // Raw bills
    const [salesData, setSalesData] = useState<any[]>([]); // Processed stats
    const [loading, setLoading] = useState(true);
    const [staffMap, setStaffMap] = useState<{ [key: string]: any }>({});

    // Filter States
    const [filterType, setFilterType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [customRange, setCustomRange] = useState({ start: '', end: '' });

    // Fetch Staff
    useEffect(() => {
        const unsubStaff = onSnapshot(collection(db, "staff"), (snapshot) => {
            const map: { [key: string]: any } = {};
            snapshot.docs.forEach(doc => {
                map[doc.id] = doc.data();
            });
            setStaffMap(map);
        }, (err) => console.error("Staff fetch error:", err));
        return () => unsubStaff();
    }, []);

    // Fetch Bills
    useEffect(() => {
        const q = query(collection(db, "bills"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllBills(bills);
            setLoading(false);
        }, (err) => {
            console.error("Sales data fetch error:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Process Data when bills or filters change
    useEffect(() => {
        if (loading) return;

        // Helper to check date
        const isWithinRange = (billDateVal: any) => {
            if (!billDateVal) return false;

            // Handle Firestore Timestamp or Date string/object
            const d = billDateVal instanceof Timestamp ? billDateVal.toDate() : new Date(billDateVal);
            // Reset times for simplified comparison if needed, or stick to strict range
            const time = d.getTime();

            if (filterType === 'daily') {
                if (!selectedDate) return true;
                const start = new Date(selectedDate); // 00:00 UTC if YYYY-MM-DD? Local usually derived
                // Ensure local midnight matching
                const dayStart = new Date(selectedDate + "T00:00:00");
                const dayEnd = new Date(selectedDate + "T23:59:59.999");
                return time >= dayStart.getTime() && time <= dayEnd.getTime();
            }

            if (filterType === 'weekly') {
                if (!selectedDate) return true;
                // Treat selected date as start of week or part of week
                // Let's assume input type="week" gives "2024-W05" or just pick a date and calculate week
                // If using type="week", value is "YYYY-Www".
                if (selectedDate.includes('W')) {
                    // Parse ISO week... simplifying: Users usually just pick a date range or standard date input
                    // If we switched input to 'week', handle it. 
                    // Let's rely on standard Date input for week start for now or handle ISO week if browser supports
                }

                // Simplified: User picks a date, we show that week (Mon-Sun)?
                // Or let's implement the filter logic based on the input type we render.
                // If we render type="date" for weekly, treat it as Start Date of Week?
                // Let's assume selectedDate is the Start Date.
                const start = new Date(selectedDate + "T00:00:00");
                const end = new Date(start);
                end.setDate(end.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                return time >= start.getTime() && time <= end.getTime();
            }

            if (filterType === 'monthly') {
                if (!selectedDate) return true;
                // Value is "YYYY-MM"
                const [y, m] = selectedDate.split('-').map(Number);
                const start = new Date(y, m - 1, 1, 0, 0, 0);
                const end = new Date(y, m, 0, 23, 59, 59, 999); // Last day of month
                return time >= start.getTime() && time <= end.getTime();
            }

            if (filterType === 'custom') {
                if (!customRange.start || !customRange.end) return true;
                const start = new Date(customRange.start + "T00:00:00");
                const end = new Date(customRange.end + "T23:59:59.999");
                return time >= start.getTime() && time <= end.getTime();
            }

            return true;
        };

        const empStats: { [key: string]: any } = {};

        allBills.forEach((bill: any) => {
            if (!isWithinRange(bill.date)) return;

            const items = bill.items || [];
            if (Array.isArray(items)) {
                items.forEach((item: any) => {
                    const staffId = item.staff || "Unknown";

                    // Normalize staff ID if name was stored instead of ID (legacy/bad data check)
                    // Currently assume names are stored in item.staff? 
                    // Wait, previous code used `staffMap[staffId]`.
                    // CreateBill: `item.staff` stores the NAME from Select value.
                    // Oh, looking at CreateBill: `<option value={`${emp.firstName} ${emp.lastName}`.trim()}>`
                    // So item.staff IS THE NAME, NOT THE ID?
                    // Previous code: `const staffInfo = staffMap[staffId] || {};`
                    // This implies `staffId` was expected to be an ID, but `CreateBill` saves a Name string.
                    // If CreateBill saves Name, then `staffMap` lookups by ID won't work using `item.staff` as key.
                    // However, let's stick to grouping by whatever is in `item.staff`.

                    if (!empStats[staffId]) {
                        // Try to find staff info if we can match name? 
                        // Or just use the name as is since it's the key.
                        empStats[staffId] = {
                            code: "N/A", // Can't easily look up code if we only have name and names aren't unique IDs
                            name: staffId, // The stored value is the name
                            billCount: 0,
                            total: 0,
                            color: "bg-blue-500"
                        };

                        // Helper: try to find matching staff in map to get code/color
                        const foundStaff = Object.values(staffMap).find((s: any) => `${s.firstName} ${s.lastName}`.trim() === staffId);
                        if (foundStaff) {
                            empStats[staffId].code = foundStaff.empId || "N/A";
                            // empStats[staffId].color = ... // if staff had color
                        }
                    }

                    empStats[staffId].billCount += 1;
                    const itemTotal = (Number(item.price) * Number(item.qty)) - (Number(item.disc) || 0);
                    empStats[staffId].total += itemTotal;
                });
            }
        });

        // Convert to array and sort by Total Sales
        const sortedData = Object.values(empStats).sort((a: any, b: any) => b.total - a.total);
        setSalesData(sortedData);

    }, [allBills, filterType, selectedDate, customRange, staffMap, loading]);

    return (
        <div className="min-h-screen bg-background p-6 font-sans animate-fade-in relative text-foreground">
            {/* Header / Title Area */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                    Employee Wise Sales
                </h1>

            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-muted-foreground mr-2" />
                    {['daily', 'weekly', 'monthly', 'custom'].map((type) => (
                        <button
                            key={type}
                            onClick={() => {
                                setFilterType(type as any);
                                // Reset dates slightly for UX?
                                if (type === 'monthly') setSelectedDate(new Date().toISOString().slice(0, 7)); // YYYY-MM
                                else setSelectedDate(new Date().toISOString().split('T')[0]);
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${filterType === type
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {filterType === 'daily' && (
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    )}
                    {filterType === 'weekly' && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Week Starting:</span>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    )}
                    {filterType === 'monthly' && (
                        <input
                            type="month"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    )}
                    {filterType === 'custom' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={customRange.start}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                                className="px-3 py-1.5 rounded-lg border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-32"
                            />
                            <span className="text-muted-foreground">-</span>
                            <input
                                type="date"
                                value={customRange.end}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                                className="px-3 py-1.5 rounded-lg border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-32"
                            />
                        </div>
                    )}
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm border-input bg-card hover:bg-accent ml-2">
                        <Download className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#fdf2f8] text-[#be185d] text-xs font-bold uppercase tracking-wider border-b border-pink-100">
                            <tr>
                                <th className="px-6 py-4"></th>
                                <th className="px-6 py-4">Employee Name</th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4 text-center">Services</th>
                                <th className="px-6 py-4 text-right">Total Sales</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {loading && <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading sales data...</td></tr>}
                            {!loading && salesData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted-foreground italic flex flex-col items-center gap-2">
                                        <Calendar className="w-8 h-8 opacity-20" />
                                        No sales found for this period
                                    </td>
                                </tr>
                            )}
                            {!loading && salesData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-3 w-16">
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                                            {row.name ? row.name.charAt(0).toUpperCase() : "?"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 font-semibold text-gray-700">{row.name}</td>
                                    <td className="px-6 py-3 text-muted-foreground text-xs font-mono">{row.code}</td>
                                    <td className="px-6 py-3 text-center font-medium text-gray-600">{row.billCount}</td>
                                    <td className="px-6 py-3 text-right font-bold text-gray-900">₹{row.total.toFixed(2)}</td>
                                </tr>
                            ))}
                            {/* Grand Total Row */}
                            {!loading && salesData.length > 0 && (
                                <tr className="bg-gray-50/50 font-bold border-t-2 border-border">
                                    <td colSpan={3} className="px-6 py-4 text-right uppercase text-xs tracking-wider text-muted-foreground">Total Period Sales</td>
                                    <td className="px-6 py-4 text-center">{salesData.reduce((acc, curr) => acc + curr.billCount, 0)}</td>
                                    <td className="px-6 py-4 text-right text-lg text-primary">
                                        ₹{salesData.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
