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
        <div className="space-y-6 animate-fade-in p-4 bg-background min-h-screen font-sans relative">

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {/* Total Clients */}
                <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex gap-3 items-center hover:shadow-md transition-all">
                    <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600"><Users className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-xl font-bold leading-none text-foreground">{clients.length}</h3>
                        <p className="text-xs text-muted-foreground font-medium">Total Clients</p>
                    </div>
                </div>
                {/* Male */}
                <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex gap-3 items-center hover:shadow-md transition-all">
                    <div className="bg-teal-50 p-2.5 rounded-xl text-teal-600"><User className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-xl font-bold leading-none text-foreground">{clients.filter(c => c.gender === 'Male').length}</h3>
                        <p className="text-xs text-muted-foreground font-medium">Male</p>
                    </div>
                </div>
                {/* Female */}
                <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex gap-3 items-center hover:shadow-md transition-all">
                    <div className="bg-pink-50 p-2.5 rounded-xl text-pink-600"><User className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-xl font-bold leading-none text-foreground">{clients.filter(c => c.gender === 'Female').length}</h3>
                        <p className="text-xs text-muted-foreground font-medium">Female</p>
                    </div>
                </div>
                {/* Members */}
                <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex gap-3 items-center hover:shadow-md transition-all">
                    <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600"><CreditCard className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-xl font-bold leading-none text-foreground">{clients.filter(c => c.type === 'Member').length}</h3>
                        <p className="text-xs text-muted-foreground font-medium">Members</p>
                    </div>
                </div>
                {/* Non-Members */}
                <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex gap-3 items-center hover:shadow-md transition-all">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-slate-600"><UserX className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-xl font-bold leading-none text-foreground">{clients.filter(c => c.type !== 'Member').length}</h3>
                        <p className="text-xs text-muted-foreground font-medium">Non-Members</p>
                    </div>
                </div>
                {/* New Clients */}
                <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex gap-3 items-center hover:shadow-md transition-all">
                    <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600"><Clock className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-xl font-bold leading-none text-foreground">{clients.length}</h3>
                        <p className="text-xs text-muted-foreground font-medium">New Clients</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-2xl shadow-sm border border-border relative z-10 transition-shadow hover:shadow-md">
                <div className="flex items-center w-full md:w-1/2 relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                        className="w-full bg-muted/50 border border-input rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 relative">
                    <span className="text-sm font-medium text-primary bg-accent px-3 py-1 rounded-xl border border-input">
                        {dateRange.from} - {dateRange.to}
                    </span>
                    <Button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-bold px-4 py-2 h-9 flex items-center gap-2 rounded-xl shadow-sm"
                    >
                        <Calendar className="w-4 h-4 text-primary" /> CALENDAR
                    </Button>

                    {/* Date Range Filter Popup */}
                    {isCalendarOpen && (
                        <div className="absolute top-12 right-0 bg-popover shadow-xl rounded-2xl border border-border p-4 w-72 z-50 animate-in fade-in zoom-in-95">
                            <h3 className="text-sm font-semibold mb-3 text-popover-foreground border-b border-border pb-2">Select Date Range</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">From Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-input rounded-xl px-2 py-1.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring outline-none bg-background"
                                        value={dateRange.from}
                                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">To Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-input rounded-xl px-2 py-1.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring outline-none bg-background"
                                        value={dateRange.to}
                                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 h-8 text-xs rounded-xl border-input hover:bg-accent"
                                        onClick={() => setIsCalendarOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-primary hover:bg-primary/90 h-8 text-xs rounded-xl shadow-sm"
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
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-accent text-accent-foreground uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4 w-12 text-center">#</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4 text-center">Mobile</th>
                                <th className="px-6 py-4 text-center">Gender</th>
                                <th className="px-6 py-4 text-center">Birthday</th>
                                <th className="px-6 py-4 text-center">Card No</th>
                                <th className="px-6 py-4 text-center">Join Date</th>
                                <th className="px-6 py-4 text-center">Valid Till</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading && <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</td></tr>}
                            {!loading && filteredClients.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No clients found</td></tr>}
                            {!loading && filteredClients.map((client, idx) => (
                                <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 text-center font-bold text-foreground">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-purple-50 p-1.5 rounded-full">
                                                <User className="w-4 h-4 text-purple-500 fill-purple-500" />
                                            </div>
                                            <span className="font-medium text-foreground uppercase text-xs">{client.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-muted-foreground text-xs">{client.mobile}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-pink-50 text-pink-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-pink-100">
                                            {client.gender}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-foreground">{client.dob || '-'}</td>
                                    <td className="px-6 py-4 text-center text-foreground">{client.cardNo || '-'}</td>
                                    <td className="px-6 py-4 text-center flex justify-center">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Calendar className="w-4 h-4 opacity-70" />
                                            <span>{client.joinDate || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-foreground">{client.validTill || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
