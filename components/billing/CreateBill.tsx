"use client";
import React, { useState, useEffect } from "react";
import {
    Search, User, X, Trash2, Save, Plus, Store, Package,
    Scissors, Tag, Calendar, Printer, UserPlus, ChevronRight,
    History, CreditCard, ChevronDown, Filter, LogOut, Clock, ShoppingCart, Percent, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PaymentModal } from "./PaymentModal";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { Modal } from "@/components/ui/Modal";

interface CreateBillProps {
    onBack: () => void;
}

export function CreateBill({ onBack }: CreateBillProps) {
    // --- State ---
    const [items, setItems] = useState<any[]>([]); // Start empty or with one placeholder if desired? Image shows one row.
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [catalogTab, setCatalogTab] = useState<'Service' | 'Product' | 'Package'>('Service');
    const [searchTerm, setSearchTerm] = useState("");

    // Data Sources
    const [employees, setEmployees] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);

    // UI/Form State
    const [customerSearch, setCustomerSearch] = useState("8433217211 - vivek");
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Derived Totals
    const subTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalDiscount = items.reduce((sum, item) => sum + (Number(item.disc) || 0), 0);
    const totalGst = items.reduce((sum, item) => sum + (Number(item.gst) || 0), 0); // Simplified GST logic
    const grandTotal = subTotal - totalDiscount + totalGst;

    // --- Effects ---
    // Fetch Staff
    useEffect(() => {
        const q = query(collection(db, "staff"), orderBy("firstName"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (err) => console.error("Staff fetch error:", err));
        return () => unsubscribe();
    }, []);

    // Fetch Catalog
    useEffect(() => {
        const unsubServices = onSnapshot(collection(db, "services"),
            (snap) => setServices(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
            (err) => console.error("Services fetch error:", err));

        const unsubProducts = onSnapshot(collection(db, "products"),
            (snap) => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
            (err) => console.error("Products fetch error:", err));

        const unsubPackages = onSnapshot(collection(db, "packages"),
            (snap) => setPackages(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
            (err) => console.error("Packages fetch error:", err));

        return () => { unsubServices(); unsubProducts(); unsubPackages(); };
    }, []);

    // --- Handlers ---
    const handleAddItem = (item: any) => {
        setItems([...items, {
            id: Date.now(),
            staff: "",
            service: item.desc,
            qty: 1,
            price: Number(item.price) || 0,
            disc: 0,
            gst: Number(item.gst) || 0,
            code: item.code
        }]);
        setIsCatalogOpen(false); // Close catalog after selection? The user might want to select multiple. Let's keep distinct.
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSaveBill = async () => {
        try {
            await addDoc(collection(db, "bills"), {
                date: billDate,
                customerId: "cust_001", // Placeholder
                customerName: "Vivek", // Placeholder
                items,
                subTotal,
                totalDiscount,
                totalGst,
                grandTotal,
                createdAt: new Date()
            });
            onBack();
        } catch (error) {
            console.error("Error saving bill:", error);
        }
    };

    // --- Render Helpers ---
    const renderCatalog = () => {
        // Filter logic could be more robust
        let data = catalogTab === 'Service' ? services : catalogTab === 'Product' ? products : packages;
        data = data.filter(item => (item.desc || "").toLowerCase().includes(searchTerm.toLowerCase()));

        return (
            <div className="flex flex-col h-[70vh]">
                {/* Catalog Header */}
                <div className="flex gap-2 mb-4">
                    {['Service', 'Product', 'Package'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setCatalogTab(tab as any)}
                            className={`px-4 py-2 text-sm font-semibold border ${catalogTab === tab ? 'bg-[#00bcd4] text-white border-[#00bcd4]' : 'bg-white text-gray-600 border-gray-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex gap-2 justify-end">
                            <select className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-600 bg-white outline-none focus:border-[#00bcd4]">
                                <option>Select a gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Unisex</option>
                            </select>
                            <select className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-600 bg-white outline-none focus:border-[#00bcd4]">
                                <option>Select a category</option>
                            </select>
                            <select className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-600 bg-white outline-none focus:border-[#00bcd4]">
                                <option>Select a subcategory</option>
                            </select>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 bg-[#0284c7] w-10 flex items-center justify-center rounded-l">
                                    <Search className="h-5 w-5 text-white" />
                                </div>
                                <Input
                                    placeholder="Search"
                                    className="pl-12 border-yellow-400 focus:ring-yellow-400 rounded-l-none h-10 shadow-sm"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center shadow-sm">
                                <span className="bg-orange-400 text-white px-4 py-2 text-sm font-bold rounded-l h-10 flex items-center">Price</span>
                                <input className="border border-orange-400 rounded-r px-2 py-2 w-24 text-sm outline-none h-10" placeholder="0" />
                            </div>
                            <div className="flex items-center shadow-sm">
                                <span className="bg-gray-600 text-white px-4 py-2 text-sm font-bold rounded-l h-10 flex items-center">M-Price</span>
                                <input className="border border-gray-600 rounded-r px-2 py-2 w-24 text-sm outline-none h-10" placeholder="0" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Catalog List matching Image 1 */}
                <div className="flex-1 overflow-auto bg-white border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#fcf8e3] text-gray-800 font-bold sticky top-0">
                            <tr>
                                <th className="p-3 w-10"></th>
                                <th className="p-3">Code</th>
                                <th className="p-3">Desc</th>
                                <th className="p-3 text-right">Price</th>
                                <th className="p-3 text-right">M-Price</th>
                                <th className="p-3 text-right">GST</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleAddItem(item)}>
                                    <td className="p-2 text-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${['bg-purple-500', 'bg-blue-500', 'bg-gray-500', 'bg-green-500', 'bg-red-500', 'bg-orange-500'][idx % 6]}`}>
                                            {item.desc?.charAt(0)}
                                        </div>
                                    </td>
                                    <td className="p-2 font-medium text-gray-600">{item.code || `ID-${idx}`}</td>
                                    <td className="p-2 font-bold text-gray-700">{item.desc}</td>
                                    <td className="p-2 text-right">{item.price}</td>
                                    <td className="p-2 text-right">{item.price}</td>
                                    <td className="p-2 text-right">{item.gst || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-sm">
            {/* Top Tabs */}
            <div className="bg-gray-200 flex border-b border-gray-300">
                <div className="px-6 py-2 text-gray-600 font-medium cursor-pointer" onClick={onBack}>Bill Home Page</div>
                <div className="px-6 py-2 bg-[#0284c7] text-white font-medium relative flex items-center gap-2">
                    Add Bill
                    <X className="w-4 h-4 cursor-pointer hover:bg-white/20 rounded-full" onClick={onBack} />
                </div>
            </div>

            <div className="flex flex-1 p-2 gap-2 overflow-hidden">
                {/* LEFT MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-white rounded shadow-sm border border-gray-200 h-full">

                    {/* Header Inputs */}
                    <div className="p-4 flex gap-4 items-end border-b">
                        <div className="flex-1">
                            <label className="text-gray-500 text-xs mb-1 block">Customer</label>
                            <div className="flex gap-1">
                                <Input
                                    className="bg-gray-50 border-gray-300 h-9"
                                    value={customerSearch}
                                    onChange={e => setCustomerSearch(e.target.value)}
                                />
                                <Button className="bg-gray-700 hover:bg-gray-800 h-9 px-3"><UserPlus className="w-4 h-4" /></Button>
                            </div>
                        </div>
                        <div className="w-48">
                            <label className="text-gray-500 text-xs mb-1 block">Date</label>
                            <Input
                                type="date"
                                className="bg-gray-50 border-gray-300 h-9"
                                value={billDate}
                                onChange={e => setBillDate(e.target.value)}
                            />
                        </div>
                        <Button
                            className="bg-[#00bcd4] hover:bg-[#00acc1] text-white h-9 px-4 gap-1"
                            onClick={() => setIsCatalogOpen(true)}
                        >
                            Add <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Billing Table */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#334155] text-white">
                                <tr>
                                    <th className="px-4 py-2 font-medium w-1/5">Staff</th>
                                    <th className="px-4 py-2 font-medium w-1/4">Particulars</th>
                                    <th className="px-4 py-2 font-medium w-16">Qty</th>
                                    <th className="px-4 py-2 font-medium w-24">Price</th>
                                    <th className="px-4 py-2 font-medium w-20">Disc</th>
                                    <th className="px-4 py-2 font-medium w-20">Gst</th>
                                    <th className="px-4 py-2 font-medium w-24">Total</th>
                                    <th className="px-4 py-2 font-medium w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-gray-400 italic">
                                            No items added. Click 'Add' to select services.
                                        </td>
                                    </tr>
                                )}
                                {items.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="p-2">
                                            <select
                                                className="w-full border-gray-300 rounded px-2 py-1 text-xs"
                                                value={item.staff}
                                                onChange={(e) => handleUpdateItem(idx, 'staff', e.target.value)}
                                            >
                                                <option value="">Select Employee</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                className="h-8 text-xs font-semibold text-gray-700 uppercase border-transparent hover:border-gray-200"
                                                value={item.service}
                                                readOnly
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                className="h-8 text-xs border-yellow-400 focus:ring-yellow-400 bg-[#fffbeb]"
                                                value={item.qty}
                                                onChange={(e) => handleUpdateItem(idx, 'qty', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                className="h-8 text-xs border-gray-200"
                                                value={item.price}
                                                onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                className="h-8 text-xs border-gray-200"
                                                value={item.disc}
                                                onChange={(e) => handleUpdateItem(idx, 'disc', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                className="h-8 text-xs border-gray-200"
                                                value={item.gst}
                                                readOnly
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                className="h-8 text-xs font-bold text-gray-700 bg-gray-50 border-transparent"
                                                value={(item.price * item.qty - (item.disc || 0)).toFixed(0)}
                                                readOnly
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <button
                                                className="w-6 h-6 rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                                                onClick={() => handleRemoveItem(idx)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="w-[350px] flex flex-col gap-2">
                    {/* Customer Profile Card */}
                    <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-green-500 p-1 mb-2 overflow-hidden relative">
                                <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                                    {/* Placeholder Avatar */}
                                    <User className="w-8 h-8 text-gray-500" />
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">Vivek</h3>
                            <p className="text-gray-500 text-sm">8433217211</p>
                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded mt-1 uppercase font-bold">Non Member</span>
                        </div>

                        {/* Customer Stats */}
                        <div className="space-y-2 text-xs text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="w-24">No of visits</span>
                                <span className="font-bold text-gray-800">5</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-gray-400" />
                                <span className="w-24">Total no bills</span>
                                <span className="font-bold text-gray-800">5</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Percent className="w-4 h-4 text-gray-400" />
                                <span className="w-24">Avg bill value</span>
                                <span className="font-bold text-gray-800">₹113.00</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="w-24">Last visit</span>
                                <span className="font-bold text-gray-800">01/02/2026</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-gray-400" />
                                <span className="w-24">History</span>
                                <span className="text-red-500 underline cursor-pointer font-semibold">Click Here</span>
                            </div>
                        </div>
                    </div>

                    {/* Bill Summary */}
                    <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col flex-1">
                        <div className="flex border-b">
                            <button className="flex-1 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-r">Add Discount</button>
                            <button className="flex-1 py-2 text-xs font-semibold text-white bg-[#0284c7]">Bill Details</button>
                        </div>

                        <div className="p-4 space-y-2 flex-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-red-400 italic font-medium">Net Sales (before Discount)</span>
                                <span className="font-bold text-gray-800">₹{subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Mem - Disc</span>
                                <span>+ ₹0.00</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Discount</span>
                                <span>+ ₹{totalDiscount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium text-gray-700 pt-2 border-t border-dashed">
                                <span>Discount Total</span>
                                <span>- ₹{totalDiscount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[#00bcd4]">
                                <span>Net Sales (- Discount)</span>
                                <span>₹{(subTotal - totalDiscount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-red-500">
                                <span>GST (Tax)</span>
                                <span>+ ₹{totalGst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-[#00bcd4] pt-2 border-t">
                                <span>Gross Sales</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Advance Amount</span>
                                <span>+ ₹0.00</span>
                            </div>
                            <div className="flex justify-between text-orange-400 font-medium">
                                <span>Advance Total</span>
                                <span>- ₹0.00</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 mt-2">
                                <span className="text-[#6366f1] text-xl font-bold">Total</span>
                                <span className="text-[#6366f1] text-xl font-bold">₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t p-2 flex justify-end items-center gap-3">
                <div className="flex items-center gap-2 mr-4">
                    <span className="font-bold text-gray-700">Total</span>
                    <span className="bg-[#6366f1] text-white px-3 py-1 rounded font-bold">₹{grandTotal.toFixed(2)}</span>
                </div>
                <Button variant="destructive" className="bg-red-500 hover:bg-red-600 h-9" onClick={onBack}>
                    Close X
                </Button>
                <Button className="bg-[#00bcd4] hover:bg-[#00acc1] text-white h-9" onClick={() => setIsPaymentModalOpen(true)}>
                    Generate Bill <Printer className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {/* Service Catalog Modal */}
            <Modal
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                title=""
                className="max-w-5xl bg-transparent shadow-none border-none"
            >
                {/* Custom render for the catalog matching the image */}
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {renderCatalog()}
                </div>
            </Modal>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                totalAmount={grandTotal}
                onConfirm={() => {
                    setIsPaymentModalOpen(false);
                    handleSaveBill();
                }}
            />
        </div>
    );
}
