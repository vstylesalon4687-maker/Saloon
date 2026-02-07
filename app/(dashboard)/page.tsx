<<<<<<< HEAD
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

=======
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CreditCard, IndianRupee, Receipt, Calendar } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back to VStyles Saloon.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-pink-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">₹45,231.89</div>
                        <p className="text-xs text-gray-500 mt-1">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Bills</CardTitle>
                        <Receipt className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">+2,350</div>
                        <p className="text-xs text-gray-500 mt-1">+180.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Today's Sales</CardTitle>
                        <Calendar className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">₹12,234</div>
                        <p className="text-xs text-gray-500 mt-1">+19% from yesterday</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-cyan-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Active Staff</CardTitle>
                        <CreditCard className="h-4 w-4 text-cyan-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">12</div>
                        <p className="text-xs text-gray-500 mt-1">Currently clocked in</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[
                                { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '₹1,999.00', initials: 'OM' },
                                { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '₹2,500.00', initials: 'IN' },
                                { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '₹1,200.00', initials: 'SD' },
                                { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '₹3,400.00', initials: 'JL' },
                                { name: 'William Kim', email: 'will.kim@email.com', amount: '₹950.00', initials: 'WK' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center group cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="h-9 w-9 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                                        <span className="text-pink-600 font-bold text-xs">{item.initials}</span>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-gray-900">{item.name}</p>
                                        <p className="text-xs text-muted-foreground text-gray-500">{item.email}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-gray-900">{item.amount}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle>Top Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {['Hair Cut', 'Facial', 'Hair Color', 'Manicure', 'Pedicure'].map((service, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700">{service}</span>
                                        <span className="text-gray-500">{80 - (i * 10)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full" style={{ width: `${80 - (i * 10)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
>>>>>>> fe145a2ba9e18c235e6d78aaa01bd73397c39c6b
        </div>
    );
}
