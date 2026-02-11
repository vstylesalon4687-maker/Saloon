"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Calendar, CreditCard, X, ChevronRight, ChevronLeft } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

interface CustomerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: any;
    onUpdate?: () => void;
}

export function CustomerProfileModal({ isOpen, onClose, customer, onUpdate }: CustomerProfileModalProps) {
    const [activeTab, setActiveTab] = useState("General Info");
    const [formData, setFormData] = useState<any>({});
    const [stats, setStats] = useState({
        totalSales: 0,
        totalVisits: 0,
        completed: 0,
        cancelled: 0,
        noOfBills: 0,
        reviews: 0
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                firstName: customer.firstName || "",
                lastName: customer.lastName || "",
                mobile: customer.mobile || "",
                email: customer.email || "",
                dob: customer.dob || "",
                country: customer.country || "India",
                nationality: customer.nationality || "Indian",
                workPhone: customer.workPhone || "",
                gender: customer.gender || "Female",
                isWhatsapp: customer.isWhatsapp !== false, // default true
                sendSms: customer.sendSms || false,
                survey: customer.survey || "Others",
                specialInstruction: customer.specialInstruction || false
            });
            fetchStats(customer.mobile);
        }
    }, [customer]);

    const fetchStats = async (phone: string) => {
        if (!phone) return;
        try {
            const q = query(collection(db, "bills"), where("customerPhone", "==", phone));
            const snap = await getDocs(q);
            const bills = snap.docs.map(d => d.data());

            setStats({
                totalSales: bills.reduce((sum, b) => sum + (Number(b.grandTotal) || 0), 0),
                totalVisits: bills.length,
                completed: bills.length, // Assuming all bills are completed for now
                cancelled: 0,
                noOfBills: bills.length,
                reviews: 0
            });
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    const handleSave = async () => {
        if (!customer?.id) return;
        try {
            const customerRef = doc(db, "customers", customer.id);
            await updateDoc(customerRef, {
                ...formData
            });
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error("Error updating customer:", error);
        }
    };

    const StatusCard = ({ label, value, colorClass }: any) => (
        <div className="flex flex-col items-center justify-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group">
            <span className={`text-lg font-bold ${colorClass.text}`}>{value}</span>
            <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700">{label}</span>
        </div>
    );

    const MenuButton = ({ icon: Icon, label, isActive, onClick }: any) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1 ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[600px] flex overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>

                {/* Left Sidebar - Stats */}
                <div className="w-24 bg-white border-r border-gray-200 flex flex-col py-2 overflow-y-auto hidden md:flex scrollbar-hide">
                    <StatusCard label="Total Sales" value={stats.totalSales} colorClass={{ text: 'text-gray-700' }} />
                    <StatusCard label="Total Visits" value={stats.totalVisits} colorClass={{ text: 'text-blue-600' }} />
                    <StatusCard label="Completed" value={stats.completed} colorClass={{ text: 'text-teal-500' }} />
                    <StatusCard label="Cancelled" value={stats.cancelled} colorClass={{ text: 'text-red-500' }} />
                    <StatusCard label="No. of Bills" value={stats.noOfBills} colorClass={{ text: 'text-gray-700' }} />
                    <StatusCard label="Reviews" value={stats.reviews} colorClass={{ text: 'text-gray-700' }} />
                </div>

                {/* Middle Sidebar - Profile & Menu */}
                <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                            {customer.firstName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">{customer.firstName}</h3>
                            <p className="text-xs text-gray-500">{customer.mobile}</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-1">
                        <MenuButton icon={User} label="General Info" isActive={activeTab === "General Info"} onClick={() => setActiveTab("General Info")} />
                        <MenuButton icon={CreditCard} label="Personal Info" isActive={activeTab === "Personal Info"} onClick={() => setActiveTab("Personal Info")} />
                        <MenuButton icon={Calendar} label="Membership Info" isActive={activeTab === "Membership Info"} onClick={() => setActiveTab("Membership Info")} />
                        {/* Add more tabs as needed */}
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 bg-white flex flex-col min-w-0">
                    {/* Header */}
                    <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
                        <h2 className="font-bold text-lg text-gray-800">{activeTab === "General Info" ? "General" : activeTab}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                        <div className="grid grid-cols-1 gap-6 max-w-md">

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500">First Name <span className="text-red-500">*</span></label>
                                <Input
                                    className="w-full border-gray-300 rounded h-10 focus:ring-2 focus:ring-blue-100"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="Enter first name"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500">Mobile <span className="text-red-500">*</span></label>
                                <Input
                                    className="w-full border-gray-300 rounded h-10 bg-yellow-50/50 focus:ring-2 focus:ring-blue-100"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    placeholder="Enter mobile number"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500">E-Mail <span className="text-red-500">*</span></label>
                                <Input
                                    className="w-full border-gray-300 rounded h-10 focus:ring-2 focus:ring-blue-100"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500">Birthday</label>
                                <Input
                                    type="date"
                                    className="w-full border-gray-300 rounded h-10 focus:ring-2 focus:ring-blue-100"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="h-16 border-t border-gray-200 px-8 flex items-center justify-end shrink-0 bg-white">
                        <Button
                            onClick={handleSave}
                            className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-8 h-10 rounded-lg flex items-center gap-2 shadow-sm font-medium transition-transform hover:scale-105"
                        >
                            <div className="w-4 h-4 bg-white/20 rounded-sm flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-[1px]"></div>
                            </div>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
