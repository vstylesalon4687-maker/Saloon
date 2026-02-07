"use client";
import React, { useState, useEffect } from "react";
import {
    Anchor, ShoppingCart, Users, Wallet, Calendar,
    Smartphone, Globe, MoveRight, Phone, User, TrendingUp,
    CreditCard, Banknote
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function Dashboard() {
    const [stats, setStats] = useState({
        services: 0,
        products: 0,
        customers: 0,
        sales: 0
    });
    const [appointments, setAppointments] = useState({
        walkin: 0,
        phone: 0,
        online: 0,
        total: 0
    });

    useEffect(() => {
        // Services Count
        const unsubServices = onSnapshot(collection(db, "services"), (snap) => {
            setStats(prev => ({ ...prev, services: snap.size }));
        }, (err) => console.error("Services fetch error:", err));

        // Products Count
        const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
            setStats(prev => ({ ...prev, products: snap.size }));
        }, (err) => console.error("Products fetch error:", err));

        // Customers Count
        const unsubCustomers = onSnapshot(collection(db, "customers"), (snap) => {
            setStats(prev => ({ ...prev, customers: snap.size }));
        }, (err) => console.error("Customers fetch error:", err));

        // Sales Total (from bills)
        const unsubSales = onSnapshot(collection(db, "bills"), (snap) => {
            const total = snap.docs.reduce((sum, doc) => sum + (Number(doc.data().grandTotal) || 0), 0);
            setStats(prev => ({ ...prev, sales: total }));
        }, (err) => console.error("Bills fetch error:", err));

        // Appointments (Placeholder for now if collection doesn't exist, will just be 0)
        // assuming 'appointments' collection with 'type' field
        const unsubAppointments = onSnapshot(collection(db, "appointments"), (snap) => {
            let walkin = 0, phone = 0, online = 0;
            snap.forEach(doc => {
                const type = (doc.data().type || "").toLowerCase();
                if (type.includes('walk')) walkin++;
                else if (type.includes('phone')) phone++;
                else if (type.includes('online')) online++;
                else walkin++; // Default
            });
            setAppointments({
                walkin,
                phone,
                online,
                total: snap.size
            });
        }, (err) => console.error("Appointments fetch error:", err));

        return () => {
            unsubServices();
            unsubProducts();
            unsubCustomers();
            unsubSales();
            unsubAppointments();
        };
    }, []);

    return (
        <div className="space-y-6 animate-fade-in p-2">

            {/* --- TOP ROW CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Services */}
                <div className="bg-[#26c6da] rounded-lg p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-full mr-4">
                        <Anchor className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{stats.services}</h3>
                        <p className="text-sm opacity-90">Services</p>
                    </div>
                </div>

                {/* Products */}
                <div className="bg-[#ef5350] rounded-lg p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-full mr-4">
                        <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{stats.products}</h3>
                        <p className="text-sm opacity-90">Products</p>
                    </div>
                </div>

                {/* Customers */}
                <div className="bg-[#ffa726] rounded-lg p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-full mr-4">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{stats.customers}</h3>
                        <p className="text-sm opacity-90">Customers</p>
                    </div>
                </div>

                {/* Sales */}
                <div className="bg-[#ff9800] rounded-lg p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-full mr-4">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">₹{stats.sales.toFixed(2)}</h3>
                        <p className="text-sm opacity-90">Sales</p>
                    </div>
                </div>
            </div>

            {/* --- SECOND ROW (Appointments, Customers Table, Sales Details) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Appointments Blueprint (Blue) */}
                <div className="bg-[#1e88e5] rounded-lg p-4 text-white shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-8 h-8" />
                        <div>
                            <h3 className="font-bold text-lg">Appointments</h3>
                            <p className="text-xs opacity-80">Walkin/Phone/Online</p>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="grid grid-cols-4 text-xs font-semibold mb-2 opacity-80 text-center">
                            <div>Req.</div>
                            <div>Appt.</div>
                            <div>Billed</div>
                            <div>Pending</div>
                        </div>
                        {/* Rows */}
                        <div className="space-y-4">
                            {/* Walkin */}
                            <div className="grid grid-cols-4 items-center text-center">
                                <div className="flex justify-center"><User className="w-4 h-4" /></div>
                                <div>{appointments.walkin}</div>
                                <div>{appointments.walkin}</div>
                                <div>0</div>
                            </div>
                            {/* Phone */}
                            <div className="grid grid-cols-4 items-center text-center">
                                <div className="flex justify-center"><Phone className="w-4 h-4" /></div>
                                <div>{appointments.phone}</div>
                                <div>{appointments.phone}</div>
                                <div>0</div>
                            </div>
                            {/* Online */}
                            <div className="grid grid-cols-4 items-center text-center">
                                <div className="flex justify-center"><Globe className="w-4 h-4" /></div>
                                <div>{appointments.online}</div>
                                <div>{appointments.online}</div>
                                <div>0</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clients Table (Purple) */}
                <div className="bg-[#8e24aa] rounded-lg p-4 text-white shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <Smartphone className="w-8 h-8" />
                        <div>
                            <h3 className="font-bold text-lg">New Clients</h3>
                            <p className="text-xs opacity-80">Today's Registrations</p>
                        </div>
                    </div>
                    <div className="mt-4 text-center text-xs opacity-80">
                        {stats.customers > 0 ? `${stats.customers} Customers Found` : 'No new customers today'}
                    </div>
                </div>

                {/* Sales Details (Orange) */}
                <div className="bg-[#f4511e] rounded-lg p-4 text-white shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-8 h-8" />
                        <div>
                            <h3 className="font-bold text-lg">Daily Sales</h3>
                            <p className="text-xs opacity-80">Today's Revenue</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {/* Dynamic breakdown could go here */}
                        <div className="flex justify-between items-center bg-white/10 p-2 rounded">
                            <span>Total Sales</span>
                            <span className="font-bold">₹{stats.sales.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM ROW (Chart Placeholders) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" /> Sales Growth
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded text-gray-400 text-sm">
                        Chart will be rendered here based on Bill Data
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-green-500" /> Revenue Stream
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded text-gray-400 text-sm">
                        Chart will be rendered here based on Service/Product Split
                    </div>
                </div>
            </div>
        </div>
    );
}
