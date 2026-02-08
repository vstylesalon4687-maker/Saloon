"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
    Users,
    User,
    Search,
    Plus,
    Save
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

export default function StaffPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        empId: '',
        firstName: '',
        lastName: '',
        mobile: '',
        gender: '',
        dob: new Date().toISOString().split('T')[0],
        doj: new Date().toISOString().split('T')[0],
        specialization: '',
        designation: '',
        salary: '',
        address: ''
    });

    // Fetch Employees Real-time
    useEffect(() => {
        const q = query(collection(db, "staff"), orderBy("empId"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as any[];
            setEmployees(data);
            setLoading(false);

            // Auto-generate next ID
            if (data.length > 0) {
                const maxId = Math.max(...data.map(e => parseInt(e.empId || "10000")));
                setFormData(prev => ({ ...prev, empId: (maxId + 1).toString() }));
            } else {
                setFormData(prev => ({ ...prev, empId: '10342' }));
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        try {
            await addDoc(collection(db, "staff"), {
                ...formData,
                firstName: formData.firstName.toUpperCase(), // Normalize
                createdAt: new Date()
            });
            setIsModalOpen(false);
            // Reset form but keep ID logic for next time
            setFormData(prev => ({
                ...prev,
                firstName: '',
                lastName: '',
                mobile: '',
                gender: '',
                salary: '',
                address: ''
            }));
        } catch (error) {
            console.error("Error saving employee:", error);
            alert("Failed to save employee");
        }
    };

    const filteredEmployees = employees.filter(e =>
        (e.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.empId || "").includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-fade-in p-4 bg-background min-h-screen">


            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm transition-shadow hover:shadow-md flex items-center">
                    <div className="bg-purple-50 p-3 rounded-xl mr-4 text-purple-600"><Users className="w-8 h-8" /></div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{employees.length}</h3>
                        <p className="text-sm text-muted-foreground font-medium">Total Employees</p>
                    </div>
                </div>
                {/* Active/Present Placeholder */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm transition-shadow hover:shadow-md flex items-center">
                    <div className="bg-emerald-50 p-3 rounded-xl mr-4 text-emerald-600"><User className="w-8 h-8" /></div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{employees.length}</h3>
                        <p className="text-sm text-muted-foreground font-medium">Active Staff</p>
                    </div>
                </div>
                {/* On Leave Placeholder */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm transition-shadow hover:shadow-md flex items-center">
                    <div className="bg-amber-50 p-3 rounded-xl mr-4 text-amber-600"><User className="w-8 h-8" /></div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">0</h3>
                        <p className="text-sm text-muted-foreground font-medium">On Leave</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm transition-shadow hover:shadow-md">
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        className="pl-10 w-full p-2.5 border border-input rounded-xl outline-none text-sm bg-muted/50 focus:bg-background focus:ring-2 focus:ring-ring transition-colors"
                        placeholder="Search employee..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 px-6 rounded-xl shadow-sm h-10"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-4 h-4" /> ADD NEW
                </Button>
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-accent text-accent-foreground uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Emp ID</th>
                                <th className="px-6 py-4">First Name</th>
                                <th className="px-6 py-4">Last Name</th>
                                <th className="px-6 py-4">DOB</th>
                                <th className="px-6 py-4">DOJ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>}
                            {!loading && filteredEmployees.map((emp, index) => (
                                <tr key={emp.id} className="hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                                    <td className="px-6 py-3 font-semibold text-foreground">{index + 1}</td>
                                    <td className="px-6 py-3 text-primary font-medium">{emp.empId}</td>
                                    <td className="px-6 py-3 text-foreground font-medium">{emp.firstName}</td>
                                    <td className="px-6 py-3 text-muted-foreground">{emp.lastName}</td>
                                    <td className="px-6 py-3 text-muted-foreground">{emp.dob}</td>
                                    <td className="px-6 py-3 text-muted-foreground">{emp.doj || emp.createdAt?.seconds ? new Date(emp.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add / Edit Employee"
                className="max-w-4xl"
            >
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Employee ID</label>
                            <Input
                                value={formData.empId}
                                onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                                className="bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Name</label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="border-gray-200 focus:ring-primary rounded-md"
                                placeholder="First Name"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Mobile Number</label>
                            <Input
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className="border-gray-200 focus:ring-primary rounded-md"
                                placeholder="10-digit mobile"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Gender</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">DOB</label>
                            <Input
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                className="border-gray-200 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Area of Specialization</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                            >
                                <option value="">Select Area</option>
                                <option value="Hair">Hair</option>
                                <option value="Skin">Skin</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Designation</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            >
                                <option value="">Select Designation</option>
                                <option value="Stylist">Stylist</option>
                                <option value="Manager">Manager</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Salary</label>
                            <Input
                                type="number"
                                value={formData.salary}
                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                className="border-gray-200 focus:ring-primary rounded-md"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Address</label>
                            <textarea
                                className="w-full h-20 px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Residential Address"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button className="bg-primary hover:bg-primary/90 text-white px-6 rounded-md shadow-lg shadow-pink-200/50" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
