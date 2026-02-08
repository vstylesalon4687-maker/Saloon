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
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    const [salesGrowthData, setSalesGrowthData] = useState<any[]>([]);
    const [revenueStreamData, setRevenueStreamData] = useState<any[]>([]);

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

        // Sales Total and Charts Data (from bills)
        const unsubSales = onSnapshot(collection(db, "bills"), (snap) => {
            const total = snap.docs.reduce((sum, doc) => sum + (Number(doc.data().grandTotal) || 0), 0);
            setStats(prev => ({ ...prev, sales: total }));

            // Process Sales Growth Data (by date)
            const salesByDate: { [key: string]: number } = {};
            snap.docs.forEach(doc => {
                const data = doc.data();
                const date = data.date || new Date().toISOString().split('T')[0];
                salesByDate[date] = (salesByDate[date] || 0) + (Number(data.grandTotal) || 0);
            });

            // Convert to chart format and sort by date
            const growthData = Object.entries(salesByDate)
                .map(([date, sales]) => ({ date, sales: Number(sales.toFixed(2)) }))
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(-7); // Last 7 days
            setSalesGrowthData(growthData);

            // Process Revenue Stream Data (by payment method)
            const revenueByMethod: { [key: string]: number } = {};
            snap.docs.forEach(doc => {
                const data = doc.data();
                const method = data.paymentMethod || 'Cash';
                revenueByMethod[method] = (revenueByMethod[method] || 0) + (Number(data.grandTotal) || 0);
            });

            // Convert to chart format
            const streamData = Object.entries(revenueByMethod).map(([name, value]) => ({
                name,
                value: Number(value.toFixed(2))
            }));
            setRevenueStreamData(streamData);
        }, (err) => console.error("Bills fetch error:", err));

        // Appointments (Placeholder for now if collection doesn't exist, will just be 0)
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

    const COLORS = ['#db2777', '#d946ef', '#8b5cf6', '#ec4899', '#f472b6', '#c084fc'];

    return (
        <div className="space-y-6 animate-fade-in p-4 lg:p-6">

            {/* --- TOP ROW CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Services */}
                <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border shadow-sm hover-lift flex items-center min-h-[120px] group transition-all">
                    <div className="bg-blue-50/50 p-4 rounded-full mr-5 text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                        <Anchor className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{stats.services}</h3>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Services</p>
                    </div>
                </div>

                {/* Products */}
                <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border shadow-sm hover-lift flex items-center min-h-[120px] group transition-all">
                    <div className="bg-purple-50/50 p-4 rounded-full mr-5 text-purple-600 group-hover:scale-110 transition-transform shadow-sm">
                        <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{stats.products}</h3>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Products</p>
                    </div>
                </div>

                {/* Customers */}
                <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border shadow-sm hover-lift flex items-center min-h-[120px] group transition-all">
                    <div className="bg-amber-50/50 p-4 rounded-full mr-5 text-amber-600 group-hover:scale-110 transition-transform shadow-sm">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{stats.customers}</h3>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Customers</p>
                    </div>
                </div>

                {/* Sales */}
                <div className="bg-gradient-to-br from-primary to-pink-600 rounded-2xl p-6 shadow-lg hover-lift flex items-center min-h-[120px] group transition-all text-white">
                    <div className="bg-white/20 p-4 rounded-full mr-5 text-white group-hover:scale-110 transition-transform shadow-inner">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold">₹{stats.sales.toFixed(2)}</h3>
                        <p className="text-sm font-medium opacity-90 uppercase tracking-wide">Total Sales</p>
                    </div>
                </div>
            </div>

            {/* --- SECOND ROW (Appointments, Clients, Sales Details) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Appointments Blueprint */}
                <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground">Appointments</h3>
                            <p className="text-xs text-muted-foreground font-medium">Walkin / Phone / Online</p>
                        </div>
                    </div>
                    <div className="w-full space-y-4">
                        <div className="grid grid-cols-3 text-[10px] font-bold text-muted-foreground text-center uppercase tracking-wider bg-muted/30 p-2 rounded-lg">
                            <div>Source</div>
                            <div>Count</div>
                            <div>Status</div>
                        </div>
                        {/* Rows */}
                        <div className="space-y-3">
                            {/* Walkin */}
                            <div className="grid grid-cols-3 items-center text-center text-sm p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-2 justify-center text-muted-foreground font-medium"><User className="w-4 h-4" /> Walk-in</div>
                                <div className="font-bold text-foreground text-lg">{appointments.walkin}</div>
                                <div className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full w-max mx-auto">Active</div>
                            </div>
                            {/* Phone */}
                            <div className="grid grid-cols-3 items-center text-center text-sm p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-2 justify-center text-muted-foreground font-medium"><Phone className="w-4 h-4" /> Phone</div>
                                <div className="font-bold text-foreground text-lg">{appointments.phone}</div>
                                <div className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full w-max mx-auto">Active</div>
                            </div>
                            {/* Online */}
                            <div className="grid grid-cols-3 items-center text-center text-sm p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-2 justify-center text-muted-foreground font-medium"><Globe className="w-4 h-4" /> Online</div>
                                <div className="font-bold text-foreground text-lg">{appointments.online}</div>
                                <div className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full w-max mx-auto">Active</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clients Table */}
                <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all flex flex-col">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground">New Clients</h3>
                            <p className="text-xs text-muted-foreground font-medium">Today's Registrations</p>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
                        <div className="bg-background p-4 rounded-full shadow-sm mb-3">
                            <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold text-foreground mb-1">{stats.customers}</p>
                        <p className="text-sm text-muted-foreground font-medium">
                            {stats.customers > 0 ? "New customers added today" : "No new customers yet"}
                        </p>
                    </div>
                </div>

                {/* Sales Details */}
                <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all flex flex-col">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground">Daily Revenue</h3>
                            <p className="text-xs text-muted-foreground font-medium">Financial Snapshot</p>
                        </div>
                    </div>
                    <div className="space-y-4 flex-1">
                        <div className="bg-gradient-to-r from-background to-muted/50 p-5 rounded-xl border border-border shadow-sm">
                            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider block mb-2">Total Generated</span>
                            <span className="font-mono font-bold text-foreground text-3xl block">₹{stats.sales.toFixed(2)}</span>
                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600">
                                <TrendingUp className="w-3 h-3" /> +12% from yesterday
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM ROW (Charts) --- */}
            {/* --- BOTTOM ROW (Charts) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Growth Chart */}
                <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-border">
                    <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Sales Growth
                    </h3>
                    <div className="h-64">
                        {salesGrowthData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Line type="monotone" dataKey="sales" stroke="#C2185B" strokeWidth={3} dot={{ r: 4, fill: '#C2185B' }} activeDot={{ r: 6 }} name="Sales (₹)" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-muted/30 rounded-xl text-muted-foreground text-sm">
                                No sales data available yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue Stream Chart */}
                <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-border">
                    <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-emerald-500" /> Revenue Stream
                    </h3>
                    <div className="h-64">
                        {revenueStreamData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revenueStreamData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        innerRadius={40}
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={5}
                                    >
                                        {revenueStreamData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => `₹${Number(value).toFixed(2)}`}
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-muted/30 rounded-xl text-muted-foreground text-sm">
                                No revenue data available yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
