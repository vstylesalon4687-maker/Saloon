"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Calendar, Clock, Search, Plus, Receipt, Edit, Eye, Save, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
import { Modal } from "@/components/ui/Modal";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All Open Appointments");
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        clientName: "",
        employee: "",
        type: "Walk-in",
        services: "",
        apptDate: new Date().toISOString().split('T')[0],
        total: 0,
        status: "Open"
    });

    // Fetch appointments from Firebase
    useEffect(() => {
        const q = query(collection(db, "appointments"), orderBy("apptDate", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAppointments(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching appointments:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch staff from Firebase
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "staff"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setStaff(data);
        }, (error) => {
            console.error("Error fetching staff:", error);
        });
        return () => unsubscribe();
    }, []);

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const todayTotal = appointments.filter(a => a.apptDate === today).length;
    const openToday = appointments.filter(a => a.apptDate === today && a.status === 'Open').length;
    const advanceAppt = appointments.filter(a => a.apptDate > today).length;
    const upcoming = appointments.filter(a => a.status === 'Upcoming').length;

    // Filter appointments
    const filteredAppointments = appointments.filter(appt => {
        const matchesSearch =
            (appt.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (appt.employee || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (appt.id || '').toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        if (filter === "All Open Appointments") {
            matchesFilter = appt.status === 'Open';
        }

        return matchesSearch && matchesFilter;
    });


    const handleSave = async () => {
        try {
            // Generate appointment number based on count
            const apptNumber = appointments.length + 1;

            await addDoc(collection(db, "appointments"), {
                ...newAppointment,
                apptNumber: apptNumber,
                createdAt: new Date()
            });
            setIsModalOpen(false);
            setNewAppointment({
                clientName: "",
                employee: "",
                type: "Walk-in",
                services: "",
                apptDate: new Date().toISOString().split('T')[0],
                total: 0,
                status: "Open"
            });
        } catch (error) {
            console.error("Error adding appointment:", error);
        }
    };


    return (
        <div className="space-y-6 animate-fade-in p-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Today Total */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px] group">
                    <div className="bg-purple-50 p-3 rounded-full mr-4 text-purple-600 group-hover:scale-110 transition-transform">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{todayTotal}</h3>
                        <p className="text-sm font-medium text-muted-foreground">Today Total</p>
                    </div>
                </div>

                {/* Open Today */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px] group">
                    <div className="bg-teal-50 p-3 rounded-full mr-4 text-teal-600 group-hover:scale-110 transition-transform">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{openToday}</h3>
                        <p className="text-sm font-medium text-muted-foreground">Open Today</p>
                    </div>
                </div>

                {/* Advance Appt */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px] group">
                    <div className="bg-rose-50 p-3 rounded-full mr-4 text-rose-600 group-hover:scale-110 transition-transform">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{advanceAppt}</h3>
                        <p className="text-sm font-medium text-muted-foreground">Advance Appt</p>
                    </div>
                </div>

                {/* Upcoming */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px] group">
                    <div className="bg-amber-50 p-3 rounded-full mr-4 text-amber-600 group-hover:scale-110 transition-transform">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{upcoming}</h3>
                        <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <select
                            className="bg-white border border-input rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-ring"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option>All Open Appointments</option>
                            <option>Today's Appointments</option>
                            <option>Upcoming Appointments</option>
                            <option>Completed</option>
                        </select>

                        <div className="relative flex-1 md:w-96">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New
                        </Button>
                    </div>
                </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-accent text-accent-foreground uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4 text-left">Appt ID</th>
                                <th className="px-6 py-4 text-left">Employee</th>
                                <th className="px-6 py-4 text-left">Client Name</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-left">Services</th>
                                <th className="px-6 py-4 text-left">Appt Date</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                                        Loading appointments...
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredAppointments.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No appointments found
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredAppointments.map((appt) => (
                                <tr key={appt.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">{appt.apptNumber || '-'}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{appt.employee || '-'}</td>
                                    <td className="px-6 py-4 text-foreground">{appt.clientName || '-'}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{appt.type || '-'}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{appt.services || '-'}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{appt.apptDate || '-'}</td>
                                    <td className="px-6 py-4 text-right font-bold text-foreground">
                                        ₹{appt.total || 0}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="text-green-600 hover:text-green-800 transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Appointment Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Appointment"
            >
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Client Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={newAppointment.clientName}
                                onChange={(e) => setNewAppointment({ ...newAppointment, clientName: e.target.value })}
                                placeholder="Enter client name"
                                className="rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Employee
                            </label>
                            <select
                                value={newAppointment.employee}
                                onChange={(e) => setNewAppointment({ ...newAppointment, employee: e.target.value })}
                                className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                            >
                                <option value="">Select Employee</option>
                                {staff.map((emp) => (
                                    <option key={emp.id} value={emp.name || emp.firstName}>
                                        {emp.name || emp.firstName || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Type
                            </label>
                            <select
                                value={newAppointment.type}
                                onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
                                className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                            >
                                <option value="Walk-in">Walk-in</option>
                                <option value="Phone">Phone</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Appointment Date
                            </label>
                            <Input
                                type="date"
                                value={newAppointment.apptDate}
                                onChange={(e) => setNewAppointment({ ...newAppointment, apptDate: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Services
                            </label>
                            <Input
                                value={newAppointment.services}
                                onChange={(e) => setNewAppointment({ ...newAppointment, services: e.target.value })}
                                placeholder="Enter services"
                                className="rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Total Amount
                            </label>
                            <Input
                                type="number"
                                value={newAppointment.total}
                                onChange={(e) => setNewAppointment({ ...newAppointment, total: Number(e.target.value) })}
                                placeholder="0"
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <Button variant="outline" className="rounded-xl" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Appointment
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
