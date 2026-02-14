"use client";
import React, { useState, useEffect } from "react";
import {
    Search, User, X, Trash2, Plus,
    History, ChevronDown, Clock, ShoppingCart, Percent, MapPin, Printer, UserPlus, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PaymentModal } from "./PaymentModal";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, where, getDocs, limit, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface CreateBillProps {
    onBack: () => void;
}

export function CreateBill({ onBack }: CreateBillProps) {
    // --- State ---
    const STANDARD_CATEGORIES = ['Hair', 'Skin', 'Makeup', 'Spa', 'Nails', 'Facial', 'Massage', 'Other'];
    const [items, setItems] = useState<any[]>([]);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [catalogTab, setCatalogTab] = useState<'Service' | 'Product' | 'Package'>('Service');
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'details' | 'discount'>('details');
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('percentage');
    const [discountValue, setDiscountValue] = useState(0);
    // Catalog Filtering State
    const [selectedGender, setSelectedGender] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    // Data Sources
    const [employees, setEmployees] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);

    // Customer State
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [foundCustomers, setFoundCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [customerStats, setCustomerStats] = useState({ visits: 0, totalBills: 0, avgBill: 0, lastVisit: '-' });
    const [activeSearchField, setActiveSearchField] = useState<'phone' | 'name' | null>(null);

    // UI/Form State
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Add Item Modal State
    const [addItemType, setAddItemType] = useState<'Service' | 'Product' | 'Package' | null>(null);
    const [newItemData, setNewItemData] = useState({
        name: '',
        code: '',
        price: '',
        category: '',
        gender: 'Unisex',
        duration: '30',
        brand: ''
    });
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Derived Totals
    const subTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const itemDiscountTotal = items.reduce((sum, item) => sum + (Number(item.disc) || 0), 0);
    // Calculate global discount based on type
    const calculatedGlobalDiscount = discountType === 'amount'
        ? discountValue
        : (subTotal - itemDiscountTotal) * (discountValue / 100);

    const totalDiscount = itemDiscountTotal + calculatedGlobalDiscount;
    const grandTotal = Math.max(0, subTotal - totalDiscount);

    // --- Effects ---
    // Fetch Staff, Services, Products, Packages
    useEffect(() => {
        const unsubStaff = onSnapshot(query(collection(db, "staff"), orderBy("firstName")),
            (snap) => setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

        const unsubServices = onSnapshot(collection(db, "services"),
            (snap) => setServices(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        const unsubProducts = onSnapshot(collection(db, "products"),
            (snap) => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        const unsubPackages = onSnapshot(collection(db, "packages"),
            (snap) => setPackages(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        return () => { unsubStaff(); unsubServices(); unsubProducts(); unsubPackages(); };
    }, []);

    // Customer Search Effect
    useEffect(() => {
        const performSearch = async () => {
            const searchTerm = activeSearchField === 'phone' ? customerPhone : customerName;

            const minLength = activeSearchField === 'phone' ? 1 : 2;

            if (!searchTerm || searchTerm.trim().length < minLength) {
                setFoundCustomers([]);
                return;
            }

            setIsSearchingCustomer(true);
            try {
                let q;
                if (activeSearchField === 'phone') {
                    q = query(collection(db, "customers"),
                        where("mobile", ">=", searchTerm),
                        where("mobile", "<=", searchTerm + '\uf8ff'));
                } else {
                    q = query(collection(db, "customers"),
                        where("firstName", ">=", searchTerm.toUpperCase()), // Assuming names are stored uppercase or handled case-insensitively
                        where("firstName", "<=", searchTerm.toUpperCase() + '\uf8ff'));

                    // Fallback or additional check for lowercase if needed, but let's stick to simple first
                    // Note: Original code didn't force uppercase, but typical for business apps. 
                    // Let's try exact match as typed if the previous one didn't enforce it?
                    // The previous code had `customerSearch` which matched both.
                    // For now, let's keep it simple: case-sensitive prefix search.
                }

                const snap = await getDocs(q);
                let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));

                // If searching by name and no results, maybe try lowercase? (optional improvement)
                if (activeSearchField === 'name' && results.length === 0) {
                    const qLower = query(collection(db, "customers"),
                        where("firstName", ">=", searchTerm),
                        where("firstName", "<=", searchTerm + '\uf8ff'));
                    const snapLower = await getDocs(qLower);
                    results = snapLower.docs.map(d => ({ id: d.id, ...d.data() }));
                }

                setFoundCustomers(results);
            } catch (err) {
                console.error("Customer search error:", err);
            } finally {
                setIsSearchingCustomer(false);
            }
        };

        const timer = setTimeout(() => {
            if (activeSearchField) performSearch();
        }, 200);

        return () => clearTimeout(timer);
    }, [customerPhone, customerName, activeSearchField]);

    // Fetch Customer Stats
    // Auto-select customer and fetch stats when phone number matches exactly
    useEffect(() => {
        const fetchCustomerByPhone = async () => {
            const phone = customerPhone?.trim();
            if (!phone || phone.length < 10) return;

            // If we already have a selected customer and the phone matches, don't re-fetch
            if (selectedCustomer && selectedCustomer.mobile === phone) return;

            try {
                const q = query(collection(db, "customers"), where("mobile", "==", phone));
                const snap = await getDocs(q);

                if (!snap.empty) {
                    const custData: any = { id: snap.docs[0].id, ...snap.docs[0].data() };
                    setSelectedCustomer(custData);
                    setCustomerName(`${custData.firstName} ${custData.lastName || ''}`.trim());
                } else {
                    // Only clear if we clearly don't have a match and user is typing? 
                    // No, user might be creating a new one. Don't clear selectedCustomer if null?
                    // If phone doesn't match selectedCustomer, we should probably clear it.
                    if (selectedCustomer && selectedCustomer.mobile !== phone) {
                        setSelectedCustomer(null);
                        setCustomerName(""); // Clear name if phone changed to unknown? Maybe just keep typing.
                    }
                }
            } catch (err) {
                console.error("Error fetching customer by phone:", err);
            }
        };

        const debounce = setTimeout(fetchCustomerByPhone, 300); // 300ms debounce for auto-select
        return () => clearTimeout(debounce);
    }, [customerPhone]);

    // Fetch Customer Stats based on Phone Number
    useEffect(() => {
        const phone = customerPhone?.trim();

        // Reset stats if no valid phone number
        if (!phone || phone.length < 10) {
            setCustomerStats({ visits: 0, totalBills: 0, avgBill: 0, lastVisit: '-' });
            return;
        }

        // Query bills by phone number (works for both registered and walk-in customers)
        const q = query(collection(db, "bills"), where("customerPhone", "==", phone));
        const unsub = onSnapshot(q, (snap) => {
            const bills = snap.docs.map(d => d.data());
            const total = bills.length;
            const totalValue = bills.reduce((sum, b) => sum + (Number(b.grandTotal) || 0), 0);
            const sortedBills = bills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const lastBill = sortedBills[0];

            setCustomerStats({
                visits: total,
                totalBills: total,
                avgBill: total > 0 ? totalValue / total : 0,
                lastVisit: lastBill ? lastBill.date : '-'
            });
        });

        return () => unsub();
    }, [customerPhone]);


    // --- Handlers ---
    const handleAddItem = (item: any) => {
        setItems([...items, {
            id: Date.now(),
            staff: "",
            service: item.desc,
            qty: 1,
            price: Number(item.price) || 0,
            disc: 0,
            code: item.code
        }]);
        setIsCatalogOpen(false);
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        let newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // If updating the first item's staff, apply to all items
        if (index === 0 && field === 'staff') {
            newItems = newItems.map(item => ({ ...item, staff: value }));
        }

        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSelectCustomer = (customer: any) => {
        setSelectedCustomer(customer);
        setCustomerPhone(customer.mobile || "");
        setCustomerName(`${customer.firstName} ${customer.lastName || ''}`.trim());
        setFoundCustomers([]); // Close dropdown
        setActiveSearchField(null);
    };

    const handleSaveBill = async (paymentMethod: string = 'Cash', paymentDetails: any = null) => {
        try {
            let finalCustomerId = selectedCustomer?.id || "walk_in";
            let finalCustomerName = customerName || (selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName || ''}`.trim() : "Walk-in Customer");
            const finalCustomerPhone = customerPhone || (selectedCustomer?.mobile || "");

            // Auto-create customer if not selected but phone is provided
            if (!selectedCustomer && finalCustomerPhone.length >= 10) {
                // Check if exists first to avoid duplicates (though UI tries to find them)
                const qCheck = query(collection(db, "customers"), where("mobile", "==", finalCustomerPhone));
                const snapCheck = await getDocs(qCheck);

                if (!snapCheck.empty) {
                    // Exists, use it
                    finalCustomerId = snapCheck.docs[0].id;
                } else {
                    // Create New Customer
                    const newCustRef = await addDoc(collection(db, "customers"), {
                        firstName: finalCustomerName,
                        lastName: "",
                        mobile: finalCustomerPhone,
                        gender: "Unisex", // Default
                        type: "Non-Member", // Default
                        joinDate: billDate,
                        createdAt: new Date()
                    });
                    finalCustomerId = newCustRef.id;
                }
            }

            // Get Next Invoice Number
            const billsQuery = query(collection(db, "bills"), orderBy("invoiceNo", "desc"), limit(1));
            const billsSnapshot = await getDocs(billsQuery);
            let nextInvoiceNo = 1001; // Start from 1001

            if (!billsSnapshot.empty) {
                const lastBill = billsSnapshot.docs[0].data();
                if (lastBill.invoiceNo) {
                    nextInvoiceNo = Number(lastBill.invoiceNo) + 1;
                }
            }

            await addDoc(collection(db, "bills"), {
                invoiceNo: nextInvoiceNo,
                date: billDate,
                customerId: finalCustomerId,
                customerName: finalCustomerName,
                customerPhone: finalCustomerPhone,
                items,
                subTotal,
                totalDiscount,
                globalDiscount: calculatedGlobalDiscount,
                discountType,
                discountValue,
                grandTotal,
                createdAt: new Date(),
                paymentMethod: paymentMethod, // Use the passed method
                paymentDetails: paymentDetails // Save full details logic
            });
            // Reset form for next bill
            setItems([]);
            setCustomerPhone("");
            setCustomerName("");
            setSelectedCustomer(null);
            setCustomerStats({ visits: 0, totalBills: 0, avgBill: 0, lastVisit: '-' });
            setGlobalDiscount(0);
            setDiscountValue(0);
            setDiscountType('percentage');
            setActiveTab('details');
            setBillDate(new Date().toISOString().split('T')[0]);

            // Navigate back to billing home page
            onBack();
        } catch (error) {
            console.error("Error saving bill:", error);
        }
    };

    const handleSaveNewItem = async () => {
        if (!newItemData.name || !newItemData.price) {
            alert("Name and Price are required.");
            return;
        }

        try {
            const collectionName = addItemType === 'Service' ? 'services' : addItemType === 'Product' ? 'products' : 'packages';

            // Construct payload based on type
            const basePayload = {
                desc: newItemData.name,
                code: newItemData.code || `${addItemType?.substring(0, 1).toUpperCase()}-${Date.now().toString().slice(-4)}`,
                price: Number(newItemData.price),
                category: newItemData.category,
                // Only update createdAt if it's a new item, or maybe better to have updatedAt? Keeping simple.
            };

            let payload: any = { ...basePayload };

            if (!editingItemId) {
                payload.createdAt = new Date();
            }

            if (addItemType === 'Service') {
                payload = { ...payload, gender: newItemData.gender, duration: newItemData.duration };
            } else if (addItemType === 'Product') {
                payload = { ...payload, brand: newItemData.brand };
            } else if (addItemType === 'Package') {
                // Future: Add included items logic
                payload = { ...payload, gender: newItemData.gender };
            }

            if (editingItemId) {
                await updateDoc(doc(db, collectionName, editingItemId), payload);
            } else {
                await addDoc(collection(db, collectionName), payload);
            }

            setAddItemType(null); // Close modal
            setEditingItemId(null);
            setNewItemData({ name: '', code: '', price: '', category: '', gender: 'Unisex', duration: '30', brand: '' });
            setIsCustomCategory(false);
        } catch (error) {
            console.error("Error saving item:", error);
        }
    };

    const handleEditCatalogItem = (item: any) => {
        setEditingItemId(item.id);
        const type = catalogTab; // Assuming we are editing from the current tab
        setAddItemType(type);

        // Check if category is standard
        const isStandard = STANDARD_CATEGORIES.includes(item.category || '');
        setIsCustomCategory(!isStandard && !!item.category);

        setNewItemData({
            name: item.desc,
            code: item.code,
            price: item.price,
            category: item.category || '',
            gender: item.gender || 'Unisex',
            duration: item.duration || '30',
            brand: item.brand || ''
        });
    };

    const handleDeleteCatalogItem = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            const collectionName = catalogTab === 'Service' ? 'services' : catalogTab === 'Product' ? 'products' : 'packages';
            await deleteDoc(doc(db, collectionName, id));
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    const renderCatalog = () => {
        let data = catalogTab === 'Service' ? services : catalogTab === 'Product' ? products : packages;

        // Extract unique categories from data and merge with standard categories
        const existingCategories = Array.from(new Set(data.map(item => item.category).filter(Boolean)));
        const uniqueCategories = Array.from(new Set(existingCategories)).sort();

        // Filter data
        data = data.filter(item => {
            const matchesSearch = (item.desc || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.code || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGender = !selectedGender || selectedGender === "Select a gender" || item.gender === selectedGender || item.gender === "Unisex";
            const matchesCategory = !selectedCategory || selectedCategory === "Select a category" || item.category === selectedCategory;

            return matchesSearch && matchesGender && matchesCategory;
        });

        return (
            <div className="flex flex-col h-full bg-card p-4 text-xs">
                {/* Top Controls Row 1: Tabs & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                    {/* Tabs */}
                    <div className="flex gap-1 items-center">
                        {['Service', 'Product', 'Package'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setCatalogTab(tab as any);
                                    setSelectedCategory('');
                                }}
                                className={cn(
                                    "px-4 py-2 font-medium border transition-colors text-xs rounded-t-xl",
                                    catalogTab === tab
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-card text-muted-foreground border-border hover:bg-accent'
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                        <Button
                            className="h-7 px-3 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white ml-2 shadow-sm border border-emerald-700 rounded-lg"
                            onClick={() => {
                                setAddItemType(catalogTab);
                                setNewItemData({ name: '', code: '', price: '', category: '', gender: 'Unisex', duration: '30', brand: '' });
                            }}
                        >
                            <Plus className="w-2.5 h-2.5 mr-1" /> Add {catalogTab}
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <select
                                className="appearance-none border border-input px-3 py-1.5 pr-6 text-xs text-foreground bg-card outline-none focus:border-ring rounded-lg min-w-[120px] h-8"
                                value={selectedGender}
                                onChange={(e) => setSelectedGender(e.target.value)}
                            >
                                <option value="">Select a gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Unisex">Unisex</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                className="appearance-none border border-input px-3 py-1.5 pr-6 text-xs text-foreground bg-card outline-none focus:border-ring rounded-lg min-w-[130px] h-8"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Select a category</option>
                                {uniqueCategories.map(cat => (
                                    <option key={String(cat)} value={String(cat)}>{String(cat)}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Top Controls Row 2: Search Input */}
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                    <div className="flex-1 relative flex h-9">
                        <div className="bg-primary w-9 flex items-center justify-center border border-primary rounded-l-xl">
                            <Search className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <Input
                            placeholder="Search"
                            className="rounded-r-xl border-l-0 border-input focus:ring-0 focus:border-primary h-9 shadow-sm text-xs bg-muted/50"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Catalog Table */}
                <div className="flex-1 overflow-auto border border-border bg-card rounded-xl">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-accent text-accent-foreground font-bold sticky top-0 z-10">
                            <tr>
                                <th className="p-3 w-10 text-center"></th>
                                <th className="p-3">Code</th>
                                <th className="p-3">Desc</th>
                                <th className="p-3 text-right">Price</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {/* Loading / Empty States */}
                            {services.length === 0 && products.length === 0 && (
                                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading catalog data...</td></tr>
                            )}

                            {data.map((item, idx) => {
                                // Generate a color based on index or content for variety
                                const colorClass = ['bg-purple-500', 'bg-blue-500', 'bg-gray-500', 'bg-green-500', 'bg-red-500', 'bg-orange-500'][idx % 6];
                                const letter = item.desc ? item.desc.charAt(0).toUpperCase() : '?';

                                return (
                                    <tr key={idx} className="hover:bg-accent/50 cursor-pointer transition-colors group" onClick={() => handleAddItem(item)}>
                                        <td className="p-1.5 text-center">
                                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm mx-auto", colorClass)}>
                                                {letter}
                                            </div>
                                        </td>
                                        <td className="p-1.5 font-medium text-muted-foreground group-hover:text-primary">{item.code || `P-${idx}`}</td>
                                        <td className="p-1.5 font-bold text-foreground">{item.desc}</td>
                                        <td className="p-1.5 text-right font-medium">{item.price}</td>
                                        <td className="p-1.5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 hover:bg-blue-100 text-blue-600 rounded-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditCatalogItem(item);
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 hover:bg-red-100 text-red-600 rounded-full"
                                                    onClick={(e) => handleDeleteCatalogItem(item.id, e)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-sm animate-fade-in relative text-foreground">
            {/* Top Tabs */}
            <div className="bg-card flex border-b border-border shadow-sm sticky top-0 z-20">
                <div className="px-6 py-3 text-muted-foreground font-medium cursor-pointer hover:bg-accent transition-colors" onClick={onBack}>
                    Bill Home Page
                </div>
                <div className="px-6 py-3 bg-primary text-primary-foreground font-medium relative flex items-center gap-2">
                    Add Bill
                    <X className="w-4 h-4 cursor-pointer hover:bg-primary-foreground/20 rounded-full" onClick={onBack} />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 p-2 md:p-4 gap-4 overflow-hidden animate-slide-up">
                {/* LEFT MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-card rounded-2xl shadow-sm border border-border overflow-hidden h-full">

                    {/* Header Inputs */}
                    <div className="p-6 bg-white border-b border-gray-100 flex flex-col md:flex-row items-end gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Customer Phone</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                        placeholder="Search or Enter Phone"
                                        value={customerPhone}
                                        onChange={e => {
                                            setCustomerPhone(e.target.value);
                                            setActiveSearchField('phone');
                                            if (!e.target.value) setSelectedCustomer(null);
                                        }}
                                    />
                                    {/* Search Results Dropdown for Phone */}
                                    {activeSearchField === 'phone' && foundCustomers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-lg z-30 max-h-60 overflow-y-auto">
                                            {foundCustomers.map(cust => (
                                                <div
                                                    key={cust.id}
                                                    className="p-3 hover:bg-pink-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                                    onClick={() => handleSelectCustomer(cust)}
                                                >
                                                    <div className="font-bold text-gray-800">{cust.mobile}</div>
                                                    <div className="text-xs text-gray-500">{cust.firstName} {cust.lastName}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Customer Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                        placeholder="Enter Customer Name"
                                        value={customerName}
                                        onChange={e => {
                                            setCustomerName(e.target.value);
                                            setActiveSearchField('name');
                                            if (!e.target.value) setSelectedCustomer(null);
                                        }}
                                    />
                                    {/* Search Results Dropdown for Name */}
                                    {activeSearchField === 'name' && foundCustomers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-lg z-30 max-h-60 overflow-y-auto">
                                            {foundCustomers.map(cust => (
                                                <div
                                                    key={cust.id}
                                                    className="p-3 hover:bg-pink-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                                    onClick={() => handleSelectCustomer(cust)}
                                                >
                                                    <div className="font-bold text-gray-800">{cust.firstName} {cust.lastName}</div>
                                                    <div className="text-xs text-gray-500">{cust.mobile}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-gray-600"
                                        value={billDate}
                                        onChange={e => setBillDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            className="bg-[#db2777] hover:bg-[#be185d] text-white h-[42px] px-6 rounded-lg shadow-sm font-semibold whitespace-nowrap transition-transform active:scale-95"
                            onClick={() => setIsCatalogOpen(true)}
                        >
                            <Plus className="w-5 h-5 mr-1" /> Add Item
                        </Button>
                    </div>

                    {/* Billing Table */}
                    <div className="flex-1 overflow-x-auto bg-white">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-pink-50 text-pink-600 uppercase text-[11px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 min-w-[180px]">Staff</th>
                                    <th className="px-6 py-4">Particulars</th>
                                    <th className="px-6 py-4 text-center">Qty</th>
                                    <th className="px-6 py-4 text-center">Price</th>
                                    <th className="px-6 py-4 text-center">Disc</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                    <th className="px-4 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-muted-foreground italic bg-muted/10">
                                            <div className="flex flex-col items-center gap-2">
                                                <ShoppingCart className="w-8 h-8 opacity-20" />
                                                <p>No items added. Click 'Add Item' to select services.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {items.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-muted/50 transition-colors animate-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                                        <td className="p-2">
                                            <select
                                                className="w-full border-input rounded-xl focus:ring-ring focus:border-ring text-xs p-2 bg-muted/50 focus:bg-background transition-colors"
                                                value={item.staff || ""}
                                                onChange={(e) => handleUpdateItem(idx, 'staff', e.target.value)}
                                            >
                                                <option value="">Select Staff</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`.trim()}>
                                                        {emp.firstName} {emp.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                className="h-9 text-xs font-semibold text-foreground uppercase rounded-xl border-input bg-muted/30"
                                                value={item.service}
                                                readOnly
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                className="h-9 text-xs font-bold text-center rounded-xl border-input bg-muted/50 focus:bg-background w-full"
                                                value={item.qty}
                                                onChange={(e) => handleUpdateItem(idx, 'qty', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                className="h-9 text-xs text-right rounded-xl border-input bg-muted/50 focus:bg-background w-full"
                                                value={item.price}
                                                onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                className="h-9 text-xs text-right rounded-xl border-input bg-muted/50 focus:bg-background w-full"
                                                value={item.disc}
                                                onChange={(e) => handleUpdateItem(idx, 'disc', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                className="h-9 text-xs font-bold text-foreground bg-muted/30 text-right rounded-xl border-input w-full"
                                                value={(item.price * item.qty - (item.disc || 0)).toFixed(0)}
                                                readOnly
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <button
                                                className="w-8 h-8 rounded-lg bg-red-100 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                                                onClick={() => handleRemoveItem(idx)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="w-full lg:w-[350px] flex flex-col gap-4">
                    {/* Customer Profile Card */}
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 relative overflow-hidden hover-lift transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-muted border-4 border-card shadow-md mb-3 flex items-center justify-center relative">
                                {selectedCustomer ? (
                                    <div className="text-2xl font-bold text-muted-foreground">{selectedCustomer.firstName.charAt(0)}</div>
                                ) : (
                                    <User className="w-8 h-8 text-muted-foreground/50" />
                                )}
                                <div className={cn("absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-card", selectedCustomer ? "bg-green-500" : "bg-muted-foreground")}></div>
                            </div>
                            <h3 className="font-bold text-foreground text-xl">
                                {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName || ''}` : customerName || "Guest Customer"}
                            </h3>
                            <p className="text-muted-foreground text-sm font-medium">
                                {selectedCustomer ? selectedCustomer.mobile : customerPhone || "No customer selected"}
                            </p>
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full mt-2 uppercase font-bold tracking-wide", selectedCustomer ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground")}>
                                {selectedCustomer ? "Registered" : "Walk-in"}
                            </span>
                        </div>

                        {/* Customer Stats */}
                        <div className="space-y-3 text-sm text-foreground bg-muted/30 p-4 rounded-xl border border-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>Visits</span>
                                </div>
                                <span className="font-bold text-foreground">{customerStats.visits}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                                    <span>Total Spent</span>
                                </div>
                                <span className="font-bold text-foreground">₹{customerStats.totalBills * customerStats.avgBill}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Percent className="w-4 h-4 text-muted-foreground" />
                                    <span>Avg Bill</span>
                                </div>
                                <span className="font-bold text-foreground">₹{customerStats.avgBill.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>Last Visit</span>
                                </div>
                                <span className="font-bold text-foreground">{customerStats.lastVisit}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bill Summary */}
                    <div className="bg-card rounded-2xl shadow-sm border border-border flex flex-col flex-1 overflow-hidden">
                        <div className="flex border-b border-border">
                            <button
                                onClick={() => setActiveTab('discount')}
                                className={cn("flex-1 py-3 text-xs font-bold transition-colors uppercase tracking-wider outline-none", activeTab === 'discount' ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-muted/50 hover:bg-muted")}
                            >
                                Add Discount
                            </button>
                            <button
                                onClick={() => setActiveTab('details')}
                                className={cn("flex-1 py-3 text-xs font-bold transition-colors uppercase tracking-wider outline-none", activeTab === 'details' ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-muted/50 hover:bg-muted")}
                            >
                                Bill Details
                            </button>
                        </div>

                        {activeTab === 'details' ? (
                            <div className="p-6 space-y-3 flex-1 text-sm bg-card animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="flex justify-between items-center pb-2 border-b border-dashed border-border">
                                    <span className="text-muted-foreground font-medium">Subtotal</span>
                                    <span className="font-bold text-foreground text-lg">₹{subTotal.toFixed(2)}</span>
                                </div>

                                <div className="space-y-1 py-2">
                                    <div className="flex justify-between text-muted-foreground text-xs">
                                        <span>Item Discounts</span>
                                        <span className="text-green-600">- ₹{itemDiscountTotal.toFixed(2)}</span>
                                    </div>
                                    {calculatedGlobalDiscount > 0 && (
                                        <div className="flex justify-between text-muted-foreground text-xs">
                                            <span>Global Discount {discountType === 'percentage' ? `(${discountValue}%)` : ''}</span>
                                            <span className="text-green-600 font-bold">- ₹{calculatedGlobalDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-muted-foreground text-xs pt-1 border-t border-border/50">
                                        <span>Total Discount</span>
                                        <span className="text-green-600 font-bold">- ₹{totalDiscount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t-2 border-accent mt-2 bg-accent/30 -mx-6 -mb-6 p-6">
                                    <span className="text-foreground text-lg font-bold">Total Payable</span>
                                    <span className="text-primary text-3xl font-black">₹{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4 flex-1 text-sm bg-card animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-pink-600 uppercase tracking-wider">Discount Type</label>
                                        <div className="flex bg-white rounded-lg p-1 border border-pink-200">
                                            <button
                                                onClick={() => setDiscountType('amount')}
                                                className={cn("px-3 py-1 text-xs font-bold rounded-md transition-all", discountType === 'amount' ? "bg-pink-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50")}
                                            >
                                                Create Amount (₹)
                                            </button>
                                            <button
                                                onClick={() => setDiscountType('percentage')}
                                                className={cn("px-3 py-1 text-xs font-bold rounded-md transition-all", discountType === 'percentage' ? "bg-pink-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50")}
                                            >
                                                Percentage (%)
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative mt-3">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                                            {discountType === 'amount' ? '₹' : '%'}
                                        </span>
                                        <input
                                            type="number"
                                            value={discountValue || ''}
                                            onChange={e => setDiscountValue(Math.max(0, Number(e.target.value)))}
                                            className="w-full text-2xl font-bold bg-white border border-pink-200 rounded-lg py-3 pl-8 pr-4 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none text-gray-800 placeholder-gray-300"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    {discountType === 'percentage' && (
                                        <div className="mt-2 text-right">
                                            <span className="text-xs font-medium text-pink-600">
                                                = ₹{((subTotal - itemDiscountTotal) * (discountValue / 100)).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="font-semibold text-gray-700 mb-1">Note:</p>
                                    This discount is applied to the subtotal after item discounts.
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-gray-500">Current Grand Total:</span>
                                        <span className="text-xl font-bold text-primary">₹{grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-card border-t border-border">
                            <Button
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 shadow-xl shadow-primary/20 font-bold text-lg rounded-xl transition-transform hover:scale-[1.02]"
                                onClick={() => {
                                    // Validate customer name
                                    const finalCustomerName = customerName || (selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName || ''}`.trim() : "");
                                    if (!finalCustomerName) {
                                        setValidationError("Please enter customer name.");
                                        return;
                                    }

                                    // Validate customer phone
                                    const finalCustomerPhone = customerPhone || (selectedCustomer?.mobile || "");
                                    if (!finalCustomerPhone || finalCustomerPhone.length < 10) {
                                        setValidationError("Please enter a valid customer phone number (minimum 10 digits).");
                                        return;
                                    }

                                    // Validate staff selection
                                    const hasMissingStaff = items.some(item => !item.staff || item.staff === "");
                                    if (hasMissingStaff) {
                                        setValidationError("Please select a staff member for all items.");
                                        return;
                                    }
                                    setIsPaymentModalOpen(true);
                                }}
                                disabled={items.length === 0}
                            >
                                Generate Bill <Printer className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Catalog Modal */}
            <Modal
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                title=""
                className="bg-white"
                variant="drawer-right"
                overlayClassName="bg-transparent backdrop-blur-none"
            >
                {renderCatalog()}
            </Modal>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                totalAmount={grandTotal}
                onConfirm={(method, details) => {
                    setIsPaymentModalOpen(false);
                    handleSaveBill(method, details);
                }}
            />

            {/* Add New Item Modal */}
            <Modal
                isOpen={!!addItemType}
                onClose={() => {
                    setAddItemType(null);
                    setEditingItemId(null);
                    setNewItemData({ name: '', code: '', price: '', category: '', gender: 'Unisex', duration: '30', brand: '' });
                    setIsCustomCategory(false);
                }}
                title={`${editingItemId ? 'Edit' : 'Add New'} ${addItemType}`}
                className="max-w-md w-full bg-card rounded-2xl p-0 border border-border"
            >
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Name / Description <span className="text-red-500">*</span></label>
                        <Input
                            value={newItemData.name}
                            onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                            placeholder={`Enter ${addItemType} Name`}
                            className="bg-muted/50 border-input rounded-xl focus:bg-background"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Code</label>
                            <Input
                                value={newItemData.code}
                                onChange={(e) => setNewItemData({ ...newItemData, code: e.target.value })}
                                placeholder="Auto-generated if empty"
                                className="bg-muted/50 border-input rounded-xl focus:bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Price <span className="text-red-500">*</span></label>
                            <Input
                                type="number"
                                value={newItemData.price}
                                onChange={(e) => setNewItemData({ ...newItemData, price: e.target.value })}
                                placeholder="0.00"
                                className="bg-muted/50 border-input rounded-xl focus:bg-background"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
                        {isCustomCategory ? (
                            <div className="flex gap-2">
                                <Input
                                    autoFocus
                                    value={newItemData.category}
                                    onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
                                    placeholder="Enter Custom Category"
                                    className="bg-muted/50 border-input rounded-xl focus:bg-background"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="px-3"
                                    onClick={() => {
                                        setIsCustomCategory(false);
                                        setNewItemData({ ...newItemData, category: "" });
                                    }}
                                    title="Back to list"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <select
                                className="flex h-10 w-full rounded-xl border border-input bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background text-foreground"
                                value={newItemData.category}
                                onChange={(e) => {
                                    if (e.target.value === "custom_new") {
                                        setIsCustomCategory(true);
                                        setNewItemData({ ...newItemData, category: "" });
                                    } else {
                                        setNewItemData({ ...newItemData, category: e.target.value });
                                    }
                                }}
                            >
                                <option value="">Select Category</option>
                                {Array.from(new Set([...STANDARD_CATEGORIES, ...(addItemType === 'Service' ? services : addItemType === 'Product' ? products : packages).map(i => i.category).filter(Boolean)])).sort().map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option value="custom_new" className="font-bold text-primary">+ Add New Category</option>
                            </select>
                        )}
                    </div>


                    {(addItemType === 'Service' || addItemType === 'Package') && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Gender</label>
                            <div className="flex gap-4 pt-1">
                                {['Male', 'Female', 'Unisex'].map(g => (
                                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            checked={newItemData.gender === g}
                                            onChange={() => setNewItemData({ ...newItemData, gender: g })}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-foreground">{g}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {addItemType === 'Service' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Duration (mins)</label>
                            <Input
                                type="number"
                                value={newItemData.duration}
                                onChange={(e) => setNewItemData({ ...newItemData, duration: e.target.value })}
                                placeholder="30"
                                className="bg-muted/50 border-input rounded-xl focus:bg-background"
                            />
                        </div>
                    )}

                    {addItemType === 'Product' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Brand</label>
                            <Input
                                value={newItemData.brand}
                                onChange={(e) => setNewItemData({ ...newItemData, brand: e.target.value })}
                                placeholder="Brand Name"
                                className="bg-muted/50 border-input rounded-xl focus:bg-background"
                            />
                        </div>
                    )}

                    <div className="flex justify-end pt-4 gap-3 border-t border-border mt-4">
                        <Button variant="outline" className="rounded-xl shadow-sm border-input hover:bg-accent hover:text-accent-foreground" onClick={() => {
                            setAddItemType(null);
                            setEditingItemId(null);
                        }}>Cancel</Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm" onClick={handleSaveNewItem}>
                            {editingItemId ? 'Update' : 'Save'} {addItemType}
                        </Button>
                    </div>
                </div>
            </Modal >

            {/* Validation Error Modal */}
            <Modal
                isOpen={!!validationError}
                onClose={() => setValidationError(null)}
                title="Validation Error"
                className="max-w-md"
            >
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-foreground">{validationError}</p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={() => setValidationError(null)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
                        >
                            OK
                        </Button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
