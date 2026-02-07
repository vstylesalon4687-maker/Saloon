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
        <div className="space-y-6 animate-fade-in p-4 bg-gray-50 min-h-screen">
            <h1 className="text-xl font-semibold text-gray-700 mb-4">Employee</h1>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0284c7] rounded-lg p-4 text-white flex items-center shadow-sm">
                    <div className="bg-white/20 p-3 rounded-full mr-4"><Users className="w-8 h-8" /></div>
                    <div>
                        <h3 className="text-2xl font-bold">{employees.length}</h3>
                        <p className="text-sm opacity-90">Total Employees</p>
                    </div>
                </div>
                <div className="bg-[#10b981] rounded-lg p-4 text-white flex items-center shadow-sm">
                    <div className="bg-white/20 p-3 rounded-full mr-4"><User className="w-8 h-8" /></div>
                    <div>
                        <h3 className="text-2xl font-bold">{employees.filter(e => e.gender === 'Male').length}</h3>
                        <p className="text-sm opacity-90">Male</p>
                    </div>
                </div>
                <div className="bg-[#d946ef] rounded-lg p-4 text-white flex items-center shadow-sm">
                    <div className="bg-white/20 p-3 rounded-full mr-4"><User className="w-8 h-8" /></div>
                    <div>
                        <h3 className="text-2xl font-bold">{employees.filter(e => e.gender === 'Female').length}</h3>
                        <p className="text-sm opacity-90">Female</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-100/50 p-2 rounded-lg">
                <div className="relative w-full md:w-1/2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        className="pl-10 w-full p-2 border border-gray-300 rounded outline-none text-sm bg-white"
                        placeholder="Search.."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button
                    className="bg-[#4f46e5] hover:bg-[#4338ca] text-white flex items-center gap-2 px-6"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-4 h-4" /> NEW
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#1e293b] text-white uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-3">#</th>
                                <th className="px-6 py-3">Emp ID</th>
                                <th className="px-6 py-3">First Name</th>
                                <th className="px-6 py-3">Last Name</th>
                                <th className="px-6 py-3">DOB</th>
                                <th className="px-6 py-3">DOJ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>}
                            {!loading && filteredEmployees.map((emp, index) => (
                                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 font-semibold text-gray-700">{index + 1}</td>
                                    <td className="px-6 py-3 text-[#4f46e5] font-medium">{emp.empId}</td>
                                    <td className="px-6 py-3 text-gray-600 font-medium">{emp.firstName}</td>
                                    <td className="px-6 py-3 text-gray-500">{emp.lastName}</td>
                                    <td className="px-6 py-3 text-gray-500">{emp.dob}</td>
                                    <td className="px-6 py-3 text-gray-500">{emp.doj || emp.createdAt?.seconds ? new Date(emp.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
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
                                className="bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Name</label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="border-yellow-400 focus:ring-yellow-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Mobile Number</label>
                            <Input
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className="border-yellow-400 focus:ring-yellow-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Gender</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-yellow-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
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
                                className="border-gray-200"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Area of Specialization</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-yellow-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
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
                                className="w-full h-10 px-3 rounded-md border border-yellow-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
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
                                className="border-yellow-400 focus:ring-yellow-400"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Address</label>
                            <textarea
                                className="w-full h-20 px-3 py-2 rounded-md border border-yellow-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button className="bg-[#00bcd4] hover:bg-[#00acc1] text-white px-6" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
