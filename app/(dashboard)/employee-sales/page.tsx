"use client";
import React, { useState, useEffect } from "react";
import { Calendar, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function EmployeeSalesPage() {
    const [salesData, setSalesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [staffMap, setStaffMap] = useState<{ [key: string]: any }>({});

    // Fetch Staff first for mapping names
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

    useEffect(() => {
        const q = query(collection(db, "bills"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const empStats: { [key: string]: any } = {};

            snapshot.docs.forEach(doc => {
                const bill = doc.data();
                const items = bill.items || [];

                if (Array.isArray(items)) {
                    items.forEach((item: any) => {
                        const staffId = item.staff;
                        if (staffId) {
                            if (!empStats[staffId]) {
                                const staffInfo = staffMap[staffId] || {};
                                empStats[staffId] = {
                                    code: staffInfo.empId || "Unknown",
                                    name: `${staffInfo.firstName || 'Unknown'} ${staffInfo.lastName || ''}`.trim(),
                                    billCount: 0,
                                    total: 0,
                                    serviceCount: 0,
                                    color: "bg-blue-500"
                                };
                            }
                            // We count each item as a "service" or part of a bill
                            // If we want unique bill count per employee, we'd need a Set of billIDs.
                            // For simplicity:
                            empStats[staffId].billCount += 1; // Actually item count
                            const itemTotal = (Number(item.price) * Number(item.qty)) - (Number(item.disc) || 0);
                            empStats[staffId].total += itemTotal;
                        }
                    });
                }
            });

            setSalesData(Object.values(empStats));
            setLoading(false);
        }, (err) => {
            console.error("Sales data fetch error:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [staffMap]); // Re-run when staff map loads

    return (
        <div className="min-h-screen bg-background p-6 font-sans animate-fade-in relative text-foreground">
            {/* Header / Title Area */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                    Employee Wise Sales
                </h1>
                <Link href="/" className="text-primary text-sm font-medium hover:underline flex items-center gap-1 mt-1">
                    Back To Home <ArrowLeft className="w-3 h-3" />
                </Link>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <Button variant="outline" className="flex items-center gap-2 px-4 shadow-sm rounded-xl border-input bg-card hover:bg-accent text-foreground">
                    <Calendar className="w-4 h-4 text-muted-foreground" /> CALENDAR
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm border-input bg-card hover:bg-accent">
                        <Download className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-accent text-accent-foreground text-xs font-semibold uppercase tracking-wider border-b border-border">
                            <tr>
                                <th className="px-6 py-4"></th>
                                <th className="px-6 py-4">Employee<br />Code</th>
                                <th className="px-6 py-4">Employee<br />Name</th>
                                <th className="px-6 py-4">Item<br />Count</th>
                                <th className="px-6 py-4">Total<br />Sales</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {loading && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</td></tr>}
                            {!loading && salesData.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No sales data found</td></tr>}
                            {!loading && salesData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className={`w-9 h-9 rounded-full ${row.color || 'bg-primary'} text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm`}>
                                            {row.name ? row.name.charAt(0) : ""}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground font-medium">{row.code}</td>
                                    <td className="px-6 py-4 text-foreground font-semibold">{row.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{row.billCount}</td>
                                    <td className="px-6 py-4 text-foreground font-bold">₹{row.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
