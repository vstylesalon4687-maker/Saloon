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
        <div className="min-h-screen bg-gray-50 p-6 font-sans animate-fade-in relative">
            {/* Header / Title Area */}
            <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-700">
                    Employee Wise Sales
                </h1>
                <Link href="/" className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1 mt-1">
                    Back To Home <ArrowLeft className="w-3 h-3" />
                </Link>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4">
                <Button className="bg-[#4a5568] hover:bg-gray-700 text-white flex items-center gap-2 px-4 shadow-sm">
                    <Calendar className="w-4 h-4 text-orange-400" /> CALENDAR
                </Button>
                <div className="flex gap-2">
                    <Button className="bg-[#fbbf24] hover:bg-yellow-500 text-white w-10 h-10 p-2 rounded shadow-sm">
                        <Download className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-[#fff9c4] text-gray-800 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3"></th>
                                <th className="px-4 py-3">Employee<br />Code</th>
                                <th className="px-4 py-3">Employee<br />Name</th>
                                <th className="px-4 py-3">Item<br />Count</th>
                                <th className="px-4 py-3">Total<br />Sales</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading && <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>}
                            {!loading && salesData.length === 0 && <tr><td colSpan={5} className="text-center py-4">No sales data found</td></tr>}
                            {!loading && salesData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className={`w-8 h-8 rounded-full ${row.color || 'bg-blue-500'} text-white flex items-center justify-center font-bold text-xs`}>
                                            {row.name ? row.name.charAt(0) : ""}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 font-medium">{row.code}</td>
                                    <td className="px-4 py-3 text-gray-800 font-semibold">{row.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{row.billCount}</td>
                                    <td className="px-4 py-3 text-gray-800 font-bold">₹{row.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
