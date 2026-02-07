<<<<<<< HEAD
"use client";
import { useState, useEffect } from "react";
import {
    Search,
    Calendar,
    Users,
    User,
    CreditCard,
    UserX,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function CustomersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateRange, setDateRange] = useState({ from: "2026-03-01", to: "2026-03-02" });
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Customers
    useEffect(() => {
        const q = query(collection(db, "customers"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setClients(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredClients = clients.filter(c =>
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.mobile || "").includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-fade-in p-4 bg-gray-50 min-h-screen font-sans relative">
            <h1 className="text-xl font-semibold text-gray-700 mb-4 bg-white p-2 rounded shadow-sm inline-block border-l-4 border-blue-500">Clients</h1>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {/* Total Clients - Dark Blue */}
                <div className="bg-[#2d3748] rounded-lg p-3 text-white flex gap-3 items-center shadow-sm">
                    <div className="bg-white/10 p-2 rounded-full"><Users className="w-6 h-6" /></div>
                    <div>
                        <h3 className="text-2xl font-bold leading-none">{clients.length}</h3>
                        <p className="text-xs opacity-80">Total Clients</p>
                    </div>
                </div>
                {/* Male - Green */}
                <div className="bg-[#48bb78] rounded-lg p-3 text-white flex gap-3 items-center shadow-sm">
                    <div className="bg-white/10 p-2 rounded-full"><User className="w-6 h-6" /></div>
                    <div>
                        <h3 className="text-2xl font-bold leading-none">{clients.filter(c => c.gender === 'Male').length}</h3>
                        <p className="text-xs opacity-80">Male</p>
                    </div>
                </div>
                {/* Female - Pink */}
                <div className="bg-[#f687b3] rounded-lg p-3 text-white flex gap-3 items-center shadow-sm">
                    <div className="bg-white/10 p-2 rounded-full"><User className="w-6 h-6" /></div>
                    <div>
                        <h3 className="text-2xl font-bold leading-none">{clients.filter(c => c.gender === 'Female').length}</h3>
                        <p className="text-xs opacity-80">Female</p>
                    </div>
                </div>
                {/* Members - Teal */}
                <div className="bg-[#38b2ac] rounded-lg p-3 text-white flex gap-3 items-center shadow-sm">
                    <div className="bg-white/10 p-2 rounded-full"><CreditCard className="w-6 h-6" /></div>
                    <div>
                        <h3 className="text-2xl font-bold leading-none">{clients.filter(c => c.type === 'Member').length}</h3>
                        <p className="text-xs opacity-80">Members</p>
                    </div>
                </div>
                {/* Non-Members - Gray */}
                <div className="bg-[#4a5568] rounded-lg p-3 text-white flex gap-3 items-center shadow-sm">
                    <div className="bg-white/10 p-2 rounded-full"><UserX className="w-6 h-6" /></div>
                    <div>
                        <h3 className="text-2xl font-bold leading-none">{clients.filter(c => c.type !== 'Member').length}</h3>
                        <p className="text-xs opacity-80">Non-Members</p>
                    </div>
                </div>
                {/* New Clients - Orange */}
                <div className="bg-[#f6ad55] rounded-lg p-3 text-white flex gap-3 items-center shadow-sm">
                    <div className="bg-white/10 p-2 rounded-full"><Clock className="w-6 h-6" /></div>
                    <div>
                        <h3 className="text-2xl font-bold leading-none">{clients.length}</h3>
                        <p className="text-xs opacity-80">New Clients</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded shadow-sm border border-gray-200 relative z-10">
                <div className="flex items-center w-full md:w-1/2">
                    <button className="bg-white border border-gray-300 px-3 py-2 rounded-l hover:bg-gray-50">
                        <Search className="w-4 h-4 text-blue-500" />
                    </button>
                    <input
                        className="w-full border-t border-b border-r border-gray-300 rounded-r px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Search.."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 relative">
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded">
                        {dateRange.from} - {dateRange.to}
                    </span>
                    <Button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className="bg-[#4a5568] hover:bg-gray-700 text-white text-xs font-bold px-4 py-2 h-9 flex items-center gap-2"
                    >
                        <Calendar className="w-4 h-4 text-orange-400" /> CALENDAR
                    </Button>

                    {/* Date Range Filter Popup */}
                    {isCalendarOpen && (
                        <div className="absolute top-12 right-0 bg-white shadow-xl rounded-lg border border-gray-200 p-4 w-72 z-50 animate-in fade-in zoom-in-95">
                            <h3 className="text-sm font-semibold mb-3 text-gray-700 border-b pb-2">Select Date Range</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1">From Date</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded px-2 py-1 text-sm focus:border-blue-500 outline-none"
                                        value={dateRange.from}
                                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1">To Date</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded px-2 py-1 text-sm focus:border-blue-500 outline-none"
                                        value={dateRange.to}
                                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 h-8 text-xs"
                                        onClick={() => setIsCalendarOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                                        onClick={() => setIsCalendarOpen(false)}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Clients List Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#2c5282] text-white">
                            <tr>
                                <th className="px-4 py-3 w-12 text-center">#</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3 text-center">Mobile</th>
                                <th className="px-4 py-3 text-center">Gender</th>
                                <th className="px-4 py-3 text-center">Birthday</th>
                                <th className="px-4 py-3 text-center">Card No</th>
                                <th className="px-4 py-3 text-center">Join Date</th>
                                <th className="px-4 py-3 text-center">Valid Till</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && <tr><td colSpan={8} className="text-center py-4">Loading...</td></tr>}
                            {!loading && filteredClients.length === 0 && <tr><td colSpan={8} className="text-center py-4 text-gray-500">No clients found</td></tr>}
                            {!loading && filteredClients.map((client, idx) => (
                                <tr key={client.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-4 py-3 text-center font-bold text-gray-700">{idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-purple-500 fill-purple-500" />
                                            <span className="font-medium text-gray-700 uppercase text-xs">{client.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{client.mobile}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="bg-[#3182ce] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                            {client.gender}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">{client.dob || '-'}</td>
                                    <td className="px-4 py-3 text-center">{client.cardNo || '-'}</td>
                                    <td className="px-4 py-3 text-center flex justify-center">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-[#38b2ac]" />
                                            <span>{client.joinDate || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">{client.validTill || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

=======
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function CustomersPage() {
    const customers = [
        { id: 1, name: "Alice Johnson", mobile: "9876543210", email: "alice@email.com", visits: 5, lastVisit: "2023-10-15" },
        { id: 2, name: "Bob Wilson", mobile: "9876543211", email: "bob@email.com", visits: 2, lastVisit: "2023-10-12" },
        { id: 3, name: "Carol Smith", mobile: "9876543212", email: "carol@email.com", visits: 12, lastVisit: "2023-10-18" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Customers</h1>
                    <p className="text-gray-500">Manage your client base.</p>
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Customer
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>All Customers</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input placeholder="Search customers..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Contact</th>
                                    <th className="px-6 py-3">Visits</th>
                                    <th className="px-6 py-3">Last Visit</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{customer.mobile}</span>
                                                <span className="text-xs text-gray-500">{customer.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{customer.visits}</td>
                                        <td className="px-6 py-4">{customer.lastVisit}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
>>>>>>> fe145a2ba9e18c235e6d78aaa01bd73397c39c6b
        </div>
    );
}
